
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;
using System.Diagnostics;
using Microsoft.Graph;
using System.Globalization;
using System;

namespace Application.Activities
{
    public class GetRoomNames
    {
        public class Query : IRequest<Result<string>>
        {
            public string EventLookup { get; set; }
            public string CoordinatorEmail { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<string>>
        {

            private readonly IConfiguration _config;
            private readonly DataContext _context;

            public Handler(IConfiguration config, DataContext context)
            {
                _config = config;
                _context = context;
            }

            public async Task<Result<string>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                var activity = await _context.Activities.FirstOrDefaultAsync(x => x.EventLookup == request.EventLookup); 
                

                string coordinatorEmail =  GraphHelper.GetEEMServiceAccount();
                Event evt;
                try
                {
                    evt = await GraphHelper.GetEventAsync(coordinatorEmail, request.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                }
                catch (Exception)
                {
                    evt = new Event();
                }

                var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                int index = 0;

               if(evt !=null && evt.Attendees !=null)
                {
                    foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                    {
                        string roomStatus = await getRoomStatus(new ScheduleRequestDTO
                        {
                            Schedules = new List<string> { item.EmailAddress.Address },
                            StartTime = ConvertToEST(evt.Start),
                            EndTime = ConvertToEST(evt.End),
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

                string roomNames = string.Empty;

                if (newActivityRooms.Any())
                {
                    roomNames = String.Join( ", ", newActivityRooms.Select(x => $"{x.Name} ( {x.Status} )").ToArray());
                }

                return Result<string>.Success(roomNames);
            }

            private DateTimeTimeZone ConvertToEST(DateTimeTimeZone dateTimeTimeZone)
            {
                DateTime utcDateTime = DateTime.SpecifyKind(DateTime.Parse(dateTimeTimeZone.DateTime), DateTimeKind.Utc);
                TimeZoneInfo est = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
                DateTime estDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, est);
                var estdateTimeTimeZone = new DateTimeTimeZone
                {
                    DateTime = estDateTime.ToString("o"),
                    TimeZone = TimeZoneInfo.Local.Id
                };
                return estdateTimeTimeZone;
            }

            private string getName(Attendee item, IGraphServicePlacesCollectionPage allrooms)
            {
                var room = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == item.EmailAddress.Address).FirstOrDefault();
                string name = room.DisplayName;
                return name;
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

            
        }
    }
}
