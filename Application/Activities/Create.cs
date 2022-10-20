using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System.Diagnostics;
using Activity = Domain.Activity;
using Azure.Core;
using System.Globalization;
using Microsoft.Graph.ExternalConnectors;
using DayOfWeek = System.DayOfWeek;
using Persistence.Migrations;
using Recurrence = Domain.Recurrence;

namespace Application.Activities
{
    public class Create
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

            public Handler(DataContext context, IMapper mapper, IConfiguration config)
            {
                _context = context;
                _mapper = mapper;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                //begin if the user is signed into edu (coordinator email is populated) create an outlook event

                try
                {
                    List<Activity> activities = new List<Activity>();

                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                    if (request.Activity.RecurrenceInd && request.Activity.Recurrence != null)
                    {
                        Recurrence recurrence = new Recurrence();
                        _mapper.Map(request.Activity.Recurrence, recurrence);
                        _context.Recurrences.Add(recurrence);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to Create Recurrence");
                        activities = GetActivitiesFromRecurrence(recurrence, request.Activity);
                    }
                    else
                    {
                        Activity activity = new Activity();
                        _mapper.Map(request.Activity, activity);
                        activities.Add(activity);
                    }

                    foreach (var a in activities)
                    {
                        if (request.Activity.RecurrenceInd && request.Activity.Recurrence != null)
                        {
                            a.RecurrenceId = request.Activity.Recurrence.Id;
                        }

                        if (!string.IsNullOrEmpty(a.CoordinatorEmail))
                        {
                            //create outlook event
                            GraphEventDTO graphEventDTO = new GraphEventDTO
                            {
                                EventTitle = a.Title,
                                EventDescription = a.Description,
                                Start = a.StartDateAsString,
                                End = a.EndDateAsString,
                                RoomEmails = a.RoomEmails,
                                RequesterEmail = a.CoordinatorEmail,
                                RequesterFirstName = a.CoordinatorFirstName,
                                RequesterLastName = a.CoordinatorLastName,
                                IsAllDay = a.AllDayEvent
                            };
                            Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                            a.EventLookup = evt.Id;

                        }
                        else
                        // user is not logged onto edu so do not make an outlook event
                        {
                            _context.Activities.Add(a);
                        }
                        _context.Activities.Add(a);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to Create Activity");
                    }
                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception e)
                {

                    throw;
                }
            }

