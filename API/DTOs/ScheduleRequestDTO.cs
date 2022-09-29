using Microsoft.Graph;

namespace API.DTOs
{
    public class ScheduleRequestDTO
    {
       public List<String> Schedules { get; set; }
       public DateTimeTimeZone StartTime { get; set; }
       public DateTimeTimeZone EndTime { get; set; }
       public int AvailabilityViewInterval { get; set; }
    }
}
