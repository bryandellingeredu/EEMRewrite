using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.HostingReports
{
    public class HostingReportTableDTO
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }    
        public string Title { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Location { get; set; }
        public string ActionOfficer { get; set; }
        public string OrganizatonName { get; set; }
        public string HostingReportStatus { get; set; }
        public string GuestRank { get; set; }
        public string GuestTitle { get; set; }
        public string CreatedBy { get; set; }
        public bool AllDayEvent { get; set; }
    }
}
