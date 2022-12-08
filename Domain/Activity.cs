using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class Activity
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public bool AllDayEvent { get; set; }
        public DateTime Start {get; set;}
        public DateTime End { get; set; }
        public string Description {get; set;}
        public string ActionOfficer { get; set; }
        public string ActionOfficerPhone { get; set; }

        public string PrimaryLocation { get; set; }

        [NotMapped]
        public string[] RoomEmails { get; set; }


        [NotMapped]
        public string StartDateAsString { get; set; }

        [NotMapped]
        public string EndDateAsString { get; set; }

        public string CoordinatorEmail { get; set; }

        public string CoordinatorDisplayName{ get; set; }

        public string EventLookup { get; set; }

        [NotMapped]
        public string CoordinatorFirstName { get; set; }

        [NotMapped]
        public string CoordinatorLastName { get; set; }

        public Guid CategoryId { get; set; }
        public Category Category { get; set; }

        public Guid? OrganizationId { get; set; }
        public Organization Organization { get; set; }

        [NotMapped]
        public IEnumerable<ActivityRoom> ActivityRooms { get; set; }

        public bool RecurrenceInd { get; set; }
        public Guid? RecurrenceId { get; set; }
        public Recurrence Recurrence { get; set; }

        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string LastUpdatedBy { get; set; }
        public DateTime? LastUpdatedAt { get; set; }

        public string NumberAttending { get; set; }
        public string RoomSetUp { get; set; }
        public bool VTC { get; set; }
        public string PhoneNumberForRoom { get; set; }
        public string RoomSetUpInstructions { get; set; }
        public bool G5Calendar { get; set; }
        public string G5Organization { get; set; }


    }
}