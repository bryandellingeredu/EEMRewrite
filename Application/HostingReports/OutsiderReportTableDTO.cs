using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.HostingReports
{
    public class OutsiderReportTableDTO
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string Title { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Location { get; set; }
        public string ActionOfficer { get; set; }
        public string OrganizationName { get; set; }
        public string OutsiderReportStatus { get; set; }
        public string GuestRank { get; set; }
        public string GuestTitle { get; set; }
        public string CreatedBy { get; set; }
        public bool AllDayEvent { get; set; }
        public string OutsiderReportDirectorate { get; set; }
        public string OutsiderReportEngagement { get; set; }
        public string OutsiderReportUSAWCGraduate { get; set; }
        public string OutsiderReportDV { get; set; }
        public string OutsiderReportNumOfPeople { get; set; }
    }
}
