using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RoomReport
    {
        public Guid Id { get; set; }
        public DateTime Day { get; set; }
        public string AvailabilityView { get; set; }
        public string ScheduleId { get; set; }  

    }
}
