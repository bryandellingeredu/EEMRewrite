import { Category } from "./category";
import { Organization } from "./organization";

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
    primaryLocation: string
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
    start: Date  = new Date();
    end: Date = new Date();
    allDayEvent: boolean = false;
    actionOfficer: string = '';
    actionOfficerPhone: string = '';
    primaryLocation: string = '';

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
       } 
    }
}