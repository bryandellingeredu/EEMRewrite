import { Category } from "./category";

export interface Activity{
    id: string,
    title: string,
    description: string,
    categoryId: string,
    category: Category,
    start: Date,
    end: Date,
    allDayEvent: boolean
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
    category: Category = {id: '', name: ''}
    description: string = '';
    start: Date  = new Date();
    end: Date = new Date();
    allDayEvent: boolean = false;



    constructor(activity?: ActivityFormValues){
       if(activity){
        this.id = activity.id;
        this.title = activity.title;
        this.categoryId = activity.categoryId
        this.category = activity.category
        this.description = activity.description;
        this.start = activity.start;
        this.end = activity.end;
        this.allDayEvent = activity.allDayEvent;
       } 
    }
}