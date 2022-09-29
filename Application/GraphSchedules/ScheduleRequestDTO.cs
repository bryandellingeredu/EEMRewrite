using Microsoft.Graph;

namespace Application.GraphSchedules
{
    public class ScheduleRequestDTO
    {
        public List<string> Schedules { get; set; }
        public DateTimeTimeZone StartTime { get; set; }
        public DateTimeTimeZone EndTime { get; set; }
        public int AvailabilityViewInterval { get; set; }
    }
}
