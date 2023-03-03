export interface HostingReport{
    purposeOfVisit: string
    officeCallWithCommandant: boolean
    officeCallWithCommandantNotificationSent: boolean
    escortOfficer: string
    escortOfficerPhone: string
    hostedLocationRootHall: boolean
    hostedLocationCollinsHall: boolean
    hostedLocationAHEC: boolean
    hostedLocationCCR: boolean
    hostedLocationWWA: boolean
    guestRank: string
    guestTitle: string
    guestOfficePhone: string
    guestName:	string
    uniformOfGuest:	string
bioAttachedOrPending:	string
bioIsPendingNotificationSent: boolean
travelPartyAccomaniedBy:	string
guestItinerary:	string
generateItinerary:	boolean
viosSupportPhotography:	boolean
viosSupportAV:	boolean
arrival: Date | null
departure: Date | null
avSubmitted: Date | null
photographSubmitted: Date | null
modeOfTravel: string
travelArrangementDetails: string
mealRequestBreakfast:	boolean
mealRequestLunch:	boolean
mealRequestDinner:	boolean
mealRequestOther:	boolean
dietaryRestrictions:	string
lodgingArrangements:	boolean
lodgingLocation:	string
localTransportationNeeded:	boolean
parkingRequirements:	boolean
parkingRequirementsNotificationSent: boolean
parkingDetails:	string
flagSupport: boolean
flagSupportNotificationSent: boolean
flagIsFor:	string
flagType:	string
flagDetails: string
gift: string
foreignVisitor:	boolean
foreignVisitorNotificationSent: boolean
hostingReportStatus: string
reportType: string
outsiderReportUSAWCGraduate: string
outsiderReportDirectorate: string
outsiderReportPOC: string
outsiderReportDV: string
outsiderReportNumOfPeople: string
outsiderReportStatus: string
outsiderReportEngagement: string
countryOfGuest: string
typeOfVisit: string
classificationOfInformationReleased: string
additionalForeignGuestInformation: string
hostingReportNotificationSent: boolean
hostingReportApprovalNotificationSent: boolean

}