import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../models/serverError";


export default class CommonStore{
    error: ServerError | null = null;
    token: string | null = window.localStorage.getItem('jwt');
    appLoaded = false;
    redirectId = '';
    redirectCategoryId = '';

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

    setRedirectId = (id: string) =>{
        this.redirectId = id;
    }

    setRedirectCategoryId = (categoryId: string) =>{
        this.redirectCategoryId = categoryId;
    }

    convertDateToGraph = (dt: Date, isAllDay: boolean, isEndDt: boolean): string => {
        let date : Date = new Date();
        if(typeof dt === 'string'){
            date = new Date(dt)
        } else{
            date = dt;
        }
        
        if(isEndDt && isAllDay){
            date = this.addDays(date,1);
        }
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0")
        const hour = ("0" + date.getHours()).slice(-2);
        const minute = ("0" + date.getMinutes()).slice(-2);
        const datePartOfIsoString = `${year}-${month}-${day}`;
        const convertedDate = isAllDay 
        ? `${datePartOfIsoString}T00:00:00.0000000`
        : `${datePartOfIsoString}T${hour}:${minute}:00.0000000`
        return convertedDate;
      }

      convertUTCtoEST = (dt: Date) : Date => {
        const minutes: number = dt.getTimezoneOffset()
        const convertedDate : Date = new Date(dt.setMinutes(dt.getMinutes() - minutes));
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