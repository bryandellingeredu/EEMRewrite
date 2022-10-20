using System;
using System.Collections.Generic;
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

    }
}
