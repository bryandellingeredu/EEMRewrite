import { GraphRoom } from "../models/graphRoom";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import { GraphRoomReservationParameters } from "../models/graphRoomReservationParameters";
import { RoomDelegate } from "../models/roomDelegate";

export default class GraphRoomStore {
    graphRoomRegistry = new Map<string, GraphRoom>();
    graphRoomReservationParametersRegistry = new Map<string, GraphRoomReservationParameters>();
    roomDelegatesRegistry = new Map<string, RoomDelegate>();
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

  get roomDelegates() {
    return Array.from(this.roomDelegatesRegistry.values());
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

  loadRoomDelegates = async () => {
    if(!this.roomDelegatesRegistry.size){
      this.setLoadingInitial(true); 
      try{
        const axiosResponse : RoomDelegate[] = await agent.RoomDelegates.list();
        runInAction(() => {
          axiosResponse.forEach(response => {
              this.roomDelegatesRegistry.set(response.id, response);
            })   
          })  
      } catch (error) {
        console.log(error);
       
      } finally  {
          this.setLoadingInitial(false);
          return this.roomDelegates;
      }
    } else {
      return this.roomDelegates;
    }
  }

  roomAssets: { [emailAddress: string]: { picURL: string; thumbURL: string } } = {
    'BlissHallTestAuditorium@armywarcollege.edu': {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/BlissHallThumb.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/BlissHall.jpg`
    },
    'Test_Room_1@armywarcollege.edu': {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/CherbourgThumb.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Cherbourg.jpg`
    },
    'ReynoldsTheater@armywarcollege.edu': {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/ReynoldsThumb.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Reynolds_Theater.jpg`
    },
    'Test_Room_2@armywarcollege.edu': {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/RidgewayHallThumb.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Ridgway_Hall_Conf_Rm.jpg`
    },
    'UptonHallTestConfRoom@armywarcollege.edu': {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/UptonAuditoriumThumb.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/UptonAuditoriumThumb.jpg`
    }
  };

  loadGraphRooms = async () => {
    if (!this.graphRoomRegistry.size) {
      this.setLoadingInitial(true);
      try {
        const axiosResponse: GraphRoom[] = await agent.GraphRooms.list();
        runInAction(() => {
          axiosResponse.forEach(response => {
            const assets = this.roomAssets[response.emailAddress];
            if (assets) {
              response.picURL = assets.picURL;
              response.thumbURL = assets.thumbURL;
            }
            this.graphRoomRegistry.set(response.id, response);
          });
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.setLoadingInitial(false);
        return this.graphRooms;
      }
    } else {
      return this.graphRooms;
    }
  };

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}