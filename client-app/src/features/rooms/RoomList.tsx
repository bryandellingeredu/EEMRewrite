import { observer } from "mobx-react-lite";
import { Card } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import RoomListItem from "./RoomListItem";
export default observer (function RoomList() {

const {graphRoomStore} = useStore();
const{ graphRooms } = graphRoomStore;

    return (
         <Card.Group>           
             {graphRooms.map(room => (
                <RoomListItem key={room.id} room={room} />
             ))}              
         </Card.Group>
  )})