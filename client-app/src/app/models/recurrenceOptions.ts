import { store } from "../stores/store"
import { v4 as uuid } from 'uuid';


export interface RecurrenceOptions{
    id: string,
    sunday: boolean
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    interval: string
    dayOfMonth: string
    weekOfMonth: string
    weekdayOfMonth: string
    intervalStart: Date
    intervalEnd: Date
    includeWeekends: boolean
    daysRepeating: string
    weeksRepeating: string
    monthsRepeating: string
    weekInterval: string
    weekendsIncluded: string
    weeklyRepeatType: string
    monthlyRepeatType: string
    monthlyDayType: string
}

export class RecurrenceOptions implements RecurrenceOptions{
    constructor(init?: RecurrenceOptionsFormValues){
      Object.assign(this, init);
    }
}

export class RecurrenceOptionsFormValues{
    id: string = uuid();
    sunday: boolean = false;
    monday: boolean = true;
    tuesday: boolean = false;
    wednesday: boolean = false;
    thursday: boolean = false;
    friday: boolean = false;
    saturday: boolean = false;
    interval: string = 'daily';
    dayOfMonth: string = '1';
    weekOfMonth: string = '1';
    weekdayOfMonth: string = '1'
    intervalStart: Date = new Date(new Date().setHours(0,0,0,0));
    intervalEnd: Date =  store.commonStore.addDays(new Date(new Date().setHours(23,59,59,0)),180);
    includeWeekends: boolean = false;
    daysRepeating: string = '1';
    weeksRepeating: string = '1';
    monthsRepeating: string = '1';
    weekendsIncluded: string = 'no';
    weekInterval: string = '1';
    weeklyRepeatType: string = 'number';
    monthlyRepeatType: string = 'number';
    monthlyDayType: string = 'number';

    constructor(recurrenceOptions?: RecurrenceOptionsFormValues){
        if(recurrenceOptions){
         this.sunday = recurrenceOptions.sunday;
         this.monday = recurrenceOptions.monday;
         this.tuesday = recurrenceOptions.tuesday;
         this.wednesday = recurrenceOptions.wednesday;
         this.thursday = recurrenceOptions.thursday;
         this.friday = recurrenceOptions.friday;
         this.saturday = recurrenceOptions.saturday;
         this.interval = recurrenceOptions.interval;
         this.dayOfMonth = recurrenceOptions.dayOfMonth;
         this.weekOfMonth = recurrenceOptions.weekOfMonth;
         this.weekdayOfMonth = recurrenceOptions.weekdayOfMonth;
         this.intervalStart = recurrenceOptions.intervalStart;
         this.intervalEnd = recurrenceOptions.intervalEnd;
         this.id = recurrenceOptions.id
         this.includeWeekends = recurrenceOptions.includeWeekends;
         this.daysRepeating = recurrenceOptions.daysRepeating;
         this.weekendsIncluded = recurrenceOptions.weekendsIncluded;
         this.weekInterval = recurrenceOptions.weekInterval;
         this.weeklyRepeatType = recurrenceOptions.weeklyRepeatType;
         this.weeksRepeating = recurrenceOptions.weeksRepeating;
         this.monthlyRepeatType = recurrenceOptions.monthlyRepeatType;
         this.monthlyDayType = recurrenceOptions.monthlyDayType;
         this.monthsRepeating = recurrenceOptions.monthsRepeating;
    }
   }
}