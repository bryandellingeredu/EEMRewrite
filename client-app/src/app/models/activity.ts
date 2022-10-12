
import { store } from "../stores/store";
import { Category } from "./category";
import { Organization } from "./organization";
import { ActivityRoom } from "./activityRoom"
import { RecurrenceOptions } from "./recurrenceOptions";


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
    recurrence: boolean,
    recurrenceOptions: RecurrenceOptions | null
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
    category: Category = {id: '', name: ''}
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
    recurrence: boolean = false;
    recurrenceOptions: RecurrenceOptions | null = null;

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
        this.recurrence = activity.recurrence;
        this.recurrenceOptions = activity.recurrenceOptions;
       } 
    }
}