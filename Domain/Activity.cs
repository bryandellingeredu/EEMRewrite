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
        public string  Hyperlink { get; set; }
        public string HyperlinkDescription { get; set; }
        public string EventClearanceLevel { get; set; }
        public bool CommunityEvent { get; set; }
        public bool MFP { get; set; }
        public string EducationalCategory { get; set; }
        public bool CommandantRequested { get; set; }
        public bool DptCmdtRequested { get; set; }
        public bool ProvostRequested { get; set; }
         public bool CofsRequested { get; set; }
        public bool DeanRequested { get; set; }
        public bool AmbassadorRequested { get; set; }
        public bool CSMRequested { get; set; }
        public string Report { get; set; }
        public bool IMC { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
        public bool DTI { get; set; }
        public bool Education { get; set; }
        public bool CSLDirectorateCSL {get; set;  }
        public bool CSLDirectorateDSW{ get; set; }
        public bool CSLDirectorateDTI { get; set; }
        public bool CSLDirectorateOPS { get; set; }
        public bool CSLDirectorateSLFG { get; set; }
        public bool CSLDirectorateFellows { get; set; }
        public string PAX { get; set; }
        public bool RoomRequirementBasement { get; set; }
        public bool RoomRequirement1 { get; set; }
        public bool RoomRequirement2 { get; set; }

        public bool RoomRequirement3 { get; set; }
        public bool ParticipationCmdt { get; set; }
        public bool ParticipationGO{ get; set; }
        public bool ParticipationDir { get; set; }
        public bool ParticipationForeign { get; set; }
        public bool AutomationProjection { get; set; }
        public bool AutomationCopiers { get; set; }
        public bool AutomationPC { get; set; }
        public bool AutomationTaping { get; set; }
        public string AutomationComments { get; set; }
        public string CommunicationSupport { get; set; }
        public string FaxClassification { get; set; }
        public string CommunicationComments{ get; set; }
        public bool Catering { get; set; }
        public bool CateringAreaArdennes { get; set; }
        public bool CateringArea18 { get; set; }
        public bool CateringArea22 { get; set; }
        public bool CateringBreakArea18 { get; set; }
        public bool CateringBreakArea22 { get; set; }
        public string CateringComments { get; set; }
        public string Transportation { get; set; }
        public bool ParkingPasses { get; set; }
        public string TransportationComments { get; set; }
        public bool SecurityBadgeIssue { get; set; }
        public bool SecurityAfterDutyAccess { get; set; }
        public string SecurityComments { get; set; }
        public bool Registration { get; set; }
        public string RegistrationLocation { get; set; }
        public string SuppliesComments { get; set; }

        public string OtherComments { get; set; }
        public string ApprovedByOPS { get; set; }
        public bool CheckedForOpsec {get; set;}

    }
}