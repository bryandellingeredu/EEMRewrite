using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class SVTCSearchParams
    {
        public string Title { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
        public string Location { get; set; }
        public string ActionOfficer { get; set; }
        public string VTCClassification { get; set; }
        public string DistantTechPhoneNumber { get; set; }
        public string RequestorPOCContactInfo { get; set; }
        public string DialInNumber { get; set; }
        public string SiteIDDistantEnd { get; set; }
        public string GOSESInAttendance { get; set; }
        public string SeniorAttendeeNameRank { get; set; }
        public string AdditionalVTCInfo { get; set; }
        public string VTCStatus { get; set; }
    }
}
