import { store } from "../stores/store"
import { v4 as uuid } from 'uuid';


export interface RecurrenceOptions{
    id: string,
    sunday: boolean
    monday: boolean
    tuesday: boolean
    wednseday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    interval: string
    dayOfMonth: string
    weekOfMonth: string
    intervalStart: Date
    intervalEnd: Date
}

export class RecurrenceOptions implements RecurrenceOptions{
    constructor(init?: RecurrenceOptionsFormValues){
      Object.assign(this, init);
    }
}

export class RecurrenceOptionsFormValues{
    id: string = uuid();
    sunday: boolean = false;
    monday: boolean = false;
    tuesday: boolean = false;
    wednseday: boolean = false;
    thursday: boolean = false;
    friday: boolean = false;
    saturday: boolean = false;
    interval: string = 'weekly';
    dayOfMonth: string = '1';
    weekOfMonth: string = '1';
    intervalStart: Date = new Date(new Date().setHours(0,0,0,0));
    intervalEnd: Date =  store.commonStore.addDays(new Date(new Date().setHours(23,59,59,0)),180);

    constructor(recurrenceOptions?: RecurrenceOptionsFormValues){
        if(recurrenceOptions){
         this.sunday = recurrenceOptions.sunday;
         this.monday = recurrenceOptions.monday;
         this.tuesday = recurrenceOptions.tuesday;
         this.wednseday = recurrenceOptions.wednseday;
         this.thursday = recurrenceOptions.thursday;
         this.friday = recurrenceOptions.friday;
         this.saturday = recurrenceOptions.saturday;
         this.interval = recurrenceOptions.interval;
         this.dayOfMonth = recurrenceOptions.dayOfMonth;
         this.weekOfMonth = recurrenceOptions.weekOfMonth;
         this.intervalStart = recurrenceOptions.intervalStart;
         this.intervalEnd = recurrenceOptions.intervalEnd;
         this.id = recurrenceOptions.id
    }
   }
}