using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.USAHECReports
{
    public class USAHECFacilitiesUsageSearchParams
    {
       public string Title { get; set; }
       public string  Start { get; set; }
       public string End { get; set; }
       public string Location { get; set; }
       public string ActionOfficer { get; set; }
       public string CreatedBy { get; set; }
        public string USAHECFacilityReservationType { get; set; }

    }
}
