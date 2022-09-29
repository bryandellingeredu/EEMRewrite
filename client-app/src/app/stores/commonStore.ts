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
}