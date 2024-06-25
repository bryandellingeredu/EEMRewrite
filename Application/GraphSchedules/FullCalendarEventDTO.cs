using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphSchedules
{
    public class FullCalendarEventDTO
    {
        public string Id { get; set; }
        public string ActivityId {get; set;}
        public string Title { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
        public string StartForICS { get; set; }
        public string EndForICS { get; set; }
        public string CategoryId { get; set; }
        public string ActivityCategoryId { get; set; }
        public string Color { get; set; }
        public string TextColor { get; set; }
        public string BorderColor { get; set; }
        public bool AllDay { get; set; }
        public string Description { get; set; }
        public string PrimaryLocation { get; set; }
        public string LeadOrg { get; set; }
        public string ActionOfficer { get; set; }
        public string ActionOfficerPhone { get; set; }
        public string CoordinatorEmail { get;  set; }
        public string EventLookup { get;  set; }
        public string CategoryName { get; set; }
        public bool Recurring {get; set;}
        public string VTCClassification { get; set; }
        public string DistantTechPhoneNumber { get; set; }
        public string RequestorPOCContactInfo { get; set; }
        public string DialInNumber { get; set; }
        public string SiteIDDistantEnd { get; set; }
        public string SeniorAttendeeNameRank { get; set; }
        public string AdditionalVTCInfo { get; set; }
        public string VTCStatus { get; set; }
        public string StudentCalendarPresenter { get; set; }
        public string StudentCalendarUniform { get; set; }
        public string  StudentCalendarNotes { get; set; }
       public bool  StudentCalendarMandatory { get; set; }
        public string RoomId { get; set; }
        public string EventTitle { get; set; }
        public string Task { get; set; }
        public string EnlistedAideFundingType { get; set; }
        public string EnlistedAideVenue { get; set; }
        public string EnlistedAideGuestCount { get; set; }
        public string EnlistedAideCooking { get; set; }
        public string EnlistedAideDietaryRestrictions { get; set; }
        public string EnlistedAideAlcohol { get; set; }
        public bool EnlistedAideAcknowledged { get; set; }
        public string EnlistedAideNumOfBartenders { get; set; }
        public string EnlistedAideNumOfServers { get; set; }
        public string EnlistedAideSupportNeeded { get; set; }
        public string HyperLink { get; set; }
        public string HyperLinkDescription { get; set; }
        public string EducationalCategory { get; set; }
        public string SpouseCategory { get; set; }
        public string EventPlanningPAX { get; set; }
        public string EventPlanningStatus { get; set; }
        public string EventClearanceLevel { get; set; }
        public bool TeamInd { get; set; }
        public string TeamLink { get; set; }
        public bool CopiedTosymposiumAndConferences { get; set; }
        public bool SymposiumLinkInd { get; set; }
        public string SymposiumLink { get; set; }
        public bool StudentCalendarResident { get; set; }
        public bool StudentCalendarDistanceGroup1 { get; set; }
        public bool StudentCalendarDistanceGroup2 { get; set; }
        public bool StudentCalendarDistanceGroup3 { get; set; }
        public string StudentType { get; set; } 
         public string ResourceId { get; set; }

    }
}
