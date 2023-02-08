import { GraphRoom } from "../models/graphRoom";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import { GraphRoomReservationParameters } from "../models/graphRoomReservationParameters";

export default class GraphRoomStore {
    graphRoomRegistry = new Map<string, GraphRoom>();
    graphRoomReservationParametersRegistry = new Map<string, GraphRoomReservationParameters>();
    loadingInitial = false;


constructor() {
    makeAutoObservable(this);
  }

  get graphRooms() {
    return Array.from(this.graphRoomRegistry.values()).sort((a, b) =>
    a.displayName > b.displayName ? 1 : -1);
  }

  get graphReservationParameters() {
    return Array.from(this.graphRoomReservationParametersRegistry.values());
  }

  get graphRoomOptions () {
    const options : any = [];
    this.graphRooms.forEach(room => {
        options.push({text: room.displayName, value: room.id })
    });
    return options
  }

  
  addGraphRoomReservation = (response: GraphRoomReservationParameters) => {
    this.graphRoomReservationParametersRegistry.set(response.id, response);
  }

  loadGraphRooms = async () => {
    if (!this.graphRoomRegistry.size) {
        this.setLoadingInitial(true); 
        try{
            const axiosResponse : GraphRoom[] = await agent.GraphRooms.list();
            runInAction(() => {
            axiosResponse.forEach(response => {
                this.graphRoomRegistry.set(response.id, response);
              })   
            })          
        } catch (error) {
          console.log(error);
         
        } finally  {
            this.setLoadingInitial(false);
            return this.graphRooms;
        }
    } else {
        return this.graphRooms;
    }
  }

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}