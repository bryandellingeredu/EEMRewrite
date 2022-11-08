import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../models/serverError";


export default class CommonStore{
    error: ServerError | null = null;
    token: string | null = window.localStorage.getItem('jwt');
    appLoaded = false;

    constructor() {
        makeAutoObservable(this);
        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token)
                } else {
                    window.localStorage.removeItem('jwt')
                }
            }
        )
    }

    setServerError = (error: ServerError) => {
        this.error = error;
    }

    setToken = (token: string | null) => {
        this.token = token;
    }

    setAppLoaded = () => {
        this.appLoaded = true;
    }

    convertDateToGraph = (date: Date, isAllDay: boolean, isEndDt: boolean): string => {
        if(isEndDt && isAllDay){
            date = this.addDays(date,1);
        }
        const isoStringDate = date.toISOString().split('T')[0];
        const hour = ("0" + date.getHours()).slice(-2);
        const minute = ("0" + date.getMinutes()).slice(-2);
        const convertedDate = isAllDay 
        ? `${isoStringDate}T00:00:00.0000000`
        : `${isoStringDate}T${hour}:${minute}:00.0000000`
        return convertedDate;
      }

      addDays = (date: Date, num: number): Date =>{
        const newDate = new Date(date);
        return new Date(newDate.setDate(newDate.getDate() + num));
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
        const endminute = enddt.getMinutes().toString().padStart(2,'0');
        const startFormattedDay = `${startmonth} ${startday}`;
        const endFormattedDay = `${endmonth} ${endday}`;
        if(startFormattedDay === endFormattedDay){
            return `${startFormattedDay} ${starthour} : ${startminute} - ${endhour} : ${endminute} `;
        } else{
            return `${startFormattedDay} ${starthour} : ${startminute} - ${endFormattedDay} ${endhour} : ${endminute} `;
        }
      
    }

}