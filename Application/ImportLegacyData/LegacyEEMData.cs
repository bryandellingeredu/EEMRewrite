using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.ImportLegacyData
{
    public class LegacyEEMData
    {
        public string Title { get; set; }
        public string EventDetails { get; set; }
        public DateTime Start { get; set; }
        public DateTime End{ get; set; }
        public string Resources { get; set; } 
        public string Location { get; set; }    
        public string ActionOfficer { get; set; }
        public string ActionOfficerPhone { get; set; }
        public string LeadOrg { get; set; }
        public string SubCalendar { get; set; }
        public bool AllDayEvent { get; set; }
        public bool IMC { get; set; }
        public bool CateringBreakArea22 { get; set; }
        public bool CateringBreakArea18 { get; set; }
        public bool CheckedForOpsec { get; set; }
        public bool CommunityEvent { get; set; }
        public bool CopiedToUSAHECCalendar { get; set; }
        public string CSLDirectorate { get; set; }
        public string GarrisonCategory { get; set; }
        public bool GOSESInAttendance { get; set; }
        public string USAHECCalendarCategory { get; set; }
        public string USAHECDirectorate { get; set; }
        public string EducationalCategory { get; set; }
        public string EventClearanceLevel { get; set; }
        public bool MarketingRequest { get; set; }
        public bool MFP { get; set; }
        public string SSLCategories { get; set; }
        public bool Education { get; set; }
        public string ApprovedByOPS { get; set; }
    }
}
