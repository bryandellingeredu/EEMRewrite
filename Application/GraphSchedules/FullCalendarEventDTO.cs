using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphSchedules
{
    public class FullCalendarEventDTO
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
        public string CategoryId { get; set; }
        public string Color { get; set; }
    }
}
