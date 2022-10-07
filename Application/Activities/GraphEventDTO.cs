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
    }
}
