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
        public string EventLookupCalendar { get; set; }
         public string EventLookupCalendarEmail { get; set; }
        public string TeamLookup { get; set; }
        public string VTCLookup { get; set; }
        public string TeamLink { get; set; }
        public string TeamRequester { get; set; }
        public string TeamOwner {get; set;}
        public string ArmyTeamLink {get; set;}

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

        [NotMapped]
        public IEnumerable<TextValueUser> TeamInvites { get; set; }

        [NotMapped]
        public bool MakeTeamMeeting { get; set; }

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
        public bool EventClearanceLevelNotificationSent {get; set;}
        public bool CommunityEvent { get; set; }
        public bool MFP { get; set; }
        public string EducationalCategory { get; set; }

        public bool RoomResourceNotificationSent {get; set;}
        public bool CommandantRequested { get; set; }
         public bool CommandantRequestedNotificationSent { get; set; }
        public DateTime? CommandantStart {get; set;}
        public DateTime? CommandantEnd {get; set;}
        public bool DptCmdtRequested { get; set; }
        public bool DptCmdtRequestedNotificationSent { get; set; }
        public DateTime? DptCmdtStart {get; set;}
        public DateTime? DptCmdtEnd {get; set;}
        public bool ProvostRequested { get; set; }
        public bool ProvostRequestedNotificationSent { get; set; }
        public DateTime? ProvostStart {get; set;}
        public DateTime? ProvostEnd {get; set;}
         public bool CofsRequested { get; set; }
        public bool CofsRequestedNotificationSent { get; set; }
        public DateTime? CofsStart {get; set;}
        public DateTime? CofsEnd {get; set;}
        public bool DeanRequested { get; set; }
        public bool DeanRequestedNotificationSent { get; set; }
        public DateTime? DeanStart {get; set;}
        public DateTime? DeanEnd {get; set;}
        public bool AmbassadorRequested { get; set; }
        public bool AmbassadorRequestedNotificationSent { get; set; }
        public DateTime? AmbassadorStart {get; set;}
        public DateTime? AmbassadorEnd {get; set;}
        public bool CSMRequested { get; set; }
        public bool CSMRequestedNotificationSent { get; set; }
        public DateTime? CSMStart {get; set;}
        public DateTime? CSMEnd {get; set;}
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
        public bool AutomationVTC { get; set; }
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
        public string ParkingSpaces { get; set; }
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
        public string GarrisonCategory {get; set;}
        public bool MarketingRequest {get; set;}
        public string SSLCategories {get; set;}
        public string USAHECDirectorate {get; set;}
        public string USAHECCalendarCategory {get; set;}
        public string SpouseCategory {get; set;}
        public string USAHECFacilityReservationType {get; set;}
         public string USAHECContract {get; set;}
        public bool CopyToUSAHECCalendar {get; set;}
        public bool PocketCalNonAcademicEvent {get; set;}
        public string PocketCalWeek {get; set;}
        public string PocketCalLessonNumber {get; set;}
        public string PocketCalPresenter {get; set;}
        public string PocketCalPresenterOrg {get; set;}
        public string PocketCalNotes {get; set;}
        public string VTCClassification {get; set;}
        public string DistantTechPhoneNumber {get; set;}
        public string RequestorPOCContactInfo {get; set;}
        public string DialInNumber {get; set;}
        public string SiteIDDistantEnd {get; set;}
        public bool GOSESInAttendance {get; set;}
        public string SeniorAttendeeNameRank {get; set;}
         public string AdditionalVTCInfo {get; set;}
         public string VTCStatus {get; set;}
         public HostingReport HostingReport {get; set;}
         public int? AttachmentLookup {get; set;}
         public Guid? ActivityAttachmentGroupLookup {get; set;}
         public bool LogicalDeleteInd {get; set;}
        public string DeletedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool BlissHallSupport {get; set;}
        public string BlissHallAVSptRequired {get; set;}
        public bool BlissHallAVNotificationSent { get; set; }
        public bool VTCCoordinatorNotificationSent { get; set; }
        public bool VTCConfirmedConfirmationSent { get; set; }
        public bool EventPlanningNotificationSent {get; set;}
        public bool CCRNotificationSent { get; set; }
        public bool CopiedToacademic { get; set; }
        public bool CopiedToasep { get; set; }
        public bool CopiedTocommandGroup { get; set; }
        public bool CopiedTocommunity { get; set; }
        public bool CopiedTocsl { get; set; }
        public bool CopiedTocio { get; set; }
        public bool CopiedTogarrison { get; set; }
        public bool CopiedTointernationalfellows {get; set;}
        public bool CopiedTogeneralInterest { get; set; }
        public bool CopiedToholiday { get; set; }
        public bool CopiedTopksoi { get; set; }
        public bool CopiedTosocialEventsAndCeremonies { get; set; }
        public bool CopiedTossiAndUsawcPress { get; set; }
        public bool CopiedTossl { get; set; }
        public bool CopiedTotrainingAndMiscEvents { get; set; }
        public bool CopiedTousahec { get; set; }
        public bool CopiedTousahecFacilitiesUsage { get; set; }
        public bool CopiedTovisitsAndTours { get; set; }
        public bool CopiedTosymposiumAndConferences {get; set;}
        public bool CopiedTobattlerhythm {get; set;}
        public bool CopiedTostaff {get; set;}
        public bool CopiedTospouse {get; set;}
        public bool Cancelled { get; set; }
        public string CancelledReason { get; set; }
        public string CancelledBy { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string MarketingCampaignCategory {get; set;}
        public string MarketingProgram {get; set;}
        public bool CopiedTostudentCalendar { get; set; }
        public string StudentCalendarUniform { get; set; }
        public bool StudentCalendarMandatory { get; set; }
        public string StudentCalendarNotes { get; set; }
        public string StudentCalendarPresenter { get; set; }
        public bool EnlistedAideEvent { get; set; }
        public string EnlistedAideFundingType { get; set; }
        public string EnlistedAideVenue { get; set; }
        public string EnlistedAideGuestCount { get; set; }
        public string EnlistedAideCooking { get; set; }
        public string EnlistedAideDietaryRestrictions{ get; set; }
        public string EnlistedAideAlcohol { get; set; }
        public bool EnlistedAideAcknowledged { get; set; }
        public string EnlistedAideNumOfBartenders { get; set; }
        public string EnlistedAideNumOfServers { get; set; }
        public string EnlistedAideSupportNeeded{ get; set; }
        public bool EnlistedAideSetup { get; set; }
        public string EnlistedAideAdditionalRemarks {get; set;}
        public bool NewEnlistedAideEventToAideNotificationSent { get; set; }
        public bool NewEnlistedAideEventToESDNotificationSent { get; set; }
        public bool SendEnlistedAideConfirmationNotification { get; set; }
        public string EventPlanningClassification {get; set;}
        public string EventPlanningExternalEventName {get; set;}
        public string EventPlanningExternalEventPOCName {get; set;}
        public string EventPlanningExternalEventPOCEmail {get; set;}
        public string EventPlanningExternalEventPOCContactInfo {get; set;}
        public string EventPlanningStatus {get; set;}
        public string EventPlanningPAX {get; set;}
        public string EventPlanningCIORequirementsComments {get; set;}
        public bool EventPlanningGovLaptops {get; set;}
        public bool EventPlanningPersonalLaptops {get; set;}
        public bool EventPlanningTablets {get; set;}
        public bool EventPlanningServers {get; set;}
        public bool EventPlanningCellPhones {get; set;}
        public bool EventPlanningNetworkREN{get; set;}
        public bool EventPlanningNetworkWireless{get; set;}
        public bool EventPlanningNetworkNTG{get; set;}
        public bool EventPlanningNetworkNTS{get; set;}
         public bool EventPlanningNetworkSIPR{get; set;}
        public bool EventPlanningNetworkNIPR{get; set;}
        public bool EventPlanningNotifyPOC{get; set;}
        public string EventPlanningNumOfPC {get; set;}
        public string EventPlanningNumOfBYADS {get; set;}
        public string EventPlanningNumOfVOIPs {get; set;}
        public string EventPlanningNumOfPrinters {get; set;}
         public string EventPlanningNumOfPeripherals {get; set;}
        public string EventPlanningNumOfMonitors {get; set;}
        public DateTime? EventPlanningSetUpDate {get; set;}
         public bool SymposiumLinkInd { get; set; }
        public string SymposiumLink {get; set;}
        public bool StudentCalendarResident {get; set;}
        public bool StudentCalendarDistanceGroup1 {get; set;}
        public bool StudentCalendarDistanceGroup2 {get; set;}
        public bool StudentCalendarDistanceGroup3 {get; set;}
        public bool StudentCalendarDistanceGroup1Mandatory {get; set;}
        public bool StudentCalendarDistanceGroup2Mandatory {get; set;}
        public bool StudentCalendarDistanceGroup3Mandatory {get; set;}
        public bool RoomResourceNipr {get; set;}
        public bool RoomResourceSipr {get; set;}
        public bool RoomResourceRen {get; set;}
        public bool RoomResourceNts {get; set;}
        public bool RoomResourceNtg {get; set;}
        public bool RoomResourceNotApplicable {get; set;}
        public bool RoomResourceOther {get; set;}
        public string RoomResourceOtherText {get; set;}
    }
}