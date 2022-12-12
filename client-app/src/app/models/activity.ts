
import { store } from "../stores/store";
import { Category } from "./category";
import { Organization } from "./organization";
import { ActivityRoom } from "./activityRoom"
import { Recurrence } from "./recurrence";


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
    category: Category = {id: '', name: '', routeName: ''}
    organization: Organization | null =  null;
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

    constructor(activity?: ActivityFormValues){
       if(activity){
        this.id = activity.id;
        this.title = activity.title;
        this.categoryId = activity.categoryId
        this.category = activity.category
        this.organizationId = activity.organizationId
        this.organization = activity.organization
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
       } 
    }
}