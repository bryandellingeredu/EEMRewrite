using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.PocketCalendar
{
    public class PocketCalendarDTO
    {

        public DateTime Start { get; set; }
        public DateTime End { get; set; } 
        public string Title { get; set; }   
        public string Description { get; set; } 
        public string RoomEmail { get; set; }
    }
}
