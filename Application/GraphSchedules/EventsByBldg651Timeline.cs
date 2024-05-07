using Application.Core;
using MediatR;
using Microsoft.Graph;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Globalization;
using System.Text.Json;
using Azure.Core;
using Persistence.Migrations;

namespace Application.GraphSchedules
{
    public class EventsByBldg651Timeline
    {
        public class Query : IRequest<Result<List<FullCalendarEventDTO>>>
        {
            public string Id { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<FullCalendarEventDTO>>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<List<FullCalendarEventDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var building = request.Id == "651" ? "Bldg 651" : "Collins Hall, Bldg 650";
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allRooms = await GraphHelper.GetRoomsAsync();
                if (request.Id == "all"){
                  
                }
                 var rooms =  allRooms.Where(r => r.AdditionalData.ContainsKey("building"));
                 if(request.Id != "all"){
                 rooms =  allRooms.Where(r => r.AdditionalData.ContainsKey("building") && r.AdditionalData["building"].ToString() == building).ToList();
                 }
                List<string> emails = rooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();    
                var startArray = request.Start.Split('T');
                var endArray = request.End.Split('T');
                var startDateArray = startArray[0].Split('-');
                var endDateArray = endArray[0].Split('-');
                int startMonth = Int32.Parse(startDateArray[1]);
                int endMonth = Int32.Parse(endDateArray[1]);
                int startDay = Int32.Parse(startDateArray[2]);
                int endDay = Int32.Parse(endDateArray[2]);
                int startYear = Int32.Parse(startDateArray[0]);
                int endYear = Int32.Parse(endDateArray[0]);
                DateTime startDateTime = new DateTime(startYear, startMonth, startDay, 0, 0, 0 );
                DateTime endDateTime = new DateTime(endYear, endMonth, endDay, 23, 59, 0);
                string startDateAsString = startDateTime.ToString("o", CultureInfo.InvariantCulture);
                string endDateAsString = endDateTime.ToString("o", CultureInfo.InvariantCulture);
                DateTimeTimeZone startDateTimeZone = new DateTimeTimeZone();
                DateTimeTimeZone endDateTimeZone = new DateTimeTimeZone();
                startDateTimeZone.DateTime = startDateAsString;
                startDateTimeZone.TimeZone = "Eastern Standard Time";
                endDateTimeZone.DateTime = endDateAsString;
                endDateTimeZone.TimeZone = "Eastern Standard Time";

                ScheduleRequestDTO scheduleRequestDTO = new ScheduleRequestDTO
                {
                    Schedules = emails,
                    StartTime = startDateTimeZone,
                    EndTime = endDateTimeZone,  
                    AvailabilityViewInterval = 15
                };

                ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(scheduleRequestDTO);
                List<FullCalendarEventDTO> fullCalendarEventDTOs = new List<FullCalendarEventDTO>();

                foreach (ScheduleInformation scheduleInformation in result.CurrentPage)
                {
                    if (scheduleInformation.ScheduleItems != null && scheduleInformation.ScheduleItems.Any())
                    {
                        foreach (ScheduleItem scheduleItem in scheduleInformation.ScheduleItems)
                        {
                            // Check if the scheduleItem is not free and has both subject and location.
                            if (scheduleItem.Status != FreeBusyStatus.Free && scheduleItem.Subject != null && scheduleItem.Location != null)
                            {
                                FullCalendarEventDTO fullCalendarEventDto = new FullCalendarEventDTO
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    Start = scheduleItem.Start.DateTime,
                                    End = scheduleItem.End.DateTime,
                                    Title = scheduleItem.Subject.Split("- Requested by: ")[0],
                                    Color = scheduleItem.Status == FreeBusyStatus.Busy ? "Green" : "GoldenRod",
                                    AllDay = scheduleItem.Start.DateTime.Split('T')[1] == "00:00:00.0000000" &&
                                             scheduleItem.End.DateTime.Split('T')[1] == "00:00:00.0000000",
                                    RoomId = rooms.FirstOrDefault(r => r.AdditionalData["emailAddress"].ToString() == scheduleInformation.ScheduleId)?.Id,
                                    ResourceId = scheduleInformation.ScheduleId
                                };

                                fullCalendarEventDTOs.Add(fullCalendarEventDto);
                            }
                        }
                    }
                }

                List<FullCalendarEventDTO>  distinctFullCalendarEventDTOs = fullCalendarEventDTOs
                        .GroupBy(p => new
                         {
                             p.Start,
                             p.End,
                             p.Title,
                             p.AllDay
                             })
                            .Select(g => g.First())
                            .ToList();

                return Result<List<FullCalendarEventDTO>>.Success(distinctFullCalendarEventDTOs);
            }

         
        }
    }
}
