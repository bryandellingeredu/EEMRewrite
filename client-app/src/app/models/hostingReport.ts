export interface HostingReport{
    purposeOfVisit: string
    officeCallWithCommandant: boolean
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
parkingDetails:	string
flagSupport: boolean
flagIsFor:	string
flagType:	string
giftRequirement:	string
foreignVisitor:	boolean
hostingReportStatus:	string
}