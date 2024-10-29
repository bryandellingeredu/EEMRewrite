import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import RoomList from "./RoomList";

export default observer(function RoomDashboard(){
  const {graphRoomStore} = useStore();
  const{loadingInitial, graphRooms, loadGraphRooms} = graphRoomStore;

  const {
    userStore: {isLoggedIn},
  } = useStore()

  useEffect(() => {
    if(!isLoggedIn)  window.location.href = `${window.location.origin}/ifcalendar`;
   }, [isLoggedIn] )

  useEffect(() => {
    if(!graphRooms.length) loadGraphRooms()
  }, [loadGraphRooms, graphRooms.length])

    return(
      <>
        {loadingInitial
                 &&<LoadingComponent content = 'Loading Rooms'/>
        }
        {!loadingInitial && <RoomList/>}  
      </>
    )
})