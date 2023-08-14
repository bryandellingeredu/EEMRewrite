using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class CIOEventPlanningSearchParams
    {
        public string Title { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
        public string Location { get; set; }
        public string ActionOfficer { get; set; }
        public string EventPlanningExternalEventPOCName { get; set; }
        public string EventPlanningExternalEventPOCEmail { get; set; }
        public string EventPlanningStatus { get; set; }
        public string EventPlanningPAX { get; set; }
        public string EventPlanningSetUpDate { get; set; }
        public string EventClearanceLevel { get; set; }

    }
}
