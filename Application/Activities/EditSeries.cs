﻿using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Application.Interfaces;
using Azure.Core;

namespace Application.Activities
{
    public class EditSeries
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Activity Activity
            {
                get;
                set;
            }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IConfiguration _config;
            private readonly IUserAccessor _userAccessor;
            private readonly ICACAccessor _cacAccessor;

            public Handler(DataContext context, IMapper mapper, IConfiguration config, IUserAccessor userAccessor, ICACAccessor cacAccessor)
            {
                _context = context;
                _mapper = mapper;
                _config = config;
                _userAccessor = userAccessor;
                _cacAccessor = cacAccessor;
            
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {

                    Helper.InitHelper(_mapper);
                    var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                    
                   if(!_cacAccessor.IsCACAuthenticated()){
                        var originalHostingReport = _context.HostingReports.AsNoTracking().FirstOrDefault(x => x.ActivityId == request.Activity.Id);
                        request.Activity.HostingReport = originalHostingReport;
                    }

                    DeleteHostingReports(request.Activity.RecurrenceId);

                    var activitiesToBeDeleted = _context.Activities.Where(x => x.RecurrenceId == request.Activity.RecurrenceId);
                    var activityIds = activitiesToBeDeleted.Select(x => x.Id).ToArray();
                    var newActivities = new List<Activity>();


              
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                 if (
                   (
                     string.IsNullOrEmpty(request.Activity.CoordinatorEmail) ||
                     !request.Activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                     )

                  &&
                  (
                  request.Activity.RoomEmails.Any() ||
                  !string.IsNullOrEmpty(request.Activity.EventLookup)
                  )
                 )
                    {
                        request.Activity.CoordinatorEmail = GraphHelper.GetEEMServiceAccount();
                        request.Activity.CoordinatorFirstName = "EEMServiceAccount";
                        request.Activity.CoordinatorLastName = "EEMServiceAccount";
                    }
                    var createdBy = activitiesToBeDeleted.FirstOrDefault().CreatedBy;
                    var createdAt = activitiesToBeDeleted.FirstOrDefault().CreatedAt;
                    //delete the old activities and the recurrence we will make new ones
                    foreach (var item in activitiesToBeDeleted)
                    {

                        if (
                            !string.IsNullOrEmpty(request.Activity.EventLookup) &&
                            !string.IsNullOrEmpty(request.Activity.CoordinatorEmail)
                            )
                        {
                            // delete graph event we will make new ones
                            var coordinatorEmail = item.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? item.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                            await GraphHelper.DeleteEvent(item.EventLookup, coordinatorEmail);
                        }
                    }
                   
                 
                    _context.Activities.RemoveRange(activitiesToBeDeleted);
                    await _context.SaveChangesAsync();
                    var oldRecurrence = await _context.Recurrences.FirstOrDefaultAsync(x => x.Id == request.Activity.RecurrenceId);
                    _context.Recurrences.Remove(oldRecurrence);
                    await _context.SaveChangesAsync();

                    // create the new activities


                    Recurrence newRecurrence = new Recurrence();
                        _mapper.Map(request.Activity.Recurrence, newRecurrence);
                        newActivities = Helper.GetActivitiesFromRecurrence(newRecurrence, request.Activity);
            
                 

                    foreach (var a in newActivities.ToList())
                    {
                        if (request.Activity.RecurrenceInd && request.Activity.Recurrence != null)
                        {
                            a.RecurrenceId = request.Activity.Recurrence.Id;
                        }

                        if (!string.IsNullOrEmpty(a.CoordinatorEmail))
                        {
                            //create outlook event
                            GraphEventDTO graphEventDTO = new GraphEventDTO
                            {
                                EventTitle = a.Title,
                                EventDescription = a.Description,
                                Start = a.StartDateAsString,
                                End = a.EndDateAsString,
                                RoomEmails = a.RoomEmails,
                                RequesterEmail = a.CoordinatorEmail,
                                RequesterFirstName = a.CoordinatorFirstName,
                                RequesterLastName = a.CoordinatorLastName,
                                IsAllDay = a.AllDayEvent,
                                UserEmail = user.Email
                            };
                            Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                            a.EventLookup = evt.Id;
                        }


                        if (a.CoordinatorEmail == GraphHelper.GetEEMServiceAccount())
                        {
                            a.CoordinatorEmail = user.Email;
                            a.CoordinatorFirstName = user.DisplayName;
                            a.CoordinatorLastName = String.Empty;
                        }

                       a.LastUpdatedBy = user.Email;
                       a.LastUpdatedAt = DateTime.Now;
                      a.CreatedBy = createdBy;
                     a.CreatedAt = createdAt;
                        a.HostingReport = null;
                      newActivities.Add(a);
                    }
                    newRecurrence.Activities = newActivities;   
                    _context.Recurrences.Add(newRecurrence);
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to Update Activity");

                    if (request.Activity.HostingReport != null)
                    {
                        AddHostingReportToNewActivities(newRecurrence.Id, request.Activity.HostingReport);
                    }

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception )
                {

                    throw;
                }
            }

            private void AddHostingReportToNewActivities(Guid id, HostingReport hostingReport)
            {
                if (hostingReport.Arrival != null)
                {
                    hostingReport.Arrival = TimeZoneInfo.ConvertTime(hostingReport.Arrival.Value, TimeZoneInfo.Local);
                }
                if (hostingReport.Departure != null)
                {
                    hostingReport.Departure = TimeZoneInfo.ConvertTime(hostingReport.Departure.Value, TimeZoneInfo.Local);
                }
                hostingReport.Id = Guid.Empty;
                hostingReport.Activity = null;

                var activities = _context.Activities.Where(x => x.RecurrenceId == id).ToArray();

                foreach (var activity  in activities)
                {
                    HostingReport newHostingReport = new HostingReport();
                    newHostingReport.Activity = null;
                    _mapper.Map(hostingReport, newHostingReport);
                    newHostingReport.ActivityId = activity.Id;
                    _context.HostingReports.Add(newHostingReport);
                }
                _context.SaveChanges();
            }

      

            private void DeleteHostingReports(Guid? recurrenceId)
            {
                var recurrence= _context.Recurrences.Include(x => x.Activities).ThenInclude(x => x.HostingReport).AsNoTracking().FirstOrDefault(x => x.Id == recurrenceId);

                foreach (var activity in recurrence.Activities)
                {
                    if (activity.HostingReport != null)
                    {
                        _context.HostingReports.Remove(activity.HostingReport);
                    }
                }

                _context.SaveChanges();
            }

        }

    }

}