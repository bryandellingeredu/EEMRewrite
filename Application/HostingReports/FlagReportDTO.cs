using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.HostingReports
{
    public class FlagReportDTO
    {
        public string StartDate { get; set; }
        public string Name { get; set; }
        public string Rank { get; set; }
        public string Title { get; set; }
        public string PurposeOfVisit { get; set; }
        public string SetupTime { get; set; }   
        public string StartTime { get; set; }
        public string ActionOfficer { get; set; }
        public string ActionOfficerPhone { get; set; }
        public string FlagDetails { get; set; }
        public Guid ActivityId { get; set; }
        public Guid CategoryId { get; set; }
        public string Year { get; set; }    
        public string Location { get; set; }

    }
}
