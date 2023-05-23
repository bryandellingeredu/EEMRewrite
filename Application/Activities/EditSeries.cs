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
                    List<Activity> storedGraphEvents = new List<Activity>();


              
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    var allrooms = await GraphHelper.GetRoomsAsync();
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
                    bool shouldGraphEventsBeRegenerated = await GetShouldGraphEventsBeRegenerated(request.Activity, allrooms);

                    foreach (var item in activitiesToBeDeleted)
                    {

                        if (
                            !string.IsNullOrEmpty(request.Activity.EventLookup) &&
                            !string.IsNullOrEmpty(request.Activity.CoordinatorEmail )
                            )


                        {

                            if (shouldGraphEventsBeRegenerated)
                            {

                                // delete graph event we will make new ones
                                var coordinatorEmail = item.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? item.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                                try
                                {
                                    await GraphHelper.DeleteEvent(item.EventLookup, coordinatorEmail);
                                    item.EventLookup = string.Empty;
                                }
                                catch (Exception)
                                {
                                    try
                                    {
                                        await GraphHelper.DeleteEvent(item.EventLookup, GraphHelper.GetEEMServiceAccount());
                                        item.EventLookup = string.Empty;
                                    }
                                    catch (Exception)
                                    {

                                        item.EventLookup = string.Empty;
                                    }

                                }

                            }  else
                            {
                                storedGraphEvents.Add(new Activity
                                {
                                    Start=item.Start,
                                    End=item.End,
                                    AllDayEvent=item.AllDayEvent,   
                                    EventLookup=item.EventLookup,
                                });
                            }                         
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

                        var coordinatorEmail = a.CoordinatorEmail;
                        var coordinatorFirstName = a.CoordinatorFirstName;
                        var coordinatorLastName = a.CoordinatorLastName;

                        if(string.IsNullOrEmpty(coordinatorEmail) || !coordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]))
                        {
                            coordinatorEmail = GraphHelper.GetEEMServiceAccount();
                            coordinatorFirstName = "EEMServiceAccount";
                            coordinatorLastName = "EEMServiceAccount";

                        }

                        if (!string.IsNullOrEmpty(a.CoordinatorEmail))
                        {
                            if (shouldGraphEventsBeRegenerated)
                            {
                                //create outlook event
                                GraphEventDTO graphEventDTO = new GraphEventDTO
                                {
                                    EventTitle = a.Title,
                                    EventDescription = a.Description,
                                    Start = a.StartDateAsString,
                                    End = a.EndDateAsString,
                                    RoomEmails = a.RoomEmails,
                                    RequesterEmail = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount(),
                                    RequesterFirstName = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount(),
                                    RequesterLastName = user.Email.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? user.Email : GraphHelper.GetEEMServiceAccount(),
                                    IsAllDay = a.AllDayEvent,
                                    UserEmail = user.Email
                                };
                                Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                                a.EventLookup = evt.Id;
                                a.CoordinatorEmail = user.Email;
                                a.CoordinatorFirstName = user.DisplayName;
                                a.CoordinatorLastName = String.Empty;
                            }
                            else
                            {
                                var storedGraphEvent = storedGraphEvents.Where(x => x.Start == a.Start && x.End == a.End && x.AllDayEvent == a.AllDayEvent).FirstOrDefault();
                                if (storedGraphEvent != null) {
                                    a.EventLookup = storedGraphEvent.EventLookup;
                                }

                            }
                             
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
                catch (Exception ex )
                {

                    throw;
                }
            }

            private async Task<bool> GetShouldGraphEventsBeRegenerated(Activity updatedActivity, IGraphServicePlacesCollectionPage allrooms)
            {
                if (!updatedActivity.RoomEmails.Any()) return false;
              
                var originalActivity = await _context.Activities.AsNoTracking().FirstOrDefaultAsync(x => x.Id == updatedActivity.Id);

                if (updatedActivity.RoomEmails.Any() && string.IsNullOrEmpty(originalActivity.EventLookup)) return true;

                var oldRecurrence = await _context.Recurrences.AsNoTracking().FirstOrDefaultAsync(x => x.Id == updatedActivity.RecurrenceId);

                if (oldRecurrence == null)
                {
                    return true;
                }

                // check if the recurrence has changed
                bool isRecurrenceEqual = oldRecurrence.ArePropertiesEqual(updatedActivity.Recurrence);
                if (!isRecurrenceEqual)
                { 
                    return true;
                }
                var updatedStart = TimeZoneInfo.ConvertTime(updatedActivity.Start, TimeZoneInfo.Local);
                if (updatedStart != originalActivity.Start)
                {
                return true;
                }

                var updatedEnd = TimeZoneInfo.ConvertTime(updatedActivity.End, TimeZoneInfo.Local);
                if (updatedEnd != originalActivity.End)
                {
                    return true;
                }

                if (updatedActivity.AllDayEvent != originalActivity.AllDayEvent)
                {
                    return true;
                }
                Event evt;
                try
                {
                    evt = await GraphHelper.GetEventAsync(originalActivity.CoordinatorEmail, originalActivity.EventLookup);
                }
                catch (Exception)
                {
                    try
                    {
                        evt = await GraphHelper.GetEventAsync(GraphHelper.GetEEMServiceAccount(), originalActivity.EventLookup);
                    }
                    catch (Exception)
                    {
                        return true;
                        
                    }              
                }

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
                var roomEmailsList = updatedActivity.RoomEmails.ToList();
                roomEmailsList.Sort();
                bool areEqual = newActivityRooms.SequenceEqual(roomEmailsList);
                if (!areEqual)
                {
                    return true;
                }

                return false;

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