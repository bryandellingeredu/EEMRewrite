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
using Application.Activities;
using Domain;

namespace Application.GraphSchedules
{
    public class CheckForSetUpTearDownDoubleBooking
    {
        public class Query : IRequest<Result<CheckForSetUpTearDownDoubleBookingResultDTO>>
        {
            public CheckForSetUpTearDownDoubleBookingDTO CheckForSetUpTearDownDoubleBookingDTO { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<CheckForSetUpTearDownDoubleBookingResultDTO>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<CheckForSetUpTearDownDoubleBookingResultDTO>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                List<CheckForSetUpTearDownDoubleBookingDTO> checkForSetUpTearDownDoubleBookingDTOList = new List<CheckForSetUpTearDownDoubleBookingDTO>();
                bool conflictFound = false;
                StringBuilder conflictMessageBuilder = new StringBuilder();
                TimeZoneInfo easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");

                if (request.CheckForSetUpTearDownDoubleBookingDTO.Recurrence != null)
                {
                  var  activities = Helper.GetActivitiesFromRecurrence(request.CheckForSetUpTearDownDoubleBookingDTO.Recurrence);
                    foreach (var activity in activities)
                    {
                      


                        checkForSetUpTearDownDoubleBookingDTOList.Add(
                            new CheckForSetUpTearDownDoubleBookingDTO
                            {
                                Start = activity.StartDateAsString + "Z",
                                End = activity.EndDateAsString + "Z",
                                Type = request.CheckForSetUpTearDownDoubleBookingDTO.Type,
                                Minutes = request.CheckForSetUpTearDownDoubleBookingDTO.Minutes,
                                RoomEmails = request.CheckForSetUpTearDownDoubleBookingDTO.RoomEmails
                            });
                    }
                }
                else
                {
                    checkForSetUpTearDownDoubleBookingDTOList.Add(request.CheckForSetUpTearDownDoubleBookingDTO);
                }

                foreach (var checkForSetUpTearDownDoubleBookingDTO in checkForSetUpTearDownDoubleBookingDTOList)
                {

                    string jsEventStartDate = checkForSetUpTearDownDoubleBookingDTO.Start;
                    string jsEventEndDate = checkForSetUpTearDownDoubleBookingDTO.End;

                    // Convert the ISO8601 string to DateTime.
                    // Note: DateTime.Parse automatically handles ISO8601 formats.
                    DateTime EventStartDateTime = DateTime.Parse(jsEventStartDate);
                    DateTime EventEndDateTime = DateTime.Parse(jsEventEndDate);

                    DateTime StartDateTime;
                    DateTime EndDateTime;

                    if (checkForSetUpTearDownDoubleBookingDTO.Type == "setup")
                    {
                        double minutesToSubtract = double.Parse(checkForSetUpTearDownDoubleBookingDTO.Minutes);
                        StartDateTime = EventStartDateTime.AddMinutes(-minutesToSubtract);
                        EndDateTime = EventStartDateTime;
                    }
                    else
                    {
                        StartDateTime = EventEndDateTime;
                        double minutesToAdd = double.Parse(checkForSetUpTearDownDoubleBookingDTO.Minutes);
                        EndDateTime = EventEndDateTime.AddMinutes(minutesToAdd);
                    }

                    string startDateAsString = StartDateTime.ToString("o", CultureInfo.InvariantCulture);
                    string endDateAsString = EndDateTime.ToString("o", CultureInfo.InvariantCulture);
                    DateTimeTimeZone startTime = new DateTimeTimeZone
                    {
                        DateTime = startDateAsString,
                        TimeZone = "Eastern Standard Time"
                    };

                    DateTimeTimeZone endTime = new DateTimeTimeZone
                    {
                        DateTime = endDateAsString,
                        TimeZone = "Eastern Standard Time"
                    };

                    ScheduleRequestDTO scheduleRequest = new ScheduleRequestDTO
                    {
                        Schedules = request.CheckForSetUpTearDownDoubleBookingDTO.RoomEmails.ToList(),
                        StartTime = startTime,
                        EndTime = endTime,
                        AvailabilityViewInterval = 15
                    };

                    ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(scheduleRequest);

                    foreach (ScheduleInformation schedule in result.CurrentPage)
                    {
                        if (!string.IsNullOrEmpty(schedule.AvailabilityView) && schedule.AvailabilityView.Any(c => c != '0'))
                        {
                            conflictFound = true;
                            conflictMessageBuilder.AppendLine($"Room {schedule.ScheduleId} has conflicts:");
                            if (schedule.ScheduleItems != null && schedule.ScheduleItems.Any())
                            {
                                foreach (var item in schedule.ScheduleItems)
                                {
                                    conflictMessageBuilder.AppendLine($"   Conflict from {item.Start.DateTime} to {item.End.DateTime}");
                                }
                            }
                            else
                            {
                                conflictMessageBuilder.AppendLine($"   Availability view: {schedule.AvailabilityView}");
                            }

                        }
                    }
                }

                var resultDTO = new CheckForSetUpTearDownDoubleBookingResultDTO
                {
                    IsConflict = conflictFound,
                    Message = conflictFound ? conflictMessageBuilder.ToString() : string.Empty
                };

                return Result<CheckForSetUpTearDownDoubleBookingResultDTO>.Success(resultDTO);


            }
        }


    }
}
