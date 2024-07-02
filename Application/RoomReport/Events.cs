using Application.Core;
using Application.GraphSchedules;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System.Globalization;

namespace Application.RoomReport
{
    public class Events
    {
        public class Query : IRequest<Result<List<RoomReportEventsResponseDTO>>>
        {
            public RoomReportEventsRequestDTO roomReportEventsRequestDto { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<RoomReportEventsResponseDTO>>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<List<RoomReportEventsResponseDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                List<RoomReportEventsResponseDTO> roomReportEventsResponseDTOs = new List<RoomReportEventsResponseDTO>();
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                TimeZoneInfo easternTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
                DateTime currentEasternTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.Local, easternTimeZone);

                List<string> emails = new List<string> { request.roomReportEventsRequestDto.Email };

                DateTime startDateTime = new DateTime(request.roomReportEventsRequestDto.Start.Year, request.roomReportEventsRequestDto.Start.Month, request.roomReportEventsRequestDto.Start.Day, 8, 0, 0);
                DateTime endDateTime = new DateTime(request.roomReportEventsRequestDto.End.Year, request.roomReportEventsRequestDto.End.Month, request.roomReportEventsRequestDto.End.Day, 17, 0, 0);

                DateTime currentStart = startDateTime;
                DateTime chunkEnd;

                while (currentStart < endDateTime)
                {
                    chunkEnd = currentStart.AddDays(39); // 39 days to include the current day
                    if (chunkEnd > endDateTime)
                    {
                        chunkEnd = endDateTime;
                    }

                    string startDateAsString = currentStart.ToString("o", CultureInfo.InvariantCulture);
                    string endDateAsString = chunkEnd.ToString("o", CultureInfo.InvariantCulture);
                    DateTimeTimeZone startTime = new DateTimeTimeZone { DateTime = startDateAsString, TimeZone = "Eastern Standard Time" };
                    DateTimeTimeZone endTime = new DateTimeTimeZone { DateTime = endDateAsString, TimeZone = "Eastern Standard Time" };

                    ScheduleRequestDTO scheduleRequestDTO = new ScheduleRequestDTO
                    {
                        Schedules = emails,
                        StartTime = startTime,
                        EndTime = endTime,
                        AvailabilityViewInterval = 15
                    };

                    ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(scheduleRequestDTO);

                    foreach (ScheduleInformation scheduleInformation in result.CurrentPage)
                    {
                        foreach (var item in scheduleInformation.ScheduleItems)
                        {
                            RoomReportEventsResponseDTO roomReportEventsResponseDTO = new RoomReportEventsResponseDTO
                            {
                                Status = item.Status?.ToString(),
                                Subject = item.Subject,
                                Start = item.Start.DateTime,
                                End = item.End.DateTime
                            };

                            roomReportEventsResponseDTOs.Add(roomReportEventsResponseDTO);
                        }
                    }

                    currentStart = chunkEnd.AddDays(1); // Move to the next chunk
                }

                return Result<List<RoomReportEventsResponseDTO>>.Success(roomReportEventsResponseDTOs);
            }


        }
    }

 }

