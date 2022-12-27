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
        public bool AllDay { get; set; }
        public string Description { get; set; }
        public string PrimaryLocation { get; set; }
        public string LeadOrg { get; set; }
        public string ActionOfficer { get; set; }
        public string ActionOfficerPhone { get; set; }
        public string CoordinatorEmail { get;  set; }
        public string EventLookup { get;  set; }
        public string CategoryName { get; set; }
    }
}
