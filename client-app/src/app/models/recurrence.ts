import { store } from "../stores/store"
import { v4 as uuid } from 'uuid';


export interface Recurrence{
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
    activityStart? : Date
    activityEnd?: Date
}

export class Recurrence implements Recurrence{
    constructor(init?: RecurrenceFormValues){
      Object.assign(this, init);
    }
}

export class RecurrenceFormValues{
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

    constructor(recurrence?: RecurrenceFormValues){
        if(recurrence){
         this.sunday = recurrence.sunday;
         this.monday = recurrence.monday;
         this.tuesday = recurrence.tuesday;
         this.wednesday = recurrence.wednesday;
         this.thursday = recurrence.thursday;
         this.friday = recurrence.friday;
         this.saturday = recurrence.saturday;
         this.interval = recurrence.interval;
         this.dayOfMonth = recurrence.dayOfMonth;
         this.weekOfMonth = recurrence.weekOfMonth;
         this.weekdayOfMonth = recurrence.weekdayOfMonth;
         this.intervalStart = recurrence.intervalStart;
         this.intervalEnd = recurrence.intervalEnd;
         this.id = recurrence.id
         this.includeWeekends = recurrence.includeWeekends;
         this.daysRepeating = recurrence.daysRepeating;
         this.weekendsIncluded = recurrence.weekendsIncluded;
         this.weekInterval = recurrence.weekInterval;
         this.weeklyRepeatType = recurrence.weeklyRepeatType;
         this.weeksRepeating = recurrence.weeksRepeating;
         this.monthlyRepeatType = recurrence.monthlyRepeatType;
         this.monthlyDayType = recurrence.monthlyDayType;
         this.monthsRepeating = recurrence.monthsRepeating;
    }
   }
}