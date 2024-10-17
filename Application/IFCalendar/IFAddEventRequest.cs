using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IFCalendar
{
    public class IFAddEventRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ActionOfficer { get; set; }
        public string ActionOfficerPhone { get; set; }
        public bool NeedRoom { get; set; } 
        public string SelectedRoomEmail { get; set; }
        public string PrimaryLocation { get; set; }
        public bool EventTypeStudent { get; set; }
        public bool InternationalFellowsStaffEventPrivate { get; set; }
        public string InternationalFellowsStaffEventCategory { get; set; }  
        public bool StudentAttendanceMandatory { get; set; }
        public string StudentCalendarPresenter { get; set; }
        public string StudentCalendarUniform { get; set; }
        public string StudentCalendarNotes { get; set; }
    }
}
