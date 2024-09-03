using Application.DTOs;
using Domain;

namespace Application.Activities
{
    public class GraphEventDTO
    {
        public string EventTitle { get; set; }
        public string EventDescription { get; set; }
        public string[] RoomEmails { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
        public string RequesterFirstName { get; set; }
        public string RequesterLastName { get; set; }
        public string RequesterEmail { get; set; }
        public bool IsAllDay { get; set; }
        public string UserEmail { get; set; }
        public string PrimaryLocation { get; set; }
        public List<TextValueUser> TeamInvites { get; set; }
        public string EventLookup {get; set;}
        public string EventCalendar { get; set;}    
        public string EventCalendarEmail { get; set; }
        public string CreatedBy { get; set; }
        public string Updated { get; set; }
        public string Coordinator { get; set; }

    }
}