            private List<Activity> GetActivitiesFromRecurrence(Recurrence recurrence, Activity activity)
            {
                List<Activity> activities = new List<Activity>();
                List<DateTime> allDates = new List<DateTime>();
                //for (DateTime date = recurrence.IntervalStart; date <= recurrence.IntervalEnd; date = date.AddDays(1))
                //allDates.Add(date);

                switch (recurrence.Interval)
                {
                    case "daily":
                        int daysRepeating = Int32.Parse(recurrence.DaysRepeating);
                        int index = 0;
                        DateTime d = recurrence.IntervalStart;

                        while (index < daysRepeating)
                        {
                            if ((recurrence.WeekendsIncluded == "no" && d.DayOfWeek != System.DayOfWeek.Saturday && d.DayOfWeek != System.DayOfWeek.Sunday) || recurrence.WeekendsIncluded == "yes")
                            {
                                allDates.Add(new DateTime(d.Year, d.Month, d.Day));
                                index++;
                            }
                            d = d.AddDays(1);
                        }
                        break;
                    case "weekly":
                
                        d = recurrence.IntervalStart;
                        if (recurrence.WeeklyRepeatType == "number")
                        {
                            index = 0;
                            int weekssRepeating = Int32.Parse(recurrence.WeeksRepeating);
                         
                            while (index < weekssRepeating)
                            {
                                for (int j = 0; j < 7; j++)
                                {
                                    if (d.DayOfWeek == System.DayOfWeek.Sunday && recurrence.Sunday ||
                                      d.DayOfWeek == System.DayOfWeek.Monday && recurrence.Monday ||
                                      d.DayOfWeek == System.DayOfWeek.Tuesday && recurrence.Tuesday ||
                                      d.DayOfWeek == System.DayOfWeek.Wednesday && recurrence.Wednesday ||
                                      d.DayOfWeek == System.DayOfWeek.Thursday && recurrence.Thursday ||
                                      d.DayOfWeek == System.DayOfWeek.Friday && recurrence.Friday ||
                                      d.DayOfWeek == System.DayOfWeek.Saturday && recurrence.Saturday               
                                    )
                                    {
                                        allDates.Add(new DateTime(d.Year, d.Month, d.Day));
                                    }
                                    d = d.AddDays(1);
                                }
                                index++;
                                if (recurrence.WeekInterval == "2")
                                {
                                    d = d.AddDays(7);
                                }
                                if (recurrence.WeekInterval == "3")
                                {
                                    d = d.AddDays(14);
                                }
                            }
                        }
                        else
                        {
                            while (d.Date <= recurrence.IntervalEnd.Date)
                            {

                                for (int j = 0; j < 7; j++)
                                {
                                    if (d.DayOfWeek == System.DayOfWeek.Sunday && recurrence.Sunday ||
                                      d.DayOfWeek == System.DayOfWeek.Monday && recurrence.Monday ||
                                      d.DayOfWeek == System.DayOfWeek.Tuesday && recurrence.Tuesday ||
                                      d.DayOfWeek == System.DayOfWeek.Wednesday && recurrence.Wednesday ||
                                      d.DayOfWeek == System.DayOfWeek.Thursday && recurrence.Thursday ||
                                      d.DayOfWeek == System.DayOfWeek.Friday && recurrence.Friday ||
                                      d.DayOfWeek == System.DayOfWeek.Saturday && recurrence.Saturday
                                    )
                                    {
                                        if (d.Date <= recurrence.IntervalEnd.Date)
                                        {
                                            allDates.Add(new DateTime(d.Year, d.Month, d.Day));
                                        }
                                    }
                                    d = d.AddDays(1);
                                   
                                }
                                if (recurrence.WeekInterval == "2")
                                {
                                    d = d.AddDays(7);
                                }
                                if (recurrence.WeekInterval == "3")
                                {
                                    d = d.AddDays(14);
                                }
                            }
                        }
                        break;
                    default:
                        d = recurrence.IntervalStart;
                        index = 0;
                        int currentMonth = 0;
                        if (recurrence.MonthlyRepeatType == "number")
                        {
                            int monthsRepeating = Int32.Parse(recurrence.MonthsRepeating);
                            if (recurrence.MonthlyDayType == "number")
                            {
                                var dayOfWeek = recurrence.WeekdayOfMonth == "0" ? System.DayOfWeek.Sunday
                                    : recurrence.WeekdayOfMonth == "1" ? System.DayOfWeek.Monday
                                    : recurrence.WeekdayOfMonth == "2" ? System.DayOfWeek.Tuesday
                                    : recurrence.WeekdayOfMonth == "3" ? System.DayOfWeek.Wednesday
                                    : recurrence.WeekdayOfMonth == "4" ? System.DayOfWeek.Thursday
                                    : recurrence.WeekdayOfMonth == "5" ? System.DayOfWeek.Friday
                                    : System.DayOfWeek.Saturday;


                                while (index < monthsRepeating)
                                {
                                    if(
                                        d.Date >= recurrence.IntervalStart.Date &&
                                        (d.Date.Month == currentMonth || currentMonth == 0) &&
                                        Enum.GetName(dayOfWeek) == Enum.GetName(d.DayOfWeek)  &&
                                        recurrence.WeekOfMonth == GetWeekOfMonth(d, dayOfWeek)
                                        )
                                        
                                    {
                                        allDates.Add(new DateTime(d.Year, d.Month, d.Day));
                                        index++;
                                        if (currentMonth == 0)
                                        {
                                            currentMonth = d.Month;
                                        }
                                        currentMonth++;
                                        if (currentMonth > 12)
                                        {
                                            currentMonth = 1;
                                        }
                                    }
                                    d = d.AddDays(1);

                                }
                            }
                        }
                            break;
                }
                int i = 0;
                foreach (var day in allDates)
                {
                    Activity a = new Activity();
                    _mapper.Map(activity, a);
                    if (i > 0)
                    {
                        a.Id = new Guid();
                    }
                    var start = new DateTime(day.Year, day.Month, day.Day, a.Start.Hour, a.Start.Minute, 0);
                    var end = new DateTime(day.Year, day.Month, day.Day, a.End.Hour, a.End.Minute, 0);
                    var easternStart = TimeZone.CurrentTimeZone.ToLocalTime(start);
                    var easternEnd = TimeZone.CurrentTimeZone.ToLocalTime(end);
                    // var startDateAsString = $"{easternStart.Year.ToString()}-{easternStart.Month.ToString("00")}-{easternStart.Day.ToString("00")}T{easternStart.Hour.ToString("00")}:{easternStart.Minute.ToString("00")}.0000000";
                    // var endDateAsString = $"{easternEnd.Year.ToString()}-{easternEnd.Month.ToString("00")}-{easternEnd.Day.ToString("00")}T{easternEnd.Hour.ToString("00")}:{easternEnd.Minute.ToString("00")}.0000000";
                    var startDateAsString = easternStart.ToString("o", CultureInfo.InvariantCulture);
                    var endDateAsString = easternEnd.ToString("o", CultureInfo.InvariantCulture);
                    a.Start = start;
                    a.End = end;
                    a.StartDateAsString = startDateAsString;
                    a.EndDateAsString = endDateAsString;
                    activities.Add(a);
                    i++;
                }
                return activities;
            }

            private string GetWeekOfMonth(DateTime date, DayOfWeek dayOfWeek)
            {
                date = date.Date;
                DateTime firstMonthDay = new DateTime(date.Year, date.Month, 1);
                DateTime firstMonthWeekday = firstMonthDay.AddDays((dayOfWeek + 7 - firstMonthDay.DayOfWeek) % 7);
                if (firstMonthWeekday > date)
                {
                    firstMonthDay = firstMonthDay.AddMonths(-1);
                    firstMonthWeekday = firstMonthDay.AddDays((dayOfWeek + 7 - firstMonthDay.DayOfWeek) % 7);
                }
                return ((date - firstMonthWeekday).Days / 7 + 1).ToString();
            }

          
        }
    }
}