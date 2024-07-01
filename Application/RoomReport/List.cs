using Application.Core;
using Application.GraphSchedules;
using Domain;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RoomReport
{
    public class List
    {
        public class Query : IRequest<Result<List<Domain.RoomReport>>>
        {
        }

        public class Handler : IRequestHandler<Query, Result<List<Domain.RoomReport>>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<List<Domain.RoomReport>>> Handle(Query request, CancellationToken cancellationToken)
            {
                List<Domain.RoomReport> roomReports = new List<Domain.RoomReport>();
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allRooms = await GraphHelper.GetRoomsAsync();
                var rooms = allRooms.Where(r => r.AdditionalData.ContainsKey("building"));
                List<string> emails = rooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                TimeZoneInfo easternTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
                DateTime currentEasternTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.Local, easternTimeZone);

                List<DateTimeTimeZone> startTimes = new List<DateTimeTimeZone>();
                List<DateTimeTimeZone> endTimes = new List<DateTimeTimeZone>();

                for (int i = 0; i <= 10; i++)
                {
                    DateTime date = currentEasternTime.AddDays(i);
                    DateTime startDateTime = new DateTime(date.Year, date.Month, date.Day, 8, 0, 0);
                    DateTime endDateTime = new DateTime(date.Year, date.Month, date.Day, 20, 0, 0);
                    string startDateAsString = startDateTime.ToString("o", CultureInfo.InvariantCulture);
                    string endDateAsString = endDateTime.ToString("o", CultureInfo.InvariantCulture);

                    startTimes.Add(new DateTimeTimeZone { DateTime = startDateAsString, TimeZone = "Eastern Standard Time" });
                    endTimes.Add(new DateTimeTimeZone { DateTime = endDateAsString, TimeZone = "Eastern Standard Time" });
                }

                List<ScheduleRequestDTO> scheduleRequests = new List<ScheduleRequestDTO>();

                for (int i = 0; i < startTimes.Count; i++)
                {
                    scheduleRequests.Add(new ScheduleRequestDTO
                    {
                        Schedules = emails,
                        StartTime = startTimes[i],
                        EndTime = endTimes[i],
                        AvailabilityViewInterval = 15
                    });
                }

                foreach (var scheduleRequestDTO in scheduleRequests)
                {
                    ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(scheduleRequestDTO);

                    foreach (ScheduleInformation scheduleInformation in result.CurrentPage)
                    {
                        Domain.RoomReport roomReport = new Domain.RoomReport
                        {
                            Day = new DateTime(currentEasternTime.Year, currentEasternTime.Month, currentEasternTime.Day, 0, 0, 0).AddDays(scheduleRequests.IndexOf(scheduleRequestDTO)),
                            AvailabilityView = scheduleInformation.AvailabilityView,
                            ScheduleId = scheduleInformation.ScheduleId
                        };
                        roomReports.Add(roomReport);
                    }
                }

                return Result<List<Domain.RoomReport>>.Success(roomReports);
            }


        }
    }
}
