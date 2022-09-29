import { observer } from "mobx-react-lite";
import { Card } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import RoomListItem from "./RoomListItem";
import { useState } from 'react';



export default observer (function RoomList() {
const[showAvailabilityIndicatorList, setShowAvailabilityIndicatorList] = useState<string[]>([]);
const {graphRoomStore} = useStore();
const{ graphRooms } = graphRoomStore;

function handleAddIdToShowAvailabilityIndicatorList(id: string){
    setShowAvailabilityIndicatorList([...showAvailabilityIndicatorList, id]);
  }


    return (
         <Card.Group itemsPerRow={2}>           
             {graphRooms.map(room => (
                <RoomListItem
                 key={room.id}
                 room={room}
                 showAvailabilityIndicatorList = {showAvailabilityIndicatorList}
                 addIdToShowAvailabilityIndicatorList = {handleAddIdToShowAvailabilityIndicatorList}
                  />
             ))}              
         </Card.Group>
  )})