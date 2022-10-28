using AutoMapper;
using Domain;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
    public static class Helper
    {
        private static IMapper _mapper;
        public static IMapper Mapper
        {
            get { return _mapper; }
        }

        public static void InitHelper(IMapper mapper)
        {
            _mapper = mapper;   
        }



        public static List<Activity> GetActivitiesFromRecurrence(Recurrence recurrence, Activity activity)
        {
            List<Activity> activities = new List<Activity>();
            List<DateTime> allDates = new List<DateTime>();

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
                                if (
                                    d.Date >= recurrence.IntervalStart.Date &&
                                    (d.Date.Month == currentMonth || currentMonth == 0) &&
                                    Enum.GetName(dayOfWeek) == Enum.GetName(d.DayOfWeek) &&
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
                        } else
                        {
                            while (index < monthsRepeating)
                            {
                                if (d.Date.Day == Int32.Parse(recurrence.DayOfMonth))
                                {
                                    allDates.Add(new DateTime(d.Year, d.Month, d.Day));
                                    index++;
                                }
                                d = d.AddDays(1);
                            }
                        }
                    } else
                    {
                        while (d.Date <= recurrence.IntervalEnd.Date)
                        {
                            if (recurrence.MonthlyDayType == "number" )
                            {
                                var dayOfWeek = recurrence.WeekdayOfMonth == "0" ? System.DayOfWeek.Sunday
                               : recurrence.WeekdayOfMonth == "1" ? System.DayOfWeek.Monday
                               : recurrence.WeekdayOfMonth == "2" ? System.DayOfWeek.Tuesday
                               : recurrence.WeekdayOfMonth == "3" ? System.DayOfWeek.Wednesday
                               : recurrence.WeekdayOfMonth == "4" ? System.DayOfWeek.Thursday
                               : recurrence.WeekdayOfMonth == "5" ? System.DayOfWeek.Friday
                               : System.DayOfWeek.Saturday;

                                if (
                                   d.Date >= recurrence.IntervalStart.Date &&
                                   Enum.GetName(dayOfWeek) == Enum.GetName(d.DayOfWeek) &&
                                   recurrence.WeekOfMonth == GetWeekOfMonth(d, dayOfWeek)
                                   )
                                {
                                    allDates.Add(new DateTime(d.Year, d.Month, d.Day));
                                }

                            }
                            else // they picked monthly, a day of the month, and an end date
                            {
                                if (d.Date.Day == Int32.Parse(recurrence.DayOfMonth))
                                {
                                    allDates.Add(new DateTime(d.Year, d.Month, d.Day));
                                }
                            }
                            d = d.AddDays(1);
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

        public static string GetWeekOfMonth(DateTime date, DayOfWeek dayOfWeek)
        {
            date = date.Date;
            DateTime firstMonthDay = new DateTime(date.Year, date.Month, 1);
            DateTime firstMonthWeekday = firstMonthDay.AddDays((dayOfWeek + 7 - firstMonthDay.DayOfWeek) % 7);
            if (firstMonthWeekday > date)
            {
                firstMonthDay = firstMonthDay.AddMonths(-1);
                firstMonthWeekday = firstMonthDay.AddDays((dayOfWeek + 7 - firstMonthDay.DayOfWeek) % 7);
            }
            var result = ((date - firstMonthWeekday).Days / 7 + 1).ToString();
            return result;
        }

    }
}
