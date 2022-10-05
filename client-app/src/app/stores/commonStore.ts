import { makeAutoObservable } from "mobx";
import { ServerError } from "../models/serverError";


export default class CommonStore{
    error: ServerError | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setServerError = (error: ServerError) => {
        this.error = error;
    }

    convertDateToGraph = (date: Date, isAllDay: boolean): string => {
        const isoStringDate = date.toISOString().split('T')[0];
        const hour = ("0" + date.getHours()).slice(-2);
        const minute = ("0" + date.getMinutes()).slice(-2);
        const convertedDate = isAllDay 
        ? `${isoStringDate}T00:00:00.0000000`
        : `${isoStringDate}T${hour}:${minute}:00.0000000`
        return convertedDate;
      }

      roundToNearest15 = (date: Date): Date => {
        const minutes = 15;
        const ms = 1000 * 60 * minutes;     
        return new Date(Math.ceil(date.getTime() / ms) * ms);
      }

      formatDate = (start: string, end: string) => {
        const months = ["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
        const startdt = new Date(start);
        const enddt = new Date(end);
        const startmonth = months[startdt.getMonth()];
        const endmonth = months[enddt.getMonth()];
        const startday = startdt.getDate().toString().padStart(2,'0');
        const endday = enddt.getDate().toString().padStart(2,'0');
        const starthour = startdt.getHours().toString().padStart(2,'0');
        const endhour = enddt.getHours().toString().padStart(2,'0');
        const startminute = startdt.getMinutes().toString().padStart(2,'0');
        const endminute = startdt.getMinutes().toString().padStart(2,'0');
        const startFormattedDay = `${startmonth} ${startday}`;
        const endFormattedDay = `${endmonth} ${endday}`;
        if(startFormattedDay === endFormattedDay){
            return `${startFormattedDay} ${starthour} : ${startminute} - ${endhour} : ${endminute} `;
        } else{
            return `${startFormattedDay} ${starthour} : ${startminute} - ${endFormattedDay} ${endhour} : ${endminute} `;
        }
      
    }
}