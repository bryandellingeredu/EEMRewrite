import { observer } from "mobx-react-lite";
import { useStore } from "../../../app/stores/store";
import { Fragment, useEffect, useState } from "react";
import { Button, Divider, Dropdown, Grid, Header, Icon, Table } from "semantic-ui-react";
import agent from "../../../app/api/agent";
import { RoomDelegate } from "../../../app/models/roomDelegate";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { GraphRoom } from "../../../app/models/graphRoom";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

interface RoomDelegateData {
    id: string
    displayName: string
    delegates: RoomDelegate[]
}

export default observer(function RoomDelegateTable() {
  const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [roomDelegates, setRoomDelegates] = useState<RoomDelegate[]>([]);
    const [roomDelegateTableData, setRoomDelegateTableData] = useState<RoomDelegateData[]>([]);
    const {graphRoomStore} = useStore();
    const {graphRooms, loadGraphRooms} = graphRoomStore
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedOwner, setSelectedOwner] = useState("");

    const handleCellClick = (roomId: string) => {
      history.push(`${process.env.PUBLIC_URL}/manageRoomDelegate/${roomId}`);
    };

    function createTableData(response: RoomDelegate[], grooms: GraphRoom[] ){
       const result =  grooms.map(graphRoom => {
        return {
          id: graphRoom.id,
          displayName: graphRoom.displayName,
          delegates: response.filter(roomDelegate => roomDelegate.roomEmail === graphRoom.emailAddress)
        };
      });
      setRoomDelegateTableData(result);
    }
   
    useEffect(() => {
        setLoading(true);
        if (!graphRooms || graphRooms.length === 0) {
          loadGraphRooms().then((grooms) => {
            agent.RoomDelegates.list()
              .then((response) => {
                setRoomDelegates(response);
                createTableData(response, grooms);
                setLoading(false);
              })
              .catch((error) => {
                console.error(error);
                setLoading(false);
              });
          });
        } else {
          agent.RoomDelegates.list()
            .then((response) => {
              setRoomDelegates(response);
              createTableData(response, graphRooms)
              setLoading(false);
            })
            .catch((error) => {
              console.error(error);
              setLoading(false);
            });
        }
      }, []);

      const handleOnRoomChange = (e: any, data: any) => {
        setSelectedRoom(data.value);
        console.log(data.value);
      };

      const handleOnOwnerChange = (e: any, data: any) => {
        setSelectedOwner(data.value);
        console.log(data.value);
      };



    return (
        <>
          <Divider horizontal>
            <Header as="h2">
                <Icon name='configure' />     
              Manage Room  Delegates
            </Header>
          </Divider>

          {loading && <LoadingComponent content="Loading Room Delegate Data..." />}

          <Dropdown
              clearable
              options={graphRooms.map((room) => ({
                key: room.id,
                text: room.displayName,
                value: room.id,
              }))}
              selection
              search
              placeholder="Filter By Room"
              onChange={handleOnRoomChange}
            />

<Dropdown
  clearable
  options={roomDelegates
    .reduce((acc, delegate) => {
      if (!acc.find((item) => item.value === delegate.delegateEmail)) {
        acc.push({
          key: delegate.delegateEmail,
          text: delegate.delegateDisplayName,
          value: delegate.delegateEmail,
        });
      }
      return acc;
    }, [] as { key: string; text: string; value: string }[])
    .sort((a, b) => {
      return a.text.localeCompare(b.text);
    })}
  selection
  search
  placeholder="Filter By Delegate"
  onChange={handleOnOwnerChange}
/>

          <Table celled structured>
  <Table.Header>
    <Table.Row >
      <Table.HeaderCell>Room</Table.HeaderCell>
      <Table.HeaderCell>Room Delegate</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell></Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {roomDelegateTableData
    .filter((x) =>selectedRoom ? x.id === selectedRoom : 1 === 1 )
    .filter((x) => selectedOwner ? x.delegates.map((y) => y.delegateEmail).includes(selectedOwner): 1 === 1)
    .map((room, index1) => (
      <Fragment key={room.id}>
        <Table.Row positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0} onClick={() => handleCellClick(room.id)}>
          <Table.Cell rowSpan={room.delegates.length || 1} >
            {room.displayName}
          </Table.Cell>
          <Table.Cell>
            {room.delegates && room.delegates.length > 0 && room.delegates[0].delegateDisplayName}
          </Table.Cell>
          <Table.Cell>
            {room.delegates && room.delegates.length > 0 && room.delegates[0].delegateEmail}
          </Table.Cell>
          <Table.Cell
            rowSpan={room.delegates.length || 1}
                         positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
                        textAlign="center"
                      >
                         <Button
                         size='tiny'
                         basic color={(index1 + 1) % 2 === 0 ? 'brown' : 'red'}
                          icon
                          type="button"
                          as={NavLink}
                          to={`${process.env.PUBLIC_URL}/manageRoomDelegate/${room.id}`}
                        >
                          <Icon name="edit" />
                          Edit
               </Button>
                        </Table.Cell>
        </Table.Row>
        {room.delegates
          .filter((delegate, index2) => index2 !== 0)
          .map((delegate, index2) => (
            <Table.Row
              key={delegate.id}
              positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
            >
              <Table.Cell>{delegate.delegateDisplayName}</Table.Cell>
              <Table.Cell>{delegate.delegateEmail}</Table.Cell>
            </Table.Row>
          ))}
      </Fragment>
    ))}
  </Table.Body>
</Table>
          </>

)});