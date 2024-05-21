using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using System.Linq.Expressions;
using Application.GraphSchedules;
using System.Globalization;

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
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                Activity oldActivity = null;

                try
                {
                    oldActivity = _context.Activities.AsNoTracking().FirstOrDefault(a => a.Id == request.Activity.Id);
                    if(oldActivity != null)
                    {
                        request.Activity.CoordinatorEmail = oldActivity.CoordinatorEmail;
                    }
       
                }
                catch (Exception)
                {

                   // do nothing
                }

             

                var activity = await _context.Activities.FindAsync(request.Activity.Id);
                if (activity == null) return null;
                var originalStart = activity.Start;
                var originalEnd = activity.End;
                var originalAllDayEvent = activity.AllDayEvent;
                var originalEventLookup = activity.EventLookup;
                var originalEventLookupCalendar = activity.EventLookupCalendar;
                var originalVTCLookup = activity.VTCLookup;
                var originalCoordinatorEmail = activity.CoordinatorEmail;
                var originalTitle = activity.Title; 

                var createdBy = activity.CreatedBy;
                var createdAt = activity.CreatedAt;
                if (!_cacAccessor.IsCACAuthenticated()) {
                    var originalHostingReport = _context.HostingReports.AsNoTracking().FirstOrDefault(x => x.ActivityId == request.Activity.Id);
                    request.Activity.HostingReport = originalHostingReport;
                }
                _mapper.Map(request.Activity, activity);
                if(activity.EventPlanningSetUpDate != null){
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
                if (activity.HostingReport != null && activity.HostingReport.Arrival != null) {
                    activity.HostingReport.Arrival = TimeZoneInfo.ConvertTime(activity.HostingReport.Arrival.Value, TimeZoneInfo.Local);
                }
                if (activity.HostingReport != null && activity.HostingReport.Departure != null) {
                    activity.HostingReport.Departure = TimeZoneInfo.ConvertTime(activity.HostingReport.Departure.Value, TimeZoneInfo.Local);
                }
                if (activity.HostingReport != null && activity.HostingReport.FlagSetUp != null)
                {
                    activity.HostingReport.FlagSetUp = TimeZoneInfo.ConvertTime(activity.HostingReport.FlagSetUp.Value, TimeZoneInfo.Local);
                }
                activity.Category = null;
                activity.EventLookup = null;
                activity.EventLookupCalendar = null;
                activity.RecurrenceId = null;
                activity.RecurrenceInd = false;

                bool shouldGraphEventsBeRegenerated = await GetShouldGraphEventsBeRegenerated(
                    activity, originalStart, originalEnd, originalEventLookup, originalCoordinatorEmail, originalAllDayEvent, request.Activity.RoomEmails, originalEventLookupCalendar);

                if (
                  (
                  string.IsNullOrEmpty(request.Activity.CoordinatorEmail) ||
                  !request.Activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                  ) &&
                  (
                  request.Activity.RoomEmails.Any() ||
                  !string.IsNullOrEmpty(request.Activity.EventLookup)
                  ) &&
                  shouldGraphEventsBeRegenerated
                 )
                {
                    request.Activity.CoordinatorEmail = GraphHelper.GetEEMServiceAccount();
                    request.Activity.CoordinatorFirstName = "EEMServiceAccount";
                    request.Activity.CoordinatorLastName = "EEMServiceAccount";
                }

                //delete any old graph events we will make new ones
                if (
                  !string.IsNullOrEmpty(request.Activity.EventLookup) &&
                  !string.IsNullOrEmpty(request.Activity.CoordinatorEmail) &&
                  shouldGraphEventsBeRegenerated
                )
                {
                    if (activity.VTCLookup != null)
                    {
                        try
                        {
                            await GraphHelper.DeleteEvent(request.Activity.VTCLookup, GraphHelper.GetEEMServiceAccount(), oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, oldActivity.EventLookupCalendar);
                            request.Activity.VTCLookup = string.Empty;
                            activity.VTCLookup = string.Empty;
                        }
                        catch (Exception)
                        {
                            request.Activity.VTCLookup = string.Empty;
                            activity.VTCLookup = string.Empty;
                        }
                    }

                    try
                    {
                        await GraphHelper.DeleteEvent(request.Activity.EventLookup, request.Activity.CoordinatorEmail, oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, oldActivity.EventLookupCalendar);
                        request.Activity.EventLookup = string.Empty;
                        request.Activity.EventLookupCalendar = string.Empty;
                        activity.EventLookup = string.Empty;
                        activity.EventLookupCalendar = string.Empty;
                    }
                    catch (Exception)
                    {
                        try
                        {
                            await GraphHelper.DeleteEvent(request.Activity.EventLookup, GraphHelper.GetEEMServiceAccount(), oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, oldActivity.EventLookupCalendar);
                            request.Activity.EventLookup = string.Empty;
                            request.Activity.EventLookupCalendar = string.Empty;
                            activity.EventLookup = string.Empty;
                            activity.EventLookupCalendar = string.Empty;
                        }
                        catch (Exception)
                        {

                            request.Activity.EventLookup = string.Empty;
                            request.Activity.EventLookupCalendar = string.Empty;
                            activity.EventLookup = string.Empty;
                            activity.EventLookupCalendar = string.Empty;
                        }
                    
                    }
                   
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
                        RequesterEmail =user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount(),
                        RequesterFirstName = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount(),
                        RequesterLastName = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount(),
                        IsAllDay = request.Activity.AllDayEvent,
                        UserEmail = user.Email
                    };
                    Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                    activity.EventLookup = evt.Id;
                    activity.EventLookupCalendar = evt.Calendar.Id;

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
                                    UserEmail = user.Email
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

                }
                else
                {
                    activity.EventLookup = originalEventLookup;
                    activity.EventLookupCalendar = originalEventLookupCalendar;
                    activity.VTCLookup = originalVTCLookup;

                    // check if the title has changed and there is a room reservation. if that happened we need to update the room reservation with the new title.
                    if(
                        !shouldGraphEventsBeRegenerated 
                        && !string.IsNullOrEmpty(activity.EventLookup)
                        && originalTitle != request.Activity.Title)
                      {
                        try
                        {
                            await GraphHelper.UpdateEventTitle(activity.EventLookup, request.Activity.Title, GraphHelper.GetEEMServiceAccount(), request.Activity.LastUpdatedBy, request.Activity.CreatedBy, request.Activity.EventLookupCalendar);
                        }
                        catch (Exception)
                        {

                            try
                            {
                                await GraphHelper.UpdateEventTitle(activity.EventLookup, request.Activity.Title, originalCoordinatorEmail, request.Activity.LastUpdatedBy, request.Activity.CreatedBy, request.Activity.EventLookupCalendar);
                            }
                            catch (Exception)
                            {

                                try
                                {
                                    await GraphHelper.UpdateEventTitle(activity.EventLookup, request.Activity.Title, request.Activity.CoordinatorEmail, request.Activity.LastUpdatedBy, request.Activity.CreatedBy, request.Activity.EventLookupCalendar);
                                }
                                catch (Exception)
                                {

                                    // do nothing
                                }
                            }
                        }
                     
                      }
                        
                 
                }

                if (activity.CoordinatorEmail == GraphHelper.GetEEMServiceAccount() && shouldGraphEventsBeRegenerated)
                {

                    activity.CoordinatorEmail = user.Email;
                    activity.CoordinatorFirstName = user.DisplayName;
                    activity.CoordinatorLastName = String.Empty;
                }
                activity.LastUpdatedBy = user.Email;
                activity.LastUpdatedAt = DateTime.Now;
                activity.CreatedBy = createdBy;
                activity.CreatedAt = createdAt;

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
                    await GraphHelper.UpdateTeamsMeeting(graphEventDTO, request.Activity.TeamLookup);
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
                        Event teamsMeeting = await GraphHelper.CreateTeamsMeeting(graphEventDTO);
                        activity.TeamLookup = teamsMeeting.Id;
                        activity.TeamLink = teamsMeeting.OnlineMeeting.JoinUrl;
                        activity.TeamRequester = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount();
                    }
                }


                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Update Activity");
                WorkflowHelper workflowHelper = new WorkflowHelper(activity, settings, _context, _webHostEnvironment, oldActivity);
                await workflowHelper.SendNotifications();
                if (!_cacAccessor.IsCACAuthenticated() && activity.HostingReport != null)
                {
                    Activity a = await _context.Activities.FindAsync(activity.Id);
                    HostingReport h = await _context.HostingReports.FindAsync(activity.HostingReport.Id);
                    HostingReportWorkflowHelper hostingReportWorkflowHelper = new HostingReportWorkflowHelper(activity, settings, _context, h, _webHostEnvironment  );
                    await hostingReportWorkflowHelper.SendNotifications();
                }

                return Result<Unit>.Success(Unit.Value);
            }

            private string SubtractHalfAnHour(string dateTimeString)
            {

                DateTime dateTime = DateTime.Parse(dateTimeString);

                DateTime newDateTime = dateTime.AddMinutes(-30);

                string newDateTimeString = newDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");

                return newDateTimeString;
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

            private async Task<bool> GetShouldGraphEventsBeRegenerated(Activity activity, DateTime originalStart, DateTime originalEnd, string originalEventLookup, string originalCoordinatorEmail, bool originalAllDayEvent, string[] roomEmails, string originalEventCalendarLookup)
            {
                if (!roomEmails.Any()) return false;
                if (roomEmails.Any() && string.IsNullOrEmpty(originalEventLookup)) return true;
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

                Activity oldActivity = _context.Activities.AsNoTracking().First(a => a.Id == activity.Id);

                if (!string.IsNullOrEmpty(originalEventLookup) && !string.IsNullOrEmpty(originalCoordinatorEmail))
                {
                  

                    
                    Event evt;
                    try
                    {
                        evt = await GraphHelper.GetEventAsync(activity.CoordinatorEmail, originalEventLookup, activity.LastUpdatedBy, activity.CreatedBy, originalEventCalendarLookup);
                    }
                    catch (Exception)
                    {

                        try
                        {
                            evt = await GraphHelper.GetEventAsync(GraphHelper.GetEEMServiceAccount(), originalEventLookup, activity.LastUpdatedBy, activity.CreatedBy, originalEventCalendarLookup);
                        }
                        catch (Exception)
                        {

                            try
                            {
                           
                                evt = await GraphHelper.GetEventAsync(originalCoordinatorEmail, originalEventLookup, activity.LastUpdatedBy, activity.CreatedBy, originalEventCalendarLookup);

                            }
                            catch (Exception)
                            {

                                activity.EventLookup = string.Empty;
                                activity.EventLookupCalendar = string.Empty;    
                                evt = new Event();
                            }
                        }
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