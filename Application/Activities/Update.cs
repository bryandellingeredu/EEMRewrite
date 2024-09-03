using Application.Core;
using Application.GraphSchedules;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class Update
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Activity Activity
            {
                get;
                set;
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IConfiguration _config;
            private readonly IUserAccessor _userAccessor;
            private readonly ICACAccessor _cacAccessor;
            private readonly IWebHostEnvironment _webHostEnvironment;

            public Handler(DataContext context, IMapper mapper, IConfiguration config, IUserAccessor userAccessor, ICACAccessor cacAccessor,
                IWebHostEnvironment webHostEnvironment)
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
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                string[] roomEmails = request.Activity.RoomEmails;
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                Guid id = request.Activity.Id;



                var activity = await _context.Activities.FindAsync(request.Activity.Id);

                var originalStart = activity.Start;
                var originalEnd = activity.End;
                var originalAllDayEvent = activity.AllDayEvent;
                var originalEventLookup = activity.EventLookup;
                var originalEventLookupCalendar = activity.EventLookupCalendar;
                var originalVTCLookup = activity.VTCLookup;
                var originalTitle = activity.Title;
                var updated = activity.LastUpdatedBy;
                var createdBy = activity.CreatedBy;
                var createdAt = activity.CreatedAt;
                var originalLastUpdatedBy = activity.LastUpdatedBy;
                var originalCoordinatorEmail = activity.CoordinatorEmail;
                var originalEventLookupCalendarEmail = activity.EventLookupCalendarEmail;

                Activity oldActivity = null;

                try
                {
                    oldActivity = _context.Activities.AsNoTracking().FirstOrDefault(a => a.Id == request.Activity.Id);
                    if (oldActivity != null)
                    {
                        request.Activity.CoordinatorEmail = oldActivity.CoordinatorEmail;
                    }

                }
                catch (Exception)
                {

                    // do nothing
                }


                if (!_cacAccessor.IsCACAuthenticated())
                {
                    var originalHostingReport = _context.HostingReports.AsNoTracking().FirstOrDefault(x => x.ActivityId == request.Activity.Id);
                    request.Activity.HostingReport = originalHostingReport;
                }

                _mapper.Map(request.Activity, activity);

                if (activity.EventPlanningSetUpDate != null)
                {
                    activity.EventPlanningSetUpDate = TimeZoneInfo.ConvertTime(activity.EventPlanningSetUpDate.Value, TimeZoneInfo.Local);
                }
                if (activity.CommandantStart != null)
                {
                    activity.CommandantStart = TimeZoneInfo.ConvertTime(activity.CommandantStart.Value, TimeZoneInfo.Local);
                }
                if (activity.CommandantEnd != null)
                {
                    activity.CommandantEnd = TimeZoneInfo.ConvertTime(activity.CommandantEnd.Value, TimeZoneInfo.Local);
                }
                if (activity.DptCmdtStart != null)
                {
                    activity.DptCmdtStart = TimeZoneInfo.ConvertTime(activity.DptCmdtStart.Value, TimeZoneInfo.Local);
                }
                if (activity.DptCmdtEnd != null)
                {
                    activity.DptCmdtEnd = TimeZoneInfo.ConvertTime(activity.DptCmdtEnd.Value, TimeZoneInfo.Local);
                }
                if (activity.ProvostStart != null)
                {
                    activity.ProvostStart = TimeZoneInfo.ConvertTime(activity.ProvostStart.Value, TimeZoneInfo.Local);
                }
                if (activity.ProvostEnd != null)
                {
                    activity.ProvostEnd = TimeZoneInfo.ConvertTime(activity.ProvostEnd.Value, TimeZoneInfo.Local);
                }
                if (activity.CofsStart != null)
                {
                    activity.CofsStart = TimeZoneInfo.ConvertTime(activity.CofsStart.Value, TimeZoneInfo.Local);
                }
                if (activity.CofsEnd != null)
                {
                    activity.CofsEnd = TimeZoneInfo.ConvertTime(activity.CofsEnd.Value, TimeZoneInfo.Local);
                }
                if (activity.DeanStart != null)
                {
                    activity.DeanStart = TimeZoneInfo.ConvertTime(activity.DeanStart.Value, TimeZoneInfo.Local);
                }
                if (activity.DeanEnd != null)
                {
                    activity.DeanEnd = TimeZoneInfo.ConvertTime(activity.DeanEnd.Value, TimeZoneInfo.Local);
                }
                if (activity.AmbassadorStart != null)
                {
                    activity.AmbassadorStart = TimeZoneInfo.ConvertTime(activity.AmbassadorStart.Value, TimeZoneInfo.Local);
                }
                if (activity.AmbassadorEnd != null)
                {
                    activity.AmbassadorEnd = TimeZoneInfo.ConvertTime(activity.AmbassadorEnd.Value, TimeZoneInfo.Local);
                }
                if (activity.CSMStart != null)
                {
                    activity.CSMStart = TimeZoneInfo.ConvertTime(activity.CSMStart.Value, TimeZoneInfo.Local);
                }
                if (activity.CSMEnd != null)
                {
                    activity.CSMEnd = TimeZoneInfo.ConvertTime(activity.CSMEnd.Value, TimeZoneInfo.Local);
                }
                if (activity.HostingReport != null && activity.HostingReport.Arrival != null)
                {
                    activity.HostingReport.Arrival = TimeZoneInfo.ConvertTime(activity.HostingReport.Arrival.Value, TimeZoneInfo.Local);
                }
                if (activity.HostingReport != null && activity.HostingReport.Departure != null)
                {
                    activity.HostingReport.Departure = TimeZoneInfo.ConvertTime(activity.HostingReport.Departure.Value, TimeZoneInfo.Local);
                }
                if (activity.HostingReport != null && activity.HostingReport.FlagSetUp != null)
                {
                    activity.HostingReport.FlagSetUp = TimeZoneInfo.ConvertTime(activity.HostingReport.FlagSetUp.Value, TimeZoneInfo.Local);
                }

                bool shouldGraphEventsBeRegenerated = true;


                if (!roomEmails.Any() && string.IsNullOrEmpty(originalEventLookup)) shouldGraphEventsBeRegenerated = false;

                //begin if there a vtc setup delete the old one and make a new one.

                if (activity.VTCLookup != null)
                {
                    try
                    {
                        await GraphHelper.DeleteEvent(request.Activity.VTCLookup, GraphHelper.GetEEMServiceAccount(), originalCoordinatorEmail, originalLastUpdatedBy, createdBy, originalEventLookupCalendar, originalEventLookupCalendarEmail);
                        request.Activity.VTCLookup = string.Empty;
                        activity.VTCLookup = string.Empty;
                    }
                    catch (Exception)
                    {
                        request.Activity.VTCLookup = string.Empty;
                        activity.VTCLookup = string.Empty;
                    }
                }

                if (request.Activity.VTC && !request.Activity.AllDayEvent)
                {
                    var vtcRooms = request.Activity.RoomEmails
                                 .Where(email => email.IndexOf("VTC", StringComparison.OrdinalIgnoreCase) >= 0)
                                 .ToArray();

                    string[] availableVTCRooms = await GetAvailableVTCRooms(vtcRooms, request.Activity.Start);

                    if (availableVTCRooms.Any())
                    {
                        try
                        {
                            GraphEventDTO vtcGraphEventDTO = new GraphEventDTO
                            {
                                EventTitle = $"SVTC Setup for {request.Activity.Title}",
                                EventDescription = $"SVTC Setup for {request.Activity.Title}",
                                Start = SubtractHalfAnHour(request.Activity.StartDateAsString),
                                End = request.Activity.StartDateAsString,
                                RoomEmails = availableVTCRooms,
                                RequesterEmail = GraphHelper.GetEEMServiceAccount(),
                                RequesterFirstName = GraphHelper.GetEEMServiceAccount(),
                                RequesterLastName = GraphHelper.GetEEMServiceAccount(),
                                IsAllDay = request.Activity.AllDayEvent,
                                UserEmail = user.Email,
                                Coordinator = originalCoordinatorEmail
                            };
                            Event vtcevt = await GraphHelper.CreateEvent(vtcGraphEventDTO);
                            request.Activity.VTCLookup = vtcevt.Id;
                            activity.VTCLookup = vtcevt.Id;
                        }
                        catch (Exception ex)
                        {

                            throw;
                        }
                    }

                }

                // end if there a vtc setup delete the old one and make a new one.

                //update or create the graph event.

                if (shouldGraphEventsBeRegenerated)
                {
                    GraphEventDTO graphEventDTO = new GraphEventDTO
                    {
                        EventTitle = request.Activity.Title,
                        EventDescription = request.Activity.Description,
                        Start = request.Activity.StartDateAsString,
                        End = request.Activity.EndDateAsString,
                        RoomEmails = roomEmails,
                        IsAllDay = request.Activity.AllDayEvent,
                        UserEmail = user.Email,
                        EventLookup = originalEventLookup,
                        EventCalendar = originalEventLookupCalendar,
                        EventCalendarEmail = originalEventLookupCalendarEmail,
                        CreatedBy = createdBy,
                        Updated = updated,
                    };

                    Event evt = await GraphHelper.UpdateEvent(graphEventDTO);
                    activity.EventLookup = evt.Id;
                    activity.EventLookupCalendar = evt.Calendar.Id;
                    activity.EventLookupCalendarEmail = evt.Organizer.EmailAddress.Address;

                }


                //create or update team event.

                if (!string.IsNullOrEmpty(request.Activity.TeamLookup) && !string.IsNullOrEmpty(request.Activity.TeamRequester))
                {
                    GraphEventDTO graphEventDTO = new GraphEventDTO
                    {
                        RoomEmails = request.Activity.RoomEmails,
                        EventTitle = request.Activity.Title,
                        EventDescription = request.Activity.Description,
                        Start = request.Activity.StartDateAsString,
                        End = request.Activity.EndDateAsString,
                        PrimaryLocation = request.Activity.PrimaryLocation,
                        IsAllDay = request.Activity.AllDayEvent,
                        RequesterEmail = request.Activity.TeamRequester,
                        TeamInvites = (List<TextValueUser>)(request.Activity.TeamInvites.Any() ? request.Activity.TeamInvites : new List<TextValueUser>())
                    };
                    await GraphHelper.UpdateTeamsMeeting(graphEventDTO, request.Activity.TeamLookup, request.Activity.TeamOwner);
                }
                else
                {
                    if (request.Activity.MakeTeamMeeting)
                    {
                        GraphEventDTO graphEventDTO = new GraphEventDTO
                        {
                            RoomEmails = request.Activity.RoomEmails,
                            EventTitle = request.Activity.Title,
                            EventDescription = request.Activity.Description,
                            Start = request.Activity.StartDateAsString,
                            End = request.Activity.EndDateAsString,
                            IsAllDay = request.Activity.AllDayEvent,
                            PrimaryLocation = request.Activity.PrimaryLocation,
                            RequesterEmail = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount(),
                            TeamInvites = (List<TextValueUser>)(request.Activity.TeamInvites.Any() ? request.Activity.TeamInvites : new List<TextValueUser>())
                        };
                        Event teamsMeeting = await GraphHelper.CreateTeamsMeeting(graphEventDTO, request.Activity.TeamOwner);
                        activity.TeamLookup = teamsMeeting.Id;
                        activity.TeamLink = teamsMeeting.OnlineMeeting.JoinUrl;
                        activity.TeamRequester = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount();
                    }
                    else
                    {
                        activity.TeamOwner = null;
                    }
                }

                activity.LastUpdatedBy = user.Email;
                activity.LastUpdatedAt = DateTime.Now;

                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Update Activity");

                WorkflowHelper workflowHelper = new WorkflowHelper(activity, settings, _context, _webHostEnvironment, oldActivity);
                await workflowHelper.SendNotifications();

                if (!_cacAccessor.IsCACAuthenticated() && activity.HostingReport != null)
                {
                    Activity a = await _context.Activities.FindAsync(activity.Id);
                    HostingReport h = await _context.HostingReports.FindAsync(activity.HostingReport.Id);
                    HostingReportWorkflowHelper hostingReportWorkflowHelper = new HostingReportWorkflowHelper(activity, settings, _context, h, _webHostEnvironment);
                    await hostingReportWorkflowHelper.SendNotifications();
                }


                return Result<Unit>.Success(Unit.Value);

            }


            private async Task<string[]> GetAvailableVTCRooms(string[] vtcRooms, DateTime start)
            {
                ScheduleRequestDTO scheduleRequestDTO = new ScheduleRequestDTO
                {
                    Schedules = vtcRooms.ToList(),
                    StartTime = getDateTimeZone(start.AddMinutes(-30)),
                    EndTime = getDateTimeZone(start),
                    AvailabilityViewInterval = 15
                };

                var scheduleResults = await GraphHelper.GetScheduleAsync(scheduleRequestDTO);
                List<string> availableRooms = new List<string>();

                foreach (var schedule in scheduleResults)
                {
                    bool isAvailable = true; // Assume the room is available unless proven otherwise.
                    foreach (var scheduleItem in schedule.AvailabilityView)
                    {
                        if (scheduleItem != '0') // '0' indicates free, any other value indicates busy, tentative, or out of office.
                        {
                            isAvailable = false;
                            break;
                        }
                    }

                    if (isAvailable)
                    {
                        availableRooms.Add(schedule.ScheduleId); // Assuming ScheduleId holds the email or identifier of the room.
                    }
                }

                return availableRooms.ToArray();

            }

            private DateTimeTimeZone getDateTimeZone(DateTime dt)
            {
                string dateAsString = dt.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture);
                DateTimeTimeZone dateTimeZone = new DateTimeTimeZone();
                dateTimeZone.DateTime = dateAsString;
                dateTimeZone.TimeZone = "UTC";
                return dateTimeZone;
            }

            private string SubtractHalfAnHour(string dateTimeString)
            {

                DateTime dateTime = DateTime.Parse(dateTimeString);

                DateTime newDateTime = dateTime.AddMinutes(-30);

                string newDateTimeString = newDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");

                return newDateTimeString;
            }

        }
    }
}
