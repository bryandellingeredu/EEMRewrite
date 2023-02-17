using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class HostingReport
    {
        public Guid Id { get; set; }
        public Guid ActivityId {get; set;}
        public Activity Activity { get; set; }
        public string PurposeOfVisit { get; set; }
        public bool OfficeCallWithCommandant { get; set; }
        public bool OfficeCallWithCommandantNotificationSent { get; set; }
        public string EscortOfficer { get; set; }   
        public string EscortOfficerPhone { get; set; }
        public bool HostedLocationRootHall { get; set; }
        public bool HostedLocationCollinsHall { get; set; }
        public bool HostedLocationAHEC { get; set; }
        public bool HostedLocationCCR { get; set; }
        public bool HostedLocationWWA { get; set; }
        public string GuestRank { get; set; }
        public string GuestTitle { get; set; }
        public string GuestOfficePhone { get; set; }
        public string GuestName {get; set;}
        public string UniformOfGuest {get; set;}
        public string BioAttachedOrPending {get; set;}
        public string TravelPartyAccomaniedBy {get; set;}
        public string GuestItinerary {get; set;}
        public bool GenerateItinerary {get; set;}
        public bool ViosSupportPhotography {get; set;}
        public bool ViosSupportAV {get; set;}
        public DateTime? Arrival {get; set;}
        public DateTime? Departure {get; set;}
        public DateTime? AVSubmitted {get; set;}
        public DateTime? PhotographSubmitted {get; set;}
        public string ModeOfTravel {get; set;}
        public string TravelArrangementDetails {get; set;}
        public bool MealRequestBreakfast {get; set;}
        public bool MealRequestLunch {get; set;}
        public bool MealRequestDinner {get; set;}
        public bool MealRequestOther {get; set;}
        public string DietaryRestrictions {get; set;}
        public bool LodgingArrangements {get; set;}
        public string LodgingLocation {get; set;}
        public bool LocalTransportationNeeded {get; set;}
        public bool ParkingRequirements {get; set;}
        public bool ParkingRequirementsNotificationSent {get; set;}
        public string ParkingDetails {get; set;}
        public bool FlagSupport {get; set;}
        public bool FlagSupportNotificationSent {get; set;}
        public string FlagIsFor {get; set;}
        public string FlagType {get; set;}
        public string FlagDetails {get; set;}
        public string Gift {get; set;}
        public bool ForeignVisitor {get; set;}
        public bool ForeignVisitorNotificationSent {get; set;}

        public string HostingReportStatus {get; set;}
        public string ReportType {get; set;}
        public string OutsiderReportUSAWCGraduate {get; set;}
        public string OutsiderReportDirectorate {get; set;}
         public string OutsiderReportPOC {get; set;}
         public string OutsiderReportDV {get; set;}
         public string OutsiderReportNumOfPeople {get; set;}
         public string OutsiderReportStatus {get; set;}
         public string OutsiderReportEngagement {get; set;}
         public string CountryOfGuest {get; set;}
        public string TypeOfVisit {get; set;}
        public string ClassificationOfInformationReleased {get; set;}
        public string AdditionalForeignGuestInformation {get; set;}
        public bool HostingReportNotificationSent {get; set;}
        public bool HostingReportApprovalNotificationSent {get; set;}
    
     }
}

