import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Card,
  CardGroup,
  Divider,
  Header,
  Icon,
  Menu,
} from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { GraphRoom } from "../../app/models/graphRoom";
import { useStore } from "../../app/stores/store";
import Select  from "react-select";
import { useHistory } from 'react-router-dom';

interface OptionType {
  value: string;
  label: string;
}


export default observer(function RoomCalendarLinks() {
  const history = useHistory();
  const { graphRoomStore } = useStore();
  const { loadingInitial, graphRooms, loadGraphRooms } = graphRoomStore;
  const [graphRoomsByBuilding, setGraphRoomsByBuilding] = useState<
    [string, GraphRoom[]][]
  >([]);
  const [filteredRooms, setFilteredRooms] = useState(graphRooms);
  const [inputValue, setInputValue] = useState("");

  const handleChange = (
    selectedOption: OptionType | null
  ) => {
    if (selectedOption) {
      history.push( `${process.env.PUBLIC_URL}/roomcalendar/${selectedOption.value}`  );
    }
  };

  const handleInputChange = (input: string) => {
    setInputValue(input);
    if (input) {
      setFilteredRooms(graphRooms.filter(room => room.displayName.toLowerCase().includes(input.toLowerCase())));
    } else {
      setFilteredRooms(graphRooms);
    }
    setGraphRoomsByBuilding(getGroupedGraphRooms());
  };

  const getGroupedGraphRooms = () => {
    return Object.entries(
      filteredRooms.reduce((graphRooms, graphRoom) => {
        const building = graphRoom.building || "Miscellaneous";
        graphRooms[building] = graphRooms[building]
          ? [...graphRooms[building], graphRoom]
          : [graphRoom];
        return graphRooms;
      }, {} as { [key: string]: GraphRoom[] })
    );
  };

  useEffect(() => {
    if (!graphRooms.length) loadGraphRooms();
  }, [loadGraphRooms, graphRooms.length]);

useEffect(() => {
    if (graphRooms.length > 0) {
      setFilteredRooms(graphRooms);
      setGraphRoomsByBuilding(getGroupedGraphRooms());
    }
  }, [graphRooms]);



  return (
    <>
      <div style={{ position: 'relative' }}>
      <Divider horizontal>
        <Header as="h2">
          <Icon name="calendar" />
          Room Calendars
        </Header>
      </Divider>
      <div  style={{ position: 'absolute', top: 0, left: 0, minWidth: '500px' }}>
      <Select
        
        name="rooms"
        placeholder="start typing to filter rooms. select a room to go to its calendar"
        isClearable
        onChange={(e) => handleChange(e)}
        onInputChange={(input) => handleInputChange(input)}
        options={graphRoomStore.graphRooms.map(room => ({
          value: room.id,
          label: room.displayName,
        })).sort((a, b) => a.label.localeCompare(b.label))}
      />
      </div>
    </div>
      {loadingInitial && <LoadingComponent content="Loading Rooms" />}

      {!loadingInitial && (
        <CardGroup itemsPerRow={4}>
         {graphRoomsByBuilding.sort((a, b) => {
    return a[1].length - b[1].length;
}).map(([building, rooms]) =>
  building && (
    <Card key={building}>
      <Card.Content>
        <Card.Header> {building}</Card.Header>
        <Menu vertical fluid>
          {rooms.sort((a, b) => {
            if (a.displayName < b.displayName) {
              return -1;
            }
            if (a.displayName > b.displayName) {
              return 1;
            }
            return 0;
          }).map((room) => (
            <Menu.Item
              as={NavLink}
              to={`${process.env.PUBLIC_URL}/roomcalendar/${room.id}`}
              content={room.displayName}
            />
          ))}
        </Menu>
      </Card.Content>
    </Card>
  )
)}
        </CardGroup>
      )}
    </>
  );
});
