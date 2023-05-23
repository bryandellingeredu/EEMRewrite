using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Activity = Domain.Activity;
using Recurrence = Domain.Recurrence;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace Application.Activities
{
    public class Create
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
            private readonly ICACAccessor _cacAccessor;  //new
            private readonly IWebHostEnvironment _webHostEnvironment;

            public Handler(
                DataContext context, IMapper mapper, IConfiguration config, IUserAccessor userAccessor, ICACAccessor cacAccessor, IWebHostEnvironment webHostEnvironment)
            {
                _context = context;
                _mapper = mapper;
                _config = config;
                _userAccessor = userAccessor;
                _cacAccessor = cacAccessor;
                _webHostEnvironment = webHostEnvironment;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                //begin if the user is signed into edu (coordinator email is populated) create an outlook event

                try
                {
                    var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                    Helper.InitHelper(_mapper);
                    List<Activity> activities = new List<Activity>();

                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                    if (request.Activity.RecurrenceInd && request.Activity.Recurrence != null)
                    {
                        Recurrence recurrence = new Recurrence();
                        _mapper.Map(request.Activity.Recurrence, recurrence);
                        _context.Recurrences.Add(recurrence);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to Create Recurrence");
                        activities = Helper.GetActivitiesFromRecurrence(recurrence, request.Activity);
                    }
                    else
                    {
                        Activity activity = new Activity();
                        _mapper.Map(request.Activity, activity);
                        if (activity.HostingReport != null && activity.HostingReport.Arrival != null)
                        {
                            activity.HostingReport.Arrival = TimeZoneInfo.ConvertTime(activity.HostingReport.Arrival.Value, TimeZoneInfo.Local);
                        }
                        if (activity.HostingReport != null && activity.HostingReport.Departure != null)
                        {
                            activity.HostingReport.Departure = TimeZoneInfo.ConvertTime(activity.HostingReport.Departure.Value, TimeZoneInfo.Local);
                        }
                        activities.Add(activity);
                    }

                    foreach (var a in activities)
                    {
                        if (request.Activity.RecurrenceInd && request.Activity.Recurrence != null)
                        {
                            a.RecurrenceId = request.Activity.Recurrence.Id;
                        }
                        if (
                            (
                             string.IsNullOrEmpty(a.CoordinatorEmail) ||
                            !a.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            )
                            && a.RoomEmails.Any())
                        {
                            a.CoordinatorEmail = GraphHelper.GetEEMServiceAccount();
                            a.CoordinatorFirstName = "EEMServiceAccount";
                            a.CoordinatorLastName = "EEMServiceAccount";
                        }

                        if (!string.IsNullOrEmpty(a.CoordinatorEmail) && a.RoomEmails.Any() &&
                            a.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]))
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
                            if (a.CoordinatorEmail == GraphHelper.GetEEMServiceAccount())
                            {
                                a.CoordinatorEmail = user.Email;
                                a.CoordinatorFirstName = user.DisplayName;
                                a.CoordinatorLastName = String.Empty;
                            }

                        }
                        else
                        // user is not logged onto edu so do not make an outlook event
                        {
                            if (string.IsNullOrEmpty(a.CoordinatorEmail) ||
                                !a.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]))
                            {
                                a.CoordinatorEmail = user.Email;
                                a.CoordinatorFirstName = user.DisplayName;
                                a.CoordinatorLastName = String.Empty;
                            }
                            a.CreatedBy = user.Email;
                            a.CreatedAt = DateTime.Now;
                            _context.Activities.Add(a);
                        }
                        a.CreatedBy = user.Email;
                        a.CreatedAt = DateTime.Now;

                       // a.HostingReport = null;
                        _context.Activities.Add(a);
                        var result = await _context.SaveChangesAsync() > 0;

                        if (request.Activity.HostingReport != null)
                        {
                            var activityWithHostingReport = await _context.Activities.FindAsync(a.Id);
                            var hostingReport = activityWithHostingReport.HostingReport;
                            if (hostingReport != null)
                            {
                                activityWithHostingReport.HostingReport = null;
                                _context.HostingReports.Remove(hostingReport);
                                await _context.SaveChangesAsync();
                            }
                        }



                        WorkflowHelper workflowHelper = new WorkflowHelper(a, settings, _context, _webHostEnvironment);
                        await workflowHelper.SendNotifications();

                        if (request.Activity.HostingReport! != null && !string.IsNullOrEmpty(_cacAccessor.GetCacInfo()))   // if you are creating a hosting report always use the army user not the edu user
                        {
                            var cacUser = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _cacAccessor.GetCacInfo());
                            var cacActivity = await _context.Activities.FindAsync(a.Id);
                            cacActivity.CoordinatorEmail = _cacAccessor.GetCacInfo();
                            cacActivity.CreatedBy = cacUser.Email;
                            await _context.SaveChangesAsync();
                        }

                        if (request.Activity.HostingReport != null)
                        {
                            HostingReport hostingReport = request.Activity.HostingReport;
                            hostingReport.Id = Guid.Empty;
                            hostingReport.ActivityId = a.Id;
                            if (hostingReport.Arrival != null)
                            {
                                hostingReport.Arrival = TimeZoneInfo.ConvertTime(hostingReport.Arrival.Value, TimeZoneInfo.Local);
                            }
                            if (hostingReport.Departure != null)
                            {
                                hostingReport.Departure = TimeZoneInfo.ConvertTime(hostingReport.Departure.Value, TimeZoneInfo.Local);
                            }
                            _context.HostingReports.Add(hostingReport);
                            var result2 = await _context.SaveChangesAsync() > 0;

                            HostingReportWorkflowHelper hostingReportWorkflowHelper = new HostingReportWorkflowHelper(a, settings, _context, hostingReport, _webHostEnvironment);
                            await hostingReportWorkflowHelper.SendNotifications();
                        }

                        if (!result) return Result<Unit>.Failure("Failed to Create Activity");
                    }
                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {

                    throw;
                }
            }

        }
    }
}