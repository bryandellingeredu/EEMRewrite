import { store } from "../stores/store";
import { Category } from "./category";
import { Organization } from "./organization";
import { ActivityRoom } from "./activityRoom"
import { Recurrence } from "./recurrence";
import { HostingReport } from "./hostingReport";
import { UserEmail } from "./userEmail";


const commonStore = store.commonStore;
const {roundToNearest15} = commonStore;

export interface Activity{
    id: string,
    title: string,
    description: string,
    categoryId: string,
    category: Category,
    organizationId: string | null,
    organization: Organization | null,
    hostingReport: HostingReport  | null,
    start: Date,
    end: Date,
    allDayEvent: boolean,
    actionOfficer: string,
    actionOfficerPhone: string,
    primaryLocation: string,
    roomEmails: string[],
    startDateAsString : string,
    endDateAsString: string,
    coordinatorEmail: string,
    coordinatorFirstName: string,
    coordinatorLastName: string,
    coordinatorName: string,
    eventLookup: string,
    eventLookupCalendar: string,
    teamLookup: string,
    vtcLookup: string,
    teamLink: string,
    armyTeamLink: string,
    teamRequester: string,
    makeTeamMeeting: boolean,
    activityRooms: ActivityRoom[] | [],
    teamInvites: UserEmail[] | [],
    recurrenceInd: boolean,
    recurrenceId: string | null,
    recurrence: Recurrence | null
    numberAttending : string
    roomSetUp : string
    vtc: boolean
    roomSetUpInstructions: string
    phoneNumberForRoom: string
    g5Calendar: boolean
    g5Organization: string
    hyperlink : string
    hyperlinkDescription : string
    eventClearanceLevel : string
    eventClearanceLevelNotificationSent : boolean
    communityEvent: boolean
    checkedForOpsec: boolean
    mfp: boolean
    commandantRequested: boolean
    dptCmdtRequested: boolean
    provostRequested: boolean
    cofsRequested: boolean
    deanRequested: boolean
    ambassadorRequested: boolean
    csmRequested: boolean
    report: string
    type: string
    color: string
    dti: boolean
    education: boolean
    cslDirectorateCSL:	boolean
    cslDirectorateDSW:	boolean
    cslDirectorateDTI:	boolean
    cslDirectorateOPS:	boolean
    cslDirectorateSLFG:	boolean
    cslDirectorateFellows:	boolean
    pax: string
    roomRequirementBasement: boolean
    roomRequirement1:	boolean
    roomRequirement2:	boolean
    roomRequirement3:	boolean
    participationCmdt:	boolean
    participationGO:	boolean
    participationDir:	boolean
    participationForeign: boolean
    automationProjection:	boolean
    automationCopiers:	boolean
    automationPC:	boolean
    automationVTC:	boolean
    automationTaping:	boolean
    automationComments: string
    communicationSupport: string
    faxClassification: string
    communicationComments: string
    catering : boolean
    cateringAreaArdennes : boolean
    cateringArea18: boolean
    cateringArea22: boolean
    cateringBreakArea18: boolean
    cateringBreakArea22: boolean
    cateringComments: string
    transportation: string
    parkingPasses: boolean
    parkingSpaces: string
    transportationComments: string
    securityBadgeIssue: boolean
    securityAfterDutyAccess: boolean
    securityComments: string
    registration: boolean
    registrationLocation: string
    suppliesComments: string
    otherComments: string
    approvedByOPS: string
    garrisonCategory: string
    marketingRequest: boolean
    sslCategories: string
    usahecDirectorate: string
    usahecCalendarCategory: string
    usahecFacilityReservationType: string
    copyToUSAHECCalendar: boolean
    pocketCalNonAcademicEvent : boolean
    pocketCalWeek : string
    pocketCalLessonNumber : string
    pocketCalPresenter : string
    pocketCalPresenterOrg : string
    pocketCalNotes : string
    imc: boolean
    educationalCategory: string
    vtcClassification:	string
    distantTechPhoneNumber:	string
    requestorPOCContactInfo: string
    dialInNumber: 	string
    siteIDDistantEnd:	string
    gosesInAttendance :	boolean
    seniorAttendeeNameRank : string
    additionalVTCInfo :	string
    vtcStatus :	string
    attachmentLookup : number | null
    activityAttachmentGroupLookup : string | null
    logicalDeleteInd : boolean
    deletedBy: string
    deletedAt: Date | null
    commandantRequestedNotificationSent: boolean
    dptCmdtRequestedNotificationSent: boolean
    provostRequestedNotificationSent: boolean
    cofsRequestedNotificationSent: boolean
    deanRequestedNotificationSent: boolean
    ambassadorRequestedNotificationSent: boolean
    csmRequestedNotificationSent: boolean
    blissHallSupport: boolean
    blissHallAVSptRequired : string
    blissHallAVNotificationSent: boolean
    vtcCoordinatorNotificationSent : boolean
    vtcConfirmedConfirmationSent : boolean
    ccrNotificationSent : boolean
    copiedToacademic: boolean;
    copiedToasep: boolean;
    copiedTocommandGroup: boolean;
    copiedTocommunity: boolean;
    copiedTocsl: boolean;
    copiedTocio: boolean;
    copiedTogarrison: boolean;
    copiedTointernationalfellows: boolean;
    copiedTogeneralInterest: boolean;
    copiedToholiday: boolean;
    copiedTopksoi: boolean;
    copiedTosocialEventsAndCeremonies: boolean;
    copiedTossiAndUsawcPress: boolean;
    copiedTossl: boolean;
    copiedTotrainingAndMiscEvents: boolean;
    copiedTousahec: boolean;
    copiedTousahecFacilitiesUsage: boolean;
    copiedTovisitsAndTours: boolean;
    copiedTosymposiumAndConferences: boolean;
    copiedTobattlerhythm : boolean,
    copiedTostaff: boolean,
    copiedTospouse: boolean,
    cancelled: boolean;
    cancelledReason : string
    cancelledBy: string
    cancelledAt: Date | null
    createdBy: string
    createdAt:  Date | null
    lastUpdatedBy: string
    lastUpdatedAt : Date | null
    marketingCampaignCategory : string
    marketingProgram : string
    copiedTostudentCalendar : boolean
    studentCalendarUniform : string
    studentCalendarMandatory : boolean
    studentCalendarNotes : string
    studentCalendarPresenter : string
    enlistedAideEvent : boolean
    enlistedAideFundingType : string
    enlistedAideVenue : string
    enlistedAideGuestCount : string
    enlistedAideCooking : string
    enlistedAideDietaryRestrictions : string
    enlistedAideAlcohol : string
    enlistedAideAcknowledged : boolean
    enlistedAideNumOfBartenders : string
    enlistedAideNumOfServers : string
    enlistedAideSupportNeeded : string
    enlistedAideSetup: boolean
    newEnlistedAideEventToAideNotificationSent: boolean
    newEnlistedAideEventToESDNotificationSent: boolean
    sendEnlistedAideConfirmationNotification: boolean
    eventPlanningNotificationSent :boolean
    eventPlanningClassification : string
    eventPlanningExternalEventName : string
    eventPlanningExternalEventPOCName : string
    eventPlanningExternalEventPOCEmail : string
    eventPlanningExternalEventPOCContactInfo : string
    eventPlanningStatus : string
    eventPlanningPAX : string
    eventPlanningCIORequirementsComments : string
    eventPlanningGovLaptops : boolean
    eventPlanningPersonalLaptops : boolean
    eventPlanningTablets : boolean
    eventPlanningServers : boolean
    eventPlanningCellPhones : boolean
    eventPlanningNetworkREN : boolean
    eventPlanningNetworkWireless : boolean
    eventPlanningNetworkNTG : boolean
    eventPlanningNetworkNTS : boolean
    eventPlanningNetworkSIPR : boolean
    eventPlanningNetworkNIPR : boolean
    eventPlanningNotifyPOC : boolean
    eventPlanningNumOfPC : string
    eventPlanningNumOfBYADS : string
    eventPlanningNumOfVOIPs : string
    eventPlanningNumOfPrinters : string
    eventPlanningNumOfPeripherals : string
    eventPlanningNumOfMonitors : string
    eventPlanningSetUpDate: Date | null
    enlistedAideAdditionalRemarks : string
    symposiumLinkInd : boolean
    symposiumLink : string
    commandantStart: Date | null
    commandantEnd: Date | null
    dptCmdtStart: Date | null
    dptCmdtEnd: Date | null
    provostStart: Date | null
    provostEnd: Date | null
    cofsStart: Date | null
    cofsEnd: Date | null
    deanStart: Date | null
    deanEnd: Date | null
    ambassadorStart: Date | null
    ambassadorEnd: Date | null
    csmStart: Date | null
    csmEnd: Date | null
    studentCalendarResident: boolean
    studentCalendarDistanceGroup1 : boolean
    studentCalendarDistanceGroup2 : boolean
    studentCalendarDistanceGroup3 : boolean
    studentCalendarDistanceGroup1Mandatory : boolean
    studentCalendarDistanceGroup2Mandatory : boolean
    studentCalendarDistanceGroup3Mandatory : boolean
    roomResourceNipr : boolean
    roomResourceSipr : boolean
    roomResourceRen : boolean
    roomResourceNts : boolean
    roomResourceNtg : boolean
    roomResourceNotApplicable : boolean
    roomResourceOther : boolean
    roomResourceOtherText : string
    roomResourceNotificationSent : boolean
    spouseCategory : string
}

