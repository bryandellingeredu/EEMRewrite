using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Calendars
{
    public class CalendarTableDTO
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }    
        public string Title { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Location { get; set; }
        public string ActionOfficer { get; set; }
        public string OrganizationName { get; set; }
        public bool AllDayEvent { get; set; }
    }
}
