using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Application.Interfaces;
using Application.Emails;
using Application.GraphSchedules;
using System.Globalization;

namespace Application.Activities
{
    public class Details
    {
        public class Query : IRequest<Result<Activity>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Activity>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly ICACAccessor _cacAccessor;


            public Handler(DataContext context, IConfiguration config, ICACAccessor cacAccesor)
            {
                _context = context;
                _config = config;   
                _cacAccessor = cacAccesor;
            }

            public async Task<Result<Activity>> Handle(Query request, CancellationToken cancellationToken)
            {

                Activity activity;

                if (_cacAccessor.IsCACAuthenticated())
                {
                    activity = await _context.Activities
                     .Include(c => c.Category)
                    .Include(o => o.Organization)
                     .Include(r => r.Recurrence)
                      .Include(h => h.HostingReport)
                     .FirstOrDefaultAsync(x => x.Id == request.Id);
                } else
                {
                    activity = await _context.Activities
                    .Include(c => c.Category)
                    .Include(o => o.Organization)
                    .Include(r => r.Recurrence)
                     .FirstOrDefaultAsync(x => x.Id == request.Id);
                }



                if (activity.Organization != null)
                {
                    activity.Organization.Activities = null;
                }
                activity.Category.Activities = null;

                if (activity.Recurrence != null)
                {
                    activity.Recurrence.Activities = null;
                }
                if(activity.HostingReport != null)
                {
                    activity.HostingReport.Activity = null;
                }
                if ( activity.ActivityAttachmentGroupLookup != null)
                {
                    var activityAttachments = _context.ActivityAttachments.Where(x => x.ActivityAttachmentGroupId == activity.ActivityAttachmentGroupLookup);
                    if (!activityAttachments.Any())
                    {
                        activity.ActivityAttachmentGroupLookup = null;
                    }
                }

                if (!string.IsNullOrEmpty(activity.EventLookup) && !string.IsNullOrEmpty(activity.CoordinatorEmail))
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    Event evt;
                    try
                    {
                        evt = await GraphHelper.GetEventAsync(activity.CoordinatorEmail, activity.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                    }
                    catch (Exception)
                    {
                        activity.EventLookup = string.Empty;
                        activity.EventLookupCalendar = string.Empty;
                        evt = new Event();       
                    }
       

                    var allrooms = await GraphHelper.GetRoomsAsync();

                    var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                    List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                    int index = 0;

                    if (evt != null && evt.Attendees != null)
                    {
                        foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                        {
                            string roomStatus = await getRoomStatus(new ScheduleRequestDTO
                            {
                                Schedules = new List<string> { item.EmailAddress.Address },
                                StartTime = getDateTimeTimeZone(activity.Start),
                                EndTime = getDateTimeTimeZone(activity.End),
                                AvailabilityViewInterval = 15
                            });

                            if (roomStatus != "Free")
                            {
                                newActivityRooms.Add(new ActivityRoom
                                {
                                    Id = index++,
                                    Name = getName(item, allrooms),
                                    Email = item.EmailAddress.Address,
                                    Status = roomStatus
                                });
                            }
                        }
                    }

                    activity.ActivityRooms = newActivityRooms;

                }

                return Result<Activity>.Success(activity);
            }

            private async Task<string> getRoomStatus(ScheduleRequestDTO scheduleRequestDTO)
            {
                var status = "Free";
                ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(scheduleRequestDTO);
                foreach (ScheduleInformation scheduleInformation in result.CurrentPage)
                {
                    foreach (ScheduleItem scheduleItem in scheduleInformation.ScheduleItems)
                    {
                        if (scheduleItem.Status != FreeBusyStatus.Free)
                        {
                            status = scheduleItem.Status == FreeBusyStatus.Busy ? "Approved" : "Tentative";
                        }
                    }
                }
                return status;
            }

            private DateTimeTimeZone getDateTimeTimeZone(DateTime dt)
            {
                string dateAsString = dt.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture);
                DateTimeTimeZone dateTimeZone = new DateTimeTimeZone();
                dateTimeZone.DateTime = dateAsString;
                dateTimeZone.TimeZone = "UTC";
                return dateTimeZone;
            }

            private string getName(Attendee item, IGraphServicePlacesCollectionPage allrooms)
            {
                var room = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == item.EmailAddress.Address).FirstOrDefault();
                string name = room.DisplayName;
                return name;
            }
        }
    }
}
