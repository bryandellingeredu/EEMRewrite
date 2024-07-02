using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RoomReport
{
    public class RoomReportEventsRequestDTO
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Email { get; set; }
    }
}
