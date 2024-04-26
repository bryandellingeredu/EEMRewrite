import { makeAutoObservable } from "mobx";
import agent from "../api/agent";
import { store} from "./store";
import { GraphScheduleRequest } from "../models/graphScheduleRequest";
import { GraphScheduleResponse } from "../models/graphScheduleResponse";


export default class AvailabilityStore {
    loadingInitial = false; 

    constructor() {
        makeAutoObservable(this);
      }
    
    loadSchedule = async ( start: Date, end: Date, email?: string,)  => {
        this.setLoadingInitial(true);
        const emails = await this.getEmails(email);
        const graphScheduleRequest : GraphScheduleRequest = this.getGraphScheduleRequest(start, end, emails );
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

    loadSVTCSchedule = async(start: Date) => {
        const graphRoomStore = store.graphRoomStore;
        const {loadGraphRooms} = graphRoomStore;
        const emails: string[] = [];
        try{
            const rooms = await loadGraphRooms();
            const vtcRooms = rooms.filter(x => x.emailAddress.toLowerCase().includes('vtc'));
            const adjustedStart = new Date(start.getTime() - 30 * 60000);
            const graphScheduleRequest : GraphScheduleRequest = this.getGraphScheduleRequest(adjustedStart, start, vtcRooms.map(x => x.emailAddress) );
            const axiosResponse : GraphScheduleResponse[] = await agent.GraphSchedules.list(graphScheduleRequest);  
            return axiosResponse;
        }catch(error){
            console.log(error); 
        }
    }

    getEmails = async(email: string | undefined)  => { 
        const graphRoomStore = store.graphRoomStore;
        const {loadGraphRooms} = graphRoomStore;
        const emails: string[] = [];
        if(email){
            return [email];
        } else{
            try{       
              const rooms = await loadGraphRooms();
              rooms.forEach(room => emails.push(room.emailAddress));
            } catch(error){
                console.log(error); 
            } finally{
                return emails
            }
        }
    }

    setLoadingInitial = (state: boolean) => this.loadingInitial = state;

    getGraphScheduleRequest = ( start: Date, end: Date, emails: string[]) => {
        const request = {
            Schedules: emails,
            StartTime : {
               dateTime: store.commonStore.convertDateToGraph(start, false, false),
               timeZone: "Eastern Standard Time"
            },
            EndTime : {
                dateTime: store.commonStore.convertDateToGraph(end, false, true),
                timeZone: "Eastern Standard Time"
             },
             availabilityViewInterval: "15"
        }
        return request;
    }


}