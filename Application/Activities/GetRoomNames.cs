
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

            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<string>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                string coordinatorEmail = request.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            ? request.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                var evt = await GraphHelper.GetEventAsync(coordinatorEmail, request.EventLookup);
                var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                int index = 0;

                foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                {

                    newActivityRooms.Add(new ActivityRoom
                    {
                        Id = index++,
                        Name = getName(item, allrooms),
                        Email = item.EmailAddress.Address,
                        Status = await getRoomStatus(new ScheduleRequestDTO
                        {
                            Schedules = new List<string> { item.EmailAddress.Address },
                            StartTime = ConvertToEST(evt.Start),
                            EndTime = ConvertToEST(evt.End),
                            AvailabilityViewInterval = 15
                        })
                    });
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