export class Activity implements Activity{
    constructor(init?: ActivityFormValues){
      Object.assign(this, init);
    }
}

export class ActivityFormValues{
    id?: string = undefined;
    title: string = '';
    categoryId: string = '';
    organizationId: string | null = null;
    category: Category = {id: '', name: '', routeName: '', imcColor: '', includeInIMC: false}
    organization: Organization | null =  null;
    hostingReport: HostingReport | null =  null
    description: string = '';
    start: Date = roundToNearest15(new Date(new Date().setTime(new Date().getTime() + 1 * 60 * 60 * 1000)));
    end: Date = roundToNearest15(new Date(new Date().setTime(new Date().getTime() + 2 * 60 * 60 * 1000)));
    allDayEvent: boolean = false;
    actionOfficer: string = '';
    actionOfficerPhone: string = '';
    primaryLocation: string = '';
    roomEmails: string[] = [];
    startDateAsString : string = '';
    endDateAsString: string = '';
    coordinatorEmail: string = '';
    coordinatorFirstName: string = ''
    coordinatorLastName: string = ''
    coordinatorName: string = '';
    makeTeamMeeting: boolean = false;
    activityRooms: ActivityRoom[] | [] = [];
    teamInvites: UserEmail[] | [] = [];
    eventLookup: string = '';
    eventLookupCalendar: string = '';
    teamLookup: string = '';
    vtcLookup: string = '';
    teamLink: string = '';
    armyTeamLink: string = '';
    teamRequester: string = '';
    recurrenceInd: boolean = false;
    recurrenceId: string | null = null;
    recurrence: Recurrence | null = null;
    numberAttending : string = '';
    roomSetUp : string = '';
    vtc : boolean = false;
    phoneNumberForRoom: string = '';
    roomSetUpInstructions: string = '';
    g5Calendar: boolean = false;
    g5Organization: string = ''
    hyperlink : string = '';
    hyperlinkDescription : string = '';
    eventClearanceLevel : string = '';
    eventClearanceLevelNotificationSent : boolean = false;
    communityEvent : boolean = false;
    checkedForOpsec : boolean = false;
    commandantRequested: boolean = false;
    dptCmdtRequested: boolean = false;
    provostRequested: boolean = false;
    cofsRequested: boolean = false;
    deanRequested: boolean = false;
    ambassadorRequested: boolean = false;
    csmRequested: boolean = false;
    mfp: boolean = false;
    report: string = 'none';
    type: string = 'Event On-Site'
    color: string = 'Blue'
    dti: boolean = false
    education: boolean = false
    cslDirectorateCSL:	boolean = true
    cslDirectorateDSW:	boolean = false
    cslDirectorateDTI:	boolean = false
    cslDirectorateOPS:	boolean = false
    cslDirectorateSLFG:	boolean = false
    cslDirectorateFellows:	boolean = false
    pax: string = ''
    roomRequirementBasement: boolean = false
    roomRequirement1:	boolean = false
    roomRequirement2:	boolean = false
    roomRequirement3:	boolean = false
    participationCmdt:	boolean = false
    participationGO:	boolean = false
    participationDir:	boolean = false
    participationForeign: boolean = false
    automationProjection:	boolean = false
    automationCopiers:	boolean = false
    automationPC:	boolean = false
    automationVTC:	boolean = false
    automationTaping:	boolean = false
    automationComments: string = ''
    communicationSupport: string = ''
    faxClassification: string = ''
    communicationComments: string = ''
    catering : boolean = false
    cateringAreaArdennes : boolean = false
    cateringArea18: boolean = false
    cateringArea22: boolean = false
    cateringBreakArea18: boolean = false
    cateringBreakArea22: boolean = false
    cateringComments: string = ''
    transportation: string = ''
    parkingPasses: boolean = false
    parkingSpaces: string = ''
    transportationComments: string = ''
    securityBadgeIssue: boolean = false
    securityAfterDutyAccess: boolean = false
    securityComments: string = ''
    registration: boolean = false
    registrationLocation: string = ''
    suppliesComments: string = ''
    otherComments: string = ''
    approvedByOPS: string = 'Pending'
    garrisonCategory: string = ''
    marketingRequest: boolean = false
    sslCategories: string = 'SSL'
    usahecDirectorate: string = ''
    usahecCalendarCategory: string = ''
    usahecFacilityReservationType: string = ''
    copyToUSAHECCalendar: boolean = false
    pocketCalNonAcademicEvent : boolean = false
    pocketCalWeek : string = ''
    pocketCalLessonNumber : string = ''
    pocketCalPresenter : string = ''
    pocketCalPresenterOrg : string = ''
    pocketCalNotes : string = ''
    imc : boolean = false
    educationalCategory: string = 'Leadership & Readiness'
    vtcClassification:	string = ''
    distantTechPhoneNumber:	string = ''
    requestorPOCContactInfo: string = ''
    dialInNumber: 	string = ''
    siteIDDistantEnd:	string = ''
    gosesInAttendance :	boolean = false
    seniorAttendeeNameRank : string = ''
    additionalVTCInfo :	string = ''
    vtcStatus :	string = ''
    attachmentLookup : number | null = null
    activityAttachmentGroupLookup : string | null = null
    logicalDeleteInd : boolean = false
    deletedAt: Date | null = null
    deletedBy: string = ''
    commandantRequestedNotificationSent: boolean = false
    dptCmdtRequestedNotificationSent: boolean = false
    provostRequestedNotificationSent: boolean = false
    cofsRequestedNotificationSent: boolean = false
    deanRequestedNotificationSent: boolean = false
    ambassadorRequestedNotificationSent: boolean = false
    csmRequestedNotificationSent: boolean = false
    blissHallSupport: boolean = false
    blissHallAVSptRequired : string = ''
    blissHallAVNotificationSent : boolean = false
    vtcCoordinatorNotificationSent : boolean = false
    vtcConfirmedConfirmationSent : boolean = false
    ccrNotificationSent : boolean = false
    copiedToacademic: boolean = false;
    copiedToasep: boolean = false;
    copiedTocommandGroup: boolean = false;
    copiedTocommunity: boolean = false;
    copiedTocsl: boolean = false;
    copiedTocio: boolean = false;
    copiedTogarrison: boolean = false;
    copiedTointernationalfellows: boolean = false;
    copiedTogeneralInterest: boolean = false;
    copiedToholiday: boolean = false;
    copiedTopksoi: boolean = false;
    copiedTosocialEventsAndCeremonies: boolean = false;
    copiedTossiAndUsawcPress: boolean = false;
    copiedTossl: boolean = false;
    copiedTotrainingAndMiscEvents: boolean = false;
    copiedTousahec: boolean = false;
    copiedTousahecFacilitiesUsage: boolean = false;
    copiedTovisitsAndTours: boolean = false;
    copiedTosymposiumAndConferences: boolean = false;
    copiedTobattlerhythm : boolean = false;
    copiedTostaff: boolean = false;
    copiedTospouse: boolean = false;
    cancelled: boolean = false;
    cancelledReason : string = '';
    cancelledBy: string = '';
    cancelledAt: Date | null = null;
    createdBy: string = '';
    createdAt:  Date | null = null;
    lastUpdatedBy: string = '';
    lastUpdatedAt : Date | null = null;
    marketingCampaignCategory : string = '';
    marketingProgram : string = '';
    copiedTostudentCalendar : boolean = false;
    studentCalendarUniform : string = ''
    studentCalendarMandatory : boolean = false
    studentCalendarNotes : string = ''
    studentCalendarPresenter : string = ''
    enlistedAideEvent : boolean = false
    enlistedAideFundingType : string = ''
    enlistedAideVenue : string = ''
    enlistedAideGuestCount : string = ''
    enlistedAideCooking : string = ''
    enlistedAideDietaryRestrictions : string = ''
    enlistedAideAlcohol : string = ''
    enlistedAideAcknowledged : boolean = false
    enlistedAideNumOfBartenders : string = ''
    enlistedAideNumOfServers : string = ''
    enlistedAideSupportNeeded : string = ''
    enlistedAideSetup : boolean = false
    newEnlistedAideEventToAideNotificationSent: boolean = false
    newEnlistedAideEventToESDNotificationSent: boolean = false
    sendEnlistedAideConfirmationNotification: boolean = false
    eventPlanningNotificationSent : boolean = false
    eventPlanningClassification : string = ''
    eventPlanningExternalEventName : string = ''
    eventPlanningExternalEventPOCName: string = ''
    eventPlanningExternalEventPOCEmail : string = ''
    eventPlanningExternalEventPOCContactInfo : string = ''
    eventPlanningStatus : string = ''
    eventPlanningPAX : string = ''
    eventPlanningCIORequirementsComments : string = ''
    eventPlanningGovLaptops : boolean = false
    eventPlanningPersonalLaptops : boolean = false
    eventPlanningTablets : boolean = false
    eventPlanningServers : boolean = false
    eventPlanningCellPhones : boolean = false
    eventPlanningNetworkREN : boolean = false
    eventPlanningNetworkWireless : boolean = false
    eventPlanningNetworkNTG : boolean = false
    eventPlanningNetworkNTS : boolean = false
    eventPlanningNetworkSIPR : boolean = false
    eventPlanningNetworkNIPR : boolean = false
    eventPlanningNotifyPOC : boolean = false
    eventPlanningNumOfPC : string = ''
    eventPlanningNumOfBYADS : string = ''
    eventPlanningNumOfVOIPs : string = ''
    eventPlanningNumOfPrinters : string = ''
    eventPlanningNumOfPeripherals : string = ''
    eventPlanningNumOfMonitors : string = ''
    eventPlanningSetUpDate: Date | null = null
    enlistedAideAdditionalRemarks : string = ''
    symposiumLinkInd : boolean = false
    symposiumLink : string = ''
    commandantStart: Date | null = null
    commandantEnd: Date | null = null
    dptCmdtStart: Date | null = null
    dptCmdtEnd: Date | null = null
    provostStart: Date | null = null
    provostEnd: Date | null = null
    cofsStart: Date | null = null
    cofsEnd: Date | null = null
    deanStart: Date | null = null
    deanEnd: Date | null = null
    ambassadorStart: Date | null = null
    ambassadorEnd: Date | null = null
    csmStart: Date | null = null
    csmEnd: Date | null = null
    studentCalendarResident: boolean = false
    studentCalendarDistanceGroup1 : boolean = false
    studentCalendarDistanceGroup2 : boolean = false
    studentCalendarDistanceGroup3 : boolean = false
    studentCalendarDistanceGroup1Mandatory : boolean = false
    studentCalendarDistanceGroup2Mandatory : boolean = false
    studentCalendarDistanceGroup3Mandatory : boolean = false
    roomResourceNipr : boolean = false
    roomResourceSipr : boolean = false
    roomResourceRen : boolean = false
    roomResourceNts : boolean = false
    roomResourceNtg : boolean = false
    roomResourceNotApplicable : boolean = false
    roomResourceOther : boolean = false
    roomResourceOtherText : string = ''
    roomResourceNotificationSent : boolean = false
    spouseCategory : string = ''

