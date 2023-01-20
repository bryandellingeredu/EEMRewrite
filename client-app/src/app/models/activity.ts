
import { store } from "../stores/store";
import { Category } from "./category";
import { Organization } from "./organization";
import { ActivityRoom } from "./activityRoom"
import { Recurrence } from "./recurrence";
import { HostingReport } from "./hostingReport";


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
    activityRooms: ActivityRoom[] | [],
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
    communityEvent: boolean
    checkedForOpsec: boolean
    mfp: boolean
    commandantRequested: boolean
    dptCmdtRequested: boolean
    provostRequested: boolean
    cofsRequested: boolean
    deanRequested: boolean
    ambassadorRequested: boolean
    cSMRequested: boolean
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
    logicalDeleteInd : boolean
    deletedBy: string
    deletedAt: Date | null
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
    category: Category = {id: '', name: '', routeName: '', imcColor: ''}
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
    activityRooms: ActivityRoom[] | [] = [];
    eventLookup: string = '';
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
    communityEvent : boolean = false;
    checkedForOpsec : boolean = false;
    commandantRequested: boolean = false;
    dptCmdtRequested: boolean = false;
    provostRequested: boolean = false;
    cofsRequested: boolean = false;
    deanRequested: boolean = false;
    ambassadorRequested: boolean = false;
    cSMRequested: boolean = false;
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
    logicalDeleteInd : boolean = false
    deletedAt: Date | null = null
    deletedBy: string = ''


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
        this.eventLookup = activity.eventLookup;
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
        this.communityEvent = activity.communityEvent
        this.checkedForOpsec = activity.checkedForOpsec
        this.commandantRequested = activity.commandantRequested
        this.dptCmdtRequested = activity.dptCmdtRequested
        this.provostRequested = activity.provostRequested
        this.cofsRequested = activity.cofsRequested
        this.deanRequested = activity.deanRequested
        this.ambassadorRequested = activity.ambassadorRequested
        this.cSMRequested = activity.cSMRequested
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
        this.logicalDeleteInd = activity.logicalDeleteInd
        this.deletedAt = activity.deletedAt
        this.deletedBy = activity.deletedBy
       } 
    }
}