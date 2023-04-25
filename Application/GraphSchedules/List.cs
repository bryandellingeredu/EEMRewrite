using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Application.Core;
using FluentValidation;
using System.Globalization;

namespace Application.GraphSchedules
{
    public class List
    {
        public class Command : IRequest<Result<List<ScheduleInformation>>>
        {
            public ScheduleRequestDTO ScheduleRequestDTO { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.ScheduleRequestDTO).SetValidator(new GraphScheduleValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<List<ScheduleInformation>>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<List<ScheduleInformation>>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                DateTime startDateTime = DateTime.Parse(request.ScheduleRequestDTO.StartTime.DateTime, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
                DateTime endDateTime = DateTime.Parse(request.ScheduleRequestDTO.EndTime.DateTime, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
                var startDate = startDateTime.Date;
                var endDate = endDateTime.Date;
                TimeSpan duration = endDate - startDate;
                double daysBetween = duration.TotalDays;

                if (daysBetween > 60)
                {
                    int interval = 60;
                    int intervalCount = (int)Math.Ceiling(daysBetween / interval);
                    Tuple<DateTime, DateTime>[] intervals = new Tuple<DateTime, DateTime>[intervalCount];

                    for (int i = 0; i < intervalCount; i++)
                    {
                        DateTime sDT = startDateTime.AddDays(i * interval);
                        DateTime eDT= startDateTime.AddDays((i + 1) * interval - 1);
                        if (endDate > endDateTime)
                        {
                            endDate = endDateTime;
                        }
                        intervals[i] = new Tuple<DateTime, DateTime>(sDT, eDT);
                    }

                   List<ScheduleInformation> scheduleInformationList = new List<ScheduleInformation>();


                    var tasks = intervals.Select(async item =>
                    {
                        ScheduleRequestDTO scheduleRequestDTO = new ScheduleRequestDTO
                        {
                            Schedules = request.ScheduleRequestDTO.Schedules,
                            StartTime = new DateTimeTimeZone { DateTime = ConvertToDateTimeTimeZone(item.Item1, true), TimeZone = request.ScheduleRequestDTO.StartTime.TimeZone },
                            EndTime = new DateTimeTimeZone { DateTime = ConvertToDateTimeTimeZone(item.Item2, false), TimeZone = request.ScheduleRequestDTO.EndTime.TimeZone },
                            AvailabilityViewInterval = request.ScheduleRequestDTO.AvailabilityViewInterval
                        };

                        var scheduleCollectionPage = await GraphHelper.GetScheduleAsync(scheduleRequestDTO);
                        foreach (var scheduleInformation in scheduleCollectionPage.CurrentPage)
                        {
                            scheduleInformationList.Add(scheduleInformation);
                        }
                    });

                    await Task.WhenAll(tasks);

                    var result = scheduleInformationList.GroupBy(x => x.ScheduleId)
                      .Select(g => new ScheduleInformation
                      {
                          ScheduleId = g.Key,
                          WorkingHours = g.First().WorkingHours,
                          AdditionalData = g.First().AdditionalData,
                          ScheduleItems = g.SelectMany(x => x.ScheduleItems).ToList()
                      })
                      .ToList();

                    foreach (var item in result)
                     {
                        if (item.ScheduleItems != null)
                        {
                            item.ScheduleItems = item.ScheduleItems.Where(x => x.Status != FreeBusyStatus.Free);
                        }
                    } 

                    return Result<List<ScheduleInformation>>.Success(result);
                }
                else
                {
                    ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(request.ScheduleRequestDTO);
                    List<ScheduleInformation> scheduleInformationList = new List<ScheduleInformation>();
                    foreach (var scheduleInformation in result.CurrentPage)
                    {
                        scheduleInformationList.Add(scheduleInformation);
                    }
                    foreach (var item in scheduleInformationList)
                    {
                        if (item.ScheduleItems != null)
                        {
                            item.ScheduleItems = item.ScheduleItems.Where(x => x.Status != FreeBusyStatus.Free);
                        }
                    }
                    return Result<List<ScheduleInformation>>.Success(scheduleInformationList);
                }              
            }

            private string ConvertToDateTimeTimeZone(DateTime  dateTime, bool  isStart)
            {
                var date = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59);
                string dateString = date.ToString("yyyy-MM-ddTHH:mm:ss.fffffff");
                return dateString;
            }
        }
    }
}