    constructor(activity?: ActivityFormValues){
       if(activity){
        this.id = activity.id;
        this.title = activity.title;
        this.categoryId = activity.categoryId
        this.category = activity.category
        this.organizationId = activity.organizationId
        this.organization = activity.organization
        this.hostingReport = activity.hostingReport
        this.description = activity.description;
        this.start = activity.start;
        this.end = activity.end;
        this.allDayEvent = activity.allDayEvent;
        this.actionOfficer = activity.actionOfficer;
        this.actionOfficerPhone = activity.actionOfficerPhone;
        this.primaryLocation = activity.primaryLocation;
        this.roomEmails = activity.roomEmails;
        this.startDateAsString = activity.startDateAsString;
        this.endDateAsString = activity.endDateAsString;
        this.coordinatorEmail = activity.coordinatorEmail;
        this.coordinatorFirstName = activity.coordinatorFirstName;
        this.coordinatorLastName = activity.coordinatorLastName;
        this.coordinatorName = activity.coordinatorLastName;
        this.activityRooms = activity.activityRooms;
        this.makeTeamMeeting = activity.makeTeamMeeting;
        this.teamInvites = activity.teamInvites;
        this.eventLookup = activity.eventLookup;
        this.eventLookupCalendar = activity.eventLookupCalendar;
        this.teamLookup = activity.teamLookup;
        this.vtcLookup = activity.vtcLookup;
        this.teamLink = activity.teamLink;
        this.armyTeamLink = activity.armyTeamLink;
        this.teamRequester = activity.teamRequester;
        this.recurrenceInd = activity.recurrenceInd;
        this.recurrenceId = activity.recurrenceId;
        this.recurrence = activity.recurrence;
        this.numberAttending = activity.numberAttending;
        this.roomSetUp = activity.roomSetUp
        this.vtc = activity.vtc;
        this.phoneNumberForRoom = activity.phoneNumberForRoom;
        this.roomSetUpInstructions = activity.roomSetUpInstructions
        this.g5Calendar = activity.g5Calendar
        this.g5Organization = activity.g5Organization
        this.hyperlink = activity.hyperlink
        this.hyperlinkDescription  = activity.hyperlinkDescription
        this.eventClearanceLevel = activity.eventClearanceLevel
        this.eventClearanceLevelNotificationSent = activity.eventClearanceLevelNotificationSent
        this.communityEvent = activity.communityEvent
        this.checkedForOpsec = activity.checkedForOpsec
        this.commandantRequested = activity.commandantRequested
        this.dptCmdtRequested = activity.dptCmdtRequested
        this.provostRequested = activity.provostRequested
        this.cofsRequested = activity.cofsRequested
        this.deanRequested = activity.deanRequested
        this.ambassadorRequested = activity.ambassadorRequested
        this.csmRequested = activity.csmRequested
        this.mfp = activity.mfp
        this.report = activity.report
        this.type = activity.type
        this.color = activity.color
        this.dti = activity.dti
        this.education = activity.education
        this.cslDirectorateCSL = activity.cslDirectorateCSL
        this.cslDirectorateDSW = activity.cslDirectorateDSW
        this.cslDirectorateDTI  = activity.cslDirectorateDTI
        this.cslDirectorateSLFG  = activity.cslDirectorateSLFG
        this.cslDirectorateFellows = activity.cslDirectorateFellows
        this.pax = activity.pax
        this.roomRequirementBasement = activity.roomRequirementBasement
        this.roomRequirement1 = activity.roomRequirement1
        this.roomRequirement2 = activity.roomRequirement2
        this.roomRequirement3 = activity.roomRequirement3
        this.participationCmdt = activity.participationCmdt
        this.participationGO  = activity.participationGO
        this.participationDir = activity.participationDir
        this.participationForeign = activity.participationForeign
        this.automationProjection =	activity.automationProjection
        this.automationCopiers = activity.automationCopiers
        this.automationPC = activity.automationPC
        this.automationVTC = activity.automationVTC
        this.automationTaping = activity.automationTaping
        this.automationComments = activity.automationComments
        this.communicationSupport = activity.communicationSupport
        this.faxClassification = activity.faxClassification
        this.communicationComments = activity.communicationComments
        this.catering = activity.catering
        this.cateringAreaArdennes = activity.cateringAreaArdennes
        this.cateringArea18 = activity.cateringArea18
        this.cateringArea22 = activity.cateringArea22
        this.cateringBreakArea18 = activity.cateringBreakArea18
        this.cateringBreakArea22 = activity.cateringBreakArea22
        this.cateringComments = activity.cateringComments
        this.transportation = activity.transportation
        this.parkingPasses = activity.parkingPasses
        this.parkingSpaces = activity.parkingSpaces
        this.transportationComments = activity.transportationComments
        this.securityBadgeIssue = activity.securityBadgeIssue
        this.securityAfterDutyAccess = activity.securityAfterDutyAccess
        this.securityComments = activity.securityComments
        this.registration = activity.registration
        this.registrationLocation = activity.registrationLocation
        this.suppliesComments = activity.suppliesComments
        this.otherComments = activity.otherComments
        this.approvedByOPS = activity.approvedByOPS
        this.garrisonCategory = activity.garrisonCategory
        this.marketingRequest = activity.marketingRequest
        this.sslCategories = activity.sslCategories
        this.usahecDirectorate = activity.usahecDirectorate
        this.usahecCalendarCategory = activity.usahecCalendarCategory
        this.usahecFacilityReservationType = activity.usahecFacilityReservationType
        this.copyToUSAHECCalendar = activity.copyToUSAHECCalendar
        this.pocketCalNonAcademicEvent = activity.pocketCalNonAcademicEvent
        this.pocketCalWeek = activity.pocketCalWeek
        this.pocketCalLessonNumber = activity.pocketCalLessonNumber
        this.pocketCalPresenter = activity.pocketCalPresenter
        this.pocketCalPresenterOrg = activity.pocketCalPresenterOrg
        this.pocketCalNotes = activity.pocketCalNotes
        this.imc = activity.imc
        this.educationalCategory = activity.educationalCategory
        this.vtcClassification = activity.vtcClassification
        this.distantTechPhoneNumber = activity.distantTechPhoneNumber
        this.requestorPOCContactInfo = activity.requestorPOCContactInfo
        this.dialInNumber = activity.dialInNumber
        this.siteIDDistantEnd = activity.siteIDDistantEnd
        this.gosesInAttendance = activity.gosesInAttendance
        this.seniorAttendeeNameRank = activity.seniorAttendeeNameRank
        this.additionalVTCInfo = activity.additionalVTCInfo
        this.vtcStatus = activity.vtcStatus
        this.attachmentLookup = activity.attachmentLookup
        this.activityAttachmentGroupLookup = activity.activityAttachmentGroupLookup
        this.logicalDeleteInd = activity.logicalDeleteInd
        this.deletedAt = activity.deletedAt
        this.deletedBy = activity.deletedBy
        this.commandantRequestedNotificationSent= activity.commandantRequestedNotificationSent
        this.dptCmdtRequestedNotificationSent  = activity.dptCmdtRequestedNotificationSent
        this.provostRequestedNotificationSent  = activity.provostRequestedNotificationSent
        this.cofsRequestedNotificationSent  = activity.cofsRequestedNotificationSent
        this.deanRequestedNotificationSent = activity.deanRequestedNotificationSent
        this.ambassadorRequestedNotificationSent = activity.ambassadorRequestedNotificationSent
        this.csmRequestedNotificationSent = activity.csmRequestedNotificationSent
        this.blissHallSupport = activity.blissHallSupport
        this.blissHallAVSptRequired = activity.blissHallAVSptRequired
        this.blissHallAVNotificationSent = activity.blissHallAVNotificationSent
        this.vtcCoordinatorNotificationSent = activity.vtcCoordinatorNotificationSent
        this.vtcConfirmedConfirmationSent = activity.vtcConfirmedConfirmationSent
        this.ccrNotificationSent = activity.ccrNotificationSent
        this.copiedToacademic = activity.copiedToacademic;
        this.copiedToasep = activity.copiedToasep;
        this.copiedTocommandGroup = activity.copiedTocommandGroup;
        this.copiedTocommunity = activity.copiedTocommunity;
        this.copiedTocsl = activity.copiedTocsl;
        this.copiedTocio = activity.copiedTocio;
        this.copiedTogarrison = activity.copiedTogarrison;
        this.copiedTointernationalfellows = activity.copiedTointernationalfellows;
        this.copiedTogeneralInterest = activity.copiedTogeneralInterest;
        this.copiedToholiday = activity.copiedToholiday;
        this.copiedTopksoi = activity.copiedTopksoi;
        this.copiedTosocialEventsAndCeremonies = activity.copiedTosocialEventsAndCeremonies;
        this.copiedTossiAndUsawcPress = activity.copiedTossiAndUsawcPress;
        this.copiedTossl = activity.copiedTossl;
        this.copiedTotrainingAndMiscEvents = activity.copiedTotrainingAndMiscEvents;
        this.copiedTousahec = activity.copiedTousahec;
        this.copiedTousahecFacilitiesUsage = activity.copiedTousahecFacilitiesUsage;
        this.copiedTovisitsAndTours = activity.copiedTovisitsAndTours;
        this.copiedTosymposiumAndConferences = activity.copiedTosymposiumAndConferences;
        this.copiedTobattlerhythm = activity.copiedTobattlerhythm
        this.copiedTostaff = activity.copiedTostaff
        this.copiedTospouse = activity. copiedTospouse
        this.cancelled = activity.cancelled;
        this.cancelledReason = activity.cancelledReason;
        this.cancelledBy  = activity.cancelledBy
        this.cancelledAt = activity.cancelledAt;
        this.createdBy = activity.createdBy;
        this.createdAt = activity.createdAt;
        this.lastUpdatedBy = activity.lastUpdatedBy;
        this.lastUpdatedAt = activity.lastUpdatedAt;
        this.marketingCampaignCategory = activity.marketingCampaignCategory
        this.marketingProgram = activity.marketingProgram
        this.copiedTostudentCalendar = activity.copiedTostudentCalendar
        this.studentCalendarUniform = activity.studentCalendarUniform
        this.studentCalendarMandatory = activity.studentCalendarMandatory
        this.studentCalendarNotes = activity.studentCalendarNotes
        this.studentCalendarPresenter = activity.studentCalendarPresenter
        this.enlistedAideEvent = activity.enlistedAideEvent
        this.enlistedAideFundingType = activity.enlistedAideFundingType
        this.enlistedAideVenue = activity.enlistedAideVenue 
        this.enlistedAideGuestCount = activity.enlistedAideGuestCount
        this.enlistedAideCooking = activity.enlistedAideCooking
        this.enlistedAideDietaryRestrictions = activity.enlistedAideDietaryRestrictions
        this.enlistedAideAlcohol = activity.enlistedAideAlcohol
        this.enlistedAideAcknowledged = activity.enlistedAideAcknowledged
        this.enlistedAideNumOfBartenders = activity.enlistedAideNumOfBartenders
        this.enlistedAideNumOfServers = activity.enlistedAideNumOfServers
        this.enlistedAideSupportNeeded = activity.enlistedAideSupportNeeded
        this.enlistedAideSetup = activity.enlistedAideSetup
        this.newEnlistedAideEventToAideNotificationSent = activity.newEnlistedAideEventToAideNotificationSent
        this.newEnlistedAideEventToESDNotificationSent = activity.newEnlistedAideEventToESDNotificationSent
        this.sendEnlistedAideConfirmationNotification = activity.sendEnlistedAideConfirmationNotification
        this.eventPlanningNotificationSent = activity.eventPlanningNotificationSent
        this.eventPlanningClassification = activity.eventPlanningClassification
        this.eventPlanningExternalEventName = activity.eventPlanningExternalEventName
        this.eventPlanningExternalEventPOCName= activity.eventPlanningExternalEventPOCName
        this.eventPlanningExternalEventPOCEmail = activity.eventPlanningExternalEventPOCEmail
        this.eventPlanningExternalEventPOCContactInfo = activity.eventPlanningExternalEventPOCContactInfo
        this.eventPlanningStatus = activity.eventPlanningStatus
        this.eventPlanningPAX = activity.eventPlanningPAX
        this.eventPlanningCIORequirementsComments = activity.eventPlanningCIORequirementsComments
    this.eventPlanningGovLaptops = activity.eventPlanningGovLaptops
    this.eventPlanningPersonalLaptops = activity.eventPlanningPersonalLaptops
    this.eventPlanningTablets = activity.eventPlanningTablets
    this.eventPlanningServers = activity.eventPlanningServers
    this.eventPlanningCellPhones = activity.eventPlanningCellPhones
    this.eventPlanningNetworkREN = activity.eventPlanningNetworkREN
    this.eventPlanningNetworkWireless = activity.eventPlanningNetworkWireless
    this.eventPlanningNetworkNTG = activity.eventPlanningNetworkNTG
    this.eventPlanningNetworkNTS = activity.eventPlanningNetworkNTS
    this.eventPlanningNetworkSIPR = activity.eventPlanningNetworkSIPR
    this.eventPlanningNetworkNIPR = activity.eventPlanningNetworkNIPR
    this.eventPlanningNotifyPOC = activity.eventPlanningNotifyPOC
    this.eventPlanningNumOfPC = activity.eventPlanningNumOfPC
    this.eventPlanningNumOfBYADS = activity.eventPlanningNumOfBYADS
    this.eventPlanningNumOfVOIPs = activity.eventPlanningNumOfVOIPs
    this.eventPlanningNumOfPrinters = activity.eventPlanningNumOfPrinters
    this.eventPlanningNumOfPeripherals = activity.eventPlanningNumOfPeripherals
    this.eventPlanningNumOfMonitors = activity.eventPlanningNumOfMonitors
    this.eventPlanningSetUpDate = activity.eventPlanningSetUpDate
    this.enlistedAideAdditionalRemarks = activity.enlistedAideAdditionalRemarks
    this.symposiumLinkInd = activity.symposiumLinkInd 
    this.symposiumLink =  activity.symposiumLink
    this.commandantStart =  activity.commandantStart
    this.commandantEnd =  activity.commandantEnd
    this.dptCmdtStart =  activity.dptCmdtStart
    this.dptCmdtEnd =  activity.dptCmdtEnd
    this.provostStart =  activity.provostStart
    this.provostEnd =  activity.provostEnd
    this.cofsStart =  activity.cofsStart
    this.cofsEnd =  activity.cofsEnd
    this.deanStart =  activity.deanStart
    this.deanEnd =  activity.deanEnd
    this.ambassadorStart =  activity.ambassadorStart
    this.ambassadorEnd =  activity.ambassadorEnd
    this.csmStart =  activity.csmStart
    this.csmEnd =  activity.csmEnd
    this.studentCalendarResident =  activity.studentCalendarResident
    this.studentCalendarDistanceGroup1 =  activity.studentCalendarDistanceGroup1
    this.studentCalendarDistanceGroup2 =  activity.studentCalendarDistanceGroup2
    this.studentCalendarDistanceGroup3 =  activity.studentCalendarDistanceGroup3
    this.studentCalendarDistanceGroup1Mandatory  =  activity.studentCalendarDistanceGroup1Mandatory
    this.studentCalendarDistanceGroup2Mandatory  =  activity.studentCalendarDistanceGroup2Mandatory
    this.studentCalendarDistanceGroup3Mandatory  =  activity.studentCalendarDistanceGroup3Mandatory
    this.roomResourceNipr =  activity.roomResourceNipr
    this.roomResourceSipr =  activity.roomResourceSipr
    this.roomResourceRen =  activity.roomResourceRen
    this.roomResourceNts =  activity.roomResourceNts
    this.roomResourceNtg =  activity.roomResourceNtg
    this.roomResourceNotApplicable  =  activity.roomResourceNotApplicable
    this.roomResourceOther =  activity.roomResourceOther
    this.roomResourceOtherText =  activity.roomResourceOtherText
    this.roomResourceNotificationSent = activity.roomResourceNotificationSent
    this.spouseCategory = activity.spouseCategory
    
       } 
    }
}