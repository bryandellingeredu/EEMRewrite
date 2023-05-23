using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Recurrence
    {
        public Guid Id { get; set; }
        public bool Sunday { get; set; }
        public bool Monday { get; set; }
        public bool Tuesday { get; set; }
        public bool Wednesday { get; set; }
        public bool Thursday { get; set; }
        public bool Friday { get; set; }
        public bool Saturday { get; set; }
        public string Interval { get; set; }
        public string DayOfMonth { get; set; }
        public string WeekOfMonth { get; set; }
        public string WeekdayOfMonth { get; set; }
        public DateTime IntervalStart { get; set; }
        public DateTime IntervalEnd { get; set; }
        public bool IncludeWeekends { get; set; }
        public string DaysRepeating { get; set; }
        public string WeeksRepeating { get; set; }
        public string MonthsRepeating { get; set; }
        public string WeekInterval { get; set; }
        public string WeekendsIncluded { get; set; }
        public string WeeklyRepeatType { get; set; }
        public string MonthlyRepeatType { get; set; }
        public string MonthlyDayType { get; set; }
        public IEnumerable<Activity> Activities { get; set; }
        [NotMapped]
        public DateTime? ActivityStart { get; set; }
        [NotMapped]
        public DateTime? ActivityEnd { get; set; }

        public bool ArePropertiesEqual(Recurrence other)
        {
            bool isEqual = true;

            if (other == null)
                return false;

            isEqual &= Sunday == other.Sunday;
            isEqual &= Monday == other.Monday;
            isEqual &= Tuesday == other.Tuesday;
            isEqual &= Wednesday == other.Wednesday;
            isEqual &= Thursday == other.Thursday;
            isEqual &= Friday == other.Friday;
            isEqual &= Saturday == other.Saturday;
            isEqual &= string.Equals(Interval, other.Interval);
            isEqual &= string.Equals(DayOfMonth, other.DayOfMonth);
            isEqual &= string.Equals(WeekOfMonth, other.WeekOfMonth);
            isEqual &= string.Equals(WeekdayOfMonth, other.WeekdayOfMonth);
            isEqual &= IntervalStart == other.IntervalStart;
            isEqual &= IntervalEnd == other.IntervalEnd;
            isEqual &= IncludeWeekends == other.IncludeWeekends;
            isEqual &= string.Equals(DaysRepeating, other.DaysRepeating);
            isEqual &= string.Equals(WeeksRepeating, other.WeeksRepeating);
            isEqual &= string.Equals(MonthsRepeating, other.MonthsRepeating);
            isEqual &= string.Equals(WeekInterval, other.WeekInterval);
            isEqual &= string.Equals(WeekendsIncluded, other.WeekendsIncluded);
            isEqual &= string.Equals(WeeklyRepeatType, other.WeeklyRepeatType);
            isEqual &= string.Equals(MonthlyRepeatType, other.MonthlyRepeatType);
            isEqual &= string.Equals(MonthlyDayType, other.MonthlyDayType);

            return isEqual;
        }


    }
}
