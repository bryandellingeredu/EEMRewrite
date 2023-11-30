import { GraphRoom } from "../models/graphRoom";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import { GraphRoomReservationParameters } from "../models/graphRoomReservationParameters";
import { RoomDelegate } from "../models/roomDelegate";

interface Option {
  label: string;
  value: string;
  isDisabled: boolean;
}

export default class GraphRoomStore {
    graphRoomRegistry = new Map<string, GraphRoom>();
    graphRoomReservationParametersRegistry = new Map<string, GraphRoomReservationParameters>();
    roomDelegatesRegistry = new Map<string, RoomDelegate>();
    roomOptionRegistry = new Map<string, Option[]>()
    loadingInitial = false;


constructor() {
    makeAutoObservable(this);
  }

  get graphRooms() {
    return Array.from(this.graphRoomRegistry.values()).sort((a, b) =>
    a.displayName > b.displayName ? 1 : -1);
  }

  get allRoomOptions() {
    return Array.from(this.roomOptionRegistry.values());
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

  addUpdateRoomOptions = (id: string, options: Option[]) =>{
    this.roomOptionRegistry.set(id, options)
  }

  loadRoomOptions = (id: string): Option[] => {
    return this.roomOptionRegistry.get(id) || [];
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
    'Bldg650CollinsHall18thInfConferenceRoom@armywarcollege.edu':{
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/EighteenInfConfRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/EighteenInfConfRoomThumb.png`
    },
    'Bldg650CollinsHall22ndInfConferenceRoomSVTC@armywarcollege.edu':{
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/TwentyTwoInfConfRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/TwentyTwoInfConfRoomThumb.png`
    },
    'Bldg650CollinsHallAachenRoomSVTC@armywarcollege.edu':{
    picURL: `${process.env.PUBLIC_URL}/assets/rooms/AachenRoom.png`,
    thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/AachenRoomThumb.png`
    },
    'Bldg650CollinsHallArdennesRoomCafeteria@armywarcollege.edu':{
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/ArdennesRoom.png`,
    thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/ArdennesRoomThumb.png`
    },
    'Bldg650CollinsHallB030@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/B030.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/B030Thumb.png`
    },
    'Bldg650CollinsHallB033ASVTC@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/B033A.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/B033AThumb.png`
    },
    'Bldg650CollinsHallB037SVTC@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/B037.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/B037Thumb.png`
    },
    'Bldg650CollinsHallCherbourgRoomRm1015@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/CherbourgRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/CherbourgRoomThumb.png`
    },
    'Bldg650CollinsHallGuadalcanalRoomRm3013@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/GuadalcanalRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/GuadalcanalRoomThumb.png`
    },
    'Bldg650CollinsHallJayhawkLoungeRm1028@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/JayhawkLounge.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/JayhawkLoungeThumb.png`
    },
    'Bldg650CollinsHallMediaRoom@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/MediaRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/MediaRoomThumb.png`
    },
    'Bldg650CollinsHallNormandyConferenceRoomSVTC@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/NormandyConferenceRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/NormandyConferenceRoomThumb.png`
    },
    'Bldg650CollinsHallStLoRoomRm3006@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/StLoRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/StLoRoomThumb.png`
    },
    'Bldg650CollinsHallToyRoomRm1018@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/ToyRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/ToyRoomThumb.png`
    },
    'Bldg650CollinsHallTriangleRoomSVTC@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/TriangleRoom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/TriangleRoomThumb.png`
    },
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