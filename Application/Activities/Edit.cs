﻿using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Application.Interfaces;
using System.Dynamic;
using Application.DTOs;
using Microsoft.AspNetCore.Http;
using Application.GraphSchedules;

namespace Application.Activities
{
    public class Edit
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
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                if (
                     (
                     string.IsNullOrEmpty(request.Activity.CoordinatorEmail) ||
                     !request.Activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                     ) &&
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

                var activity = await _context.Activities.FindAsync(request.Activity.Id);
                if (activity == null) return null;
                var originalStart = activity.Start;
                var originalEnd = activity.End;
                var originalAllDayEvent = activity.AllDayEvent;
                var originalEventLookup = activity.EventLookup;
                var originalCoordinatorEmail = activity.CoordinatorEmail;

                var createdBy = activity.CreatedBy;
                var createdAt = activity.CreatedAt;
                if (!_cacAccessor.IsCACAuthenticated()) {
                    var originalHostingReport = _context.HostingReports.AsNoTracking().FirstOrDefault(x => x.ActivityId == request.Activity.Id);
                    request.Activity.HostingReport = originalHostingReport;
                }
                _mapper.Map(request.Activity, activity);
                if (activity.HostingReport != null && activity.HostingReport.Arrival != null) {
                    activity.HostingReport.Arrival = TimeZoneInfo.ConvertTime(activity.HostingReport.Arrival.Value, TimeZoneInfo.Local);
                }
                if (activity.HostingReport != null && activity.HostingReport.Departure != null) {
                    activity.HostingReport.Departure = TimeZoneInfo.ConvertTime(activity.HostingReport.Departure.Value, TimeZoneInfo.Local);
                }
                activity.Category = null;
                activity.EventLookup = null;
                activity.RecurrenceId = null;
                activity.RecurrenceInd = false;

                bool shouldGraphEventsBeRegenerated = await GetShouldGraphEventsBeRegenerated(
                    activity, originalStart, originalEnd, originalEventLookup, originalCoordinatorEmail, originalAllDayEvent, request.Activity.RoomEmails);

                //delete any old graph events we will make new ones
                if (
                  !string.IsNullOrEmpty(request.Activity.EventLookup) &&
                  !string.IsNullOrEmpty(request.Activity.CoordinatorEmail) &&
                  shouldGraphEventsBeRegenerated
                )
                {
                    await GraphHelper.DeleteEvent(request.Activity.EventLookup, request.Activity.CoordinatorEmail);
                }

                //create new graph event
                if (
                          !string.IsNullOrEmpty(request.Activity.CoordinatorEmail)
                          && shouldGraphEventsBeRegenerated
                   )
                {
                    GraphEventDTO graphEventDTO = new GraphEventDTO
                    {
                        EventTitle = request.Activity.Title,
                        EventDescription = request.Activity.Description,
                        Start = request.Activity.StartDateAsString,
                        End = request.Activity.EndDateAsString,
                        RoomEmails = request.Activity.RoomEmails,
                        RequesterEmail = request.Activity.CoordinatorEmail,
                        RequesterFirstName = request.Activity.CoordinatorFirstName,
                        RequesterLastName = request.Activity.CoordinatorLastName,
                        IsAllDay = request.Activity.AllDayEvent,
                        UserEmail = user.Email
                    };
                    Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                    activity.EventLookup = evt.Id;
                }
                else
                {
                    activity.EventLookup = originalEventLookup;
                }
                if (activity.CoordinatorEmail == GraphHelper.GetEEMServiceAccount())
                {

                    activity.CoordinatorEmail = user.Email;
                    activity.CoordinatorFirstName = user.DisplayName;
                    activity.CoordinatorLastName = String.Empty;
                }
                activity.LastUpdatedBy = user.Email;
                activity.LastUpdatedAt = DateTime.Now;
                activity.CreatedBy = createdBy;
                activity.CreatedAt = createdAt;
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Update Activity");
                WorkflowHelper workflowHelper = new WorkflowHelper(activity, settings, _context);
                await workflowHelper.SendNotifications();
                if (!_cacAccessor.IsCACAuthenticated() && activity.HostingReport != null)
                {
                    Activity a = await _context.Activities.FindAsync(activity.Id);
                    HostingReport h = await _context.HostingReports.FindAsync(activity.HostingReport.Id);
                    HostingReportWorkflowHelper hostingReportWorkflowHelper = new HostingReportWorkflowHelper(activity, settings, _context, h);
                    await hostingReportWorkflowHelper.SendNotifications();
                }

                return Result<Unit>.Success(Unit.Value);
            }

            private async Task<bool> GetShouldGraphEventsBeRegenerated(Activity activity, DateTime originalStart, DateTime originalEnd, string originalEventLookup, string originalCoordinatorEmail, bool originalAllDayEvent, string[] roomEmails)
            {
                if (!roomEmails.Any()) return true; 
                if (activity.Start != originalStart)
                {
                    return true;
                }
                if (activity.End != originalEnd)
                {
                    return true;
                }
                if (activity.AllDayEvent != originalAllDayEvent)
                {
                    return true;
                }

                if (!string.IsNullOrEmpty(originalEventLookup) && !string.IsNullOrEmpty(originalCoordinatorEmail))
                {

                    string coordinatorEmail = activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                        ? activity.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                    Event evt;
                    try
                    {
                        evt = await GraphHelper.GetEventAsync(originalCoordinatorEmail, originalEventLookup);
                    }
                    catch (Exception)
                    {
                        activity.EventLookup = string.Empty;
                        evt = new Event();
                    }


                    var allrooms = await GraphHelper.GetRoomsAsync();

                    var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                    List<string> newActivityRooms = new List<string>();

                    if (evt != null && evt.Attendees != null)
                    {
                        foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                        {

                            newActivityRooms.Add(item.EmailAddress.Address);
                        }
                    }

                    newActivityRooms.Sort();
                    var roomEmailsList = roomEmails.ToList();
                    roomEmailsList.Sort();
                    bool areEqual = newActivityRooms.SequenceEqual(roomEmailsList);

                    if (!areEqual)
                    {
                        return true;
                    }

                }


                return false;
            }




        }

    }
}