import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { store } from "./store";
import { GraphScheduleRequest } from "../models/graphScheduleRequest";
import { GraphScheduleResponse } from "../models/graphScheduleResponse";

export default class AvailabilityStore {
    loadingInitial = false; 

    constructor() {
        makeAutoObservable(this);
      }
    
    loadSchedule = async (email: string, start: Date, end: Date)  => {
        this.setLoadingInitial(true);
        const graphScheduleRequest : GraphScheduleRequest = this.getGraphScheduleRequest(email, start, end);
        try{
            const axiosResponse : GraphScheduleResponse[] = await agent.GraphSchedules.list(graphScheduleRequest);  
            return axiosResponse;
            }        
        catch (error) {
          console.log(error);
         
        } finally  {
            this.setLoadingInitial(false);
        }
    }

    setLoadingInitial = (state: boolean) => this.loadingInitial = state;

    getGraphScheduleRequest = (email: string, start: Date, end: Date) : GraphScheduleRequest => {
        const request = {
            Schedules : [email],
            StartTime : {
               dateTime: store.commonStore.convertDateToGraph(start, false),
               timeZone: "Eastern Standard Time"
            },
            EndTime : {
                dateTime: store.commonStore.convertDateToGraph(end, false),
                timeZone: "Eastern Standard Time"
             },
             availabilityViewInterval: "15"
        }
        return request;
    }
}