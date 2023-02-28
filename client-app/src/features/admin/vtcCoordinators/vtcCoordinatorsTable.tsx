import { observer } from "mobx-react-lite";
import { useStore } from "../../../app/stores/store";
import { Fragment, useEffect, useState } from "react";
import { Button, Divider, Dropdown,  Header, Icon, Table } from "semantic-ui-react";
import agent from "../../../app/api/agent";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { GraphRoom } from "../../../app/models/graphRoom";
import { NavLink } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { VTCCoordinator } from "../../../app/models/vtcCoordinator";

interface VTCCoordinatorData {
    id: string
    displayName: string
    coordinators: VTCCoordinator[]
}

export default observer(function VTCCoordinatorTable() {
  const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [vtcCoordinators, setVTCCoordinators] = useState<VTCCoordinator[]>([]);
    const [vtcCoordinatorTableData, setVTCCoordinatorTableData] = useState<VTCCoordinatorData[]>([]);
    const {graphRoomStore} = useStore();
    const {graphRooms, loadGraphRooms} = graphRoomStore
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedCoordinator, setSelectedCoordinator] = useState("");

    const handleCellClick = (roomId: string) => {
      history.push(`${process.env.PUBLIC_URL}/manageVTCCoordinators/${roomId}`);
    };

    function createTableData(response: VTCCoordinator[], grooms: GraphRoom[] ){
      const result =  grooms.filter(graphRoom => graphRoom.displayName.includes("VTC"))
        .map(graphRoom => {
          return {
            id: graphRoom.id,
            displayName: graphRoom.displayName,
            coordinators: response.filter(coordinator => coordinator.roomEmail === graphRoom.emailAddress)
          };
        });
      setVTCCoordinatorTableData(result);
    }
   
    useEffect(() => {
        setLoading(true);
        if (!graphRooms || graphRooms.length === 0) {
          loadGraphRooms().then((grooms) => {
            agent.VTCCoordinators.list()
              .then((response) => {
                setVTCCoordinators(response);
                createTableData(response, grooms);
                setLoading(false);
              })
              .catch((error) => {
                console.error(error);
                setLoading(false);
              });
          });
        } else {
          agent.VTCCoordinators.list()
            .then((response) => {
              setVTCCoordinators(response);
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
      };

      const handleOnCoordinatorChange = (e: any, data: any) => {
        setSelectedCoordinator(data.value);
      };



    return (
        <>
          <Divider horizontal>
            <Header as="h2">
                <Icon name='computer' />     
              Manage VTC Coordinators
            </Header>
          </Divider>

          {loading && <LoadingComponent content="Loading VTC Coordinator Data..." />}

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
  options={vtcCoordinators
    .reduce((acc, coordinator) => {
      if (!acc.find((item) => item.value === coordinator.vtcCoordinatorEmail)) {
        acc.push({
          key: coordinator.vtcCoordinatorEmail,
          text: coordinator.vtcCoordinatorDisplayName,
          value: coordinator.vtcCoordinatorEmail,
        });
      }
      return acc;
    }, [] as { key: string; text: string; value: string }[])
    .sort((a, b) => {
      const aWords = a.text.split(" ");
      const bWords = b.text.split(" ");
      const aLastWord = aWords[aWords.length - 1];
      const bLastWord = bWords[bWords.length - 1];
      return aLastWord.localeCompare(bLastWord);
    })}
  selection
  search
  placeholder="Filter By Coordinator"
  onChange={handleOnCoordinatorChange}
/>

          <Table celled structured>
  <Table.Header>
    <Table.Row >
      <Table.HeaderCell>Room</Table.HeaderCell>
      <Table.HeaderCell>VTC Coordinator</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell></Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {vtcCoordinatorTableData
    .filter((x) =>selectedRoom ? x.id === selectedRoom : 1 === 1 )
    .filter((x) => selectedCoordinator ? x.coordinators.map((y) => y.vtcCoordinatorEmail).includes(selectedCoordinator): 1 === 1)
    .map((room, index1) => (
      <Fragment key={room.id}>
        <Table.Row positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0} onClick={() => handleCellClick(room.id)}>
          <Table.Cell rowSpan={room.coordinators.length || 1} >
            {room.displayName}
          </Table.Cell>
          <Table.Cell>
            {room.coordinators && room.coordinators.length > 0 && room.coordinators[0].vtcCoordinatorDisplayName}
          </Table.Cell>
          <Table.Cell>
          {room.coordinators && room.coordinators.length > 0 && room.coordinators[0].vtcCoordinatorEmail}
          </Table.Cell>
          <Table.Cell
            rowSpan={room.coordinators.length || 1}
                         positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
                        textAlign="center"
                      >
                         <Button
                         size='tiny'
                         basic color={(index1 + 1) % 2 === 0 ? 'brown' : 'red'}
                          icon
                          type="button"
                          as={NavLink}
                          to={`${process.env.PUBLIC_URL}/manageVTCCoordinators/${room.id}`}
                        >
                          <Icon name="edit" />
                          Edit
               </Button>
                        </Table.Cell>
        </Table.Row>
        {room.coordinators
          .filter((coordinator, index2) => index2 !== 0)
          .map((coordinator, index2) => (
            <Table.Row
              key={coordinator.id}
              positive={(index1 + index2 + 1) % 2 === 0}
              negative={(index1 + index2 + 1) % 2 !== 0}
            >
              <Table.Cell>{coordinator.vtcCoordinatorDisplayName}</Table.Cell>
              <Table.Cell>{coordinator.vtcCoordinatorEmail}</Table.Cell>
            </Table.Row>
          ))}
      </Fragment>
    ))}
  </Table.Body>
</Table>
          </>

)});