using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.HostingReports
{
    public class HostingReportTableSearchParams
    {
       public string Title { get; set; }
       public string  Start { get; set; }
       public string End { get; set; }
       public string Location { get; set; }
       public string ActionOfficer { get; set; }
      public string OrganizatonId { get; set; }
       public string HostingReportStatus { get; set; }
       public string GuestRank { get; set; }
       public string GuestTitle { get; set; }
       public string CreatedBy { get; set; }
    }
}
