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
    'Bldg22UptonHallBradleyAuditoriumRm101@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/BradleyAuditorium.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/BradleyAuditoriumThumb.png`
    },
    'Bldg22UptonHallGarrisonCommanderConfRmRm117A@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/GarrisonCommanderConferenceRm.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/GarrisonCommanderConferenceRmThumb.png`
    },
    'Bldg22UptonHallUptonAuditorium@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/UptonAuditorium.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/UptonAuditoriumThumb.png`
    },
    'AnneElyHallCPACClassroomRm202@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/CPAC.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/CPACThumb.png`
    },
    'Bldg47SSIConferenceRoomRm119@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/SSI.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/SSIThumb.png`
    },
    'ArmstrongHallG8ConfRm@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/G8ConferenceThumb.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/G8Conference.png`
    },
    'Bldg315OldG3ConferenceRoom@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/OldG3Conference.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/OldG3ConferenceThumb.png`
    },
    'Bldg330DPWConfRoom@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/DPW.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/DPWThumb.png`
    },
    'Bldg632ASEPClassroomRm112@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/ASEPClassroom.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/ASEPClassroomThumb.png`
    },
    'Bldg632ASEPConferenceRmRm118@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/ASEPConference.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/ASEPConferenceThumb.png`
    },
    'Bldg632G3ConferenceRm@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/G3Conference.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/G3ConferenceThumb.png`
    },
    'Bldg632G3SIPRRoomRm136@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/G3SIPR.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/G3SIPRThumb.png`
    },
    'Bldg6512ndFloorCentralCommonsRm2067@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/CentralCommons.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/CentralCommonsThumb.png`
    },
    'Bldg6512ndFloorEastCommonsRm2029@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/EastCommons.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/EastCommonsThumb.png`
    },
    'Bldg6512ndFloorLargeConferenceRoomRm2086@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/SecondFloorLargeConference.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/SecondFloorLargeConferenceThumb.png`
    },
    'Bldg6512ndFloorWestCommonsRm2091@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/SecondFloorWestCommons.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/SecondFloorWestCommonsThumb.png`
    },
    'Bldg6513ndFloorCentralCommonsStudyRm3003@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/ThirdFloorCentralCommonsStudy.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/ThirdFloorCentralCommonsStudyThumb.png`
    },
    'Bldg6513rdFloorCentralCommonsRm3063@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/ThirdFloorCentralCommons.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/ThirdFloorCentralCommonsThumb.png`
    },
    'Bldg6513rdFloorEastCommonsRm3022@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3022.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3022Thumb.png`
    },
    'Bldg6513rdFloorLargeConfRoomRm3085@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3085.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3085Thumb.png`
    },
    'Bldg6513rdFloorMediumConferenceRoom3002@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3002.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3002Thumb.png`
    },
    'Bldg6513rdFloorWestCommonsRm3087@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3087.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3087Thumb.png`
    },
    'Bldg651BlissAuditoriumRm146@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1146.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1146Thumb.png`
    },
    'Bldg651MaryWalkerRoomRm041@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT041.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT041Thumb.png`
    },
    'Bldg651BoardRoomOttoChaneyRoomRm061@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT061.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT061Thumb.png`
    },
    'Bldg651-CafeteriaRm037@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT037.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT037Thumb.png`
    },
    'Bldg651CentralMediumCollabRmRm2064@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2064.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2064Thumb.png`
    },
    'Bldg651CoLab2069@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2069.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2069Thumb.png`
    },
    'Bldg651CoLab2071@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2071.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2071Thumb.png`
    },
    'Bldg651CoLab2073@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2073.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2073Thumb.png`
    },
    'Bldg651CoLab3064@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3064.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3064Thumb.png`
    },
    'Bldg651CoLab3067@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3067.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3067Thumb.png`
    },
    'Bldg651CoLab3069@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3069.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3069Thumb.png`
    },
    'Bldg651CoLab3100@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3100.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3100Thumb.png`
    },
    'Bldg651CoLab3102@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3102.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3102Thumb.png`
    },
    'Bldg651CoLab3104@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3104.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3104Thumb.png`
    },
    'Bldg651CoLab3106@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3106.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3106Thumb.png`
    },
    'Bldg651CommandConferenceRoomCCR@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT059.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT059Thumb.png`
    },
    'Bldg651IHubCafeRm116@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1116.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1116Thumb.png`
    },
    'Bldg651InnovationHubCollaborationCenterTheForgeRm115@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1115.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1115Thumb.png`
    },
    'Bldg651InnovationHubLaboratoryRm114@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1114.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1114Thumb.png`
    },
    'Bldg651LearningLab1Rm120@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1120.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1120Thumb.png`
    },
    'Bldg651LearningLab2Rm121@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1121.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1121Thumb.png`
    },
    'Bldg651LectureHallEastIHOF1@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1147.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1147Thumb.png`
    },
    'Bldg651LectureHallSocial@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1145.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1145Thumb.png`
    },
    'Bldg651LectureHallWestIHOF2Rm148@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1148.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1148Thumb.png`
    },
    'Bldg651PodCastRoomRm082@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT082.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT082Thumb.png`
    },
    'Bldg651RecordingStudioRm078@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT078.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/RmT078Thumb.png`
    },
    'Bldg651SeminarRoom2026@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2026.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2026Thumb.png`
    },
    'Bldg651SeminarRoomDoubleRm2031@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2031.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2031Thumb.png`
    },
    'Bldg651SeminarRoomDoubleRm2032@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2032.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2032Thumb.png`
    },
    'Bldg651SeminarRoom2057@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2057.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2057Thumb.png`
    },
    'Bldg651SeminarRoom2060@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2060.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2060Thumb.png`
    },
    'Bldg651SeminarRoom2062@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2062.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2062Thumb.png`
    },
    'Bldg651SeminarRoom2066@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2066.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2066Thumb.png`
    },
    'Bldg651SeminarRoom2084@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2084.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2084Thumb.png`
    },
    'Bldg651SeminarRoomDoubleRm2089@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2089.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2089Thumb.png`
    },
    'Bldg651SeminarRoomDoubleRm2090@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2090.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2090Thumb.png`
    },
    'Bldg651SeminarRoom2099@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2099.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2099Thumb.png`
    },
    'Bldg651SeminarRoom2107@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2107.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm2107Thumb.png`
    },
    'Bldg651SeminarRoom3018@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3018.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3018Thumb.png`
    },
    'Bldg651SeminarRoomDoubleRm3024@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3024.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3024Thumb.png`
    },
    'Bldg651SeminarRoomDoubleRm3025@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3025.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3025Thumb.png`
    },
    'Bldg651SeminarRoom3048@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3048.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3048Thumb.png`
    },
    'Bldg651SeminarRoom3051@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3051.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3051Thumb.png`
    },
    'Bldg651SeminarRoom3053@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3053.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3053Thumb.png`
    },
    'Bldg651SeminarRoom3062@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3062.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3062Thumb.png`
    },
    'Bldg651Seminar20Rm3083@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3083.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3083Thumb.png`
    },
    'Bldg651SeminarRoomDoubleRm3086@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3086.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3086Thumb.png`
    },
    'Bldg651SeminarRoom3080@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3080.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3080Thumb.png`
    },
    'Bldg651SeminarRoom3095@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3095.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3095Thumb.png`
    },
    'Bldg651SeminarRoom3107@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3107.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm3107Thumb.png`
    },
    'Bldg651SkyBoxNorthRm142@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1142.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1142Thumb.png`
    },
    'Bldg651SkyBoxSouthRm143@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1143.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1143Thumb.png`
    },
    'Bldg651TheAtriumRm102@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1102.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1102Thumb.png`
    },
    'Bldg651TheStudioRm117@armywarcollege.edu' : {
      picURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1117.png`,
      thumbURL: `${process.env.PUBLIC_URL}/assets/rooms/Rm1117Thumb.png`
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