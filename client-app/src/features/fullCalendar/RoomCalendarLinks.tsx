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

export default observer(function RoomCalendarLinks() {
  const { graphRoomStore } = useStore();
  const { loadingInitial, graphRooms, loadGraphRooms } = graphRoomStore;
  const [graphRoomsByBuilding, setGraphRoomsByBuilding] = useState<
    [string, GraphRoom[]][]
  >([]);

  const getGroupedGraphRooms = () => {
    return Object.entries(
      graphRooms.reduce((graphRooms, graphRoom) => {
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
    if (graphRooms && graphRooms.length)
      setGraphRoomsByBuilding(getGroupedGraphRooms());
  }, [loadGraphRooms, graphRooms.length]);

  return (
    <>
      <Divider horizontal>
        <Header as="h2">
          <Icon name="calendar" />
          Room Calendars
        </Header>
      </Divider>
      {loadingInitial && <LoadingComponent content="Loading Rooms" />}

      {!loadingInitial && (
        <CardGroup itemsPerRow={4}>
          {graphRoomsByBuilding.sort((a, b) => {
            if (a[0] < b[0]) {
            return -1;
             }
             if (a[0] > b[0]) {
                return 1;
             }
                return 0;
            }).map(
            ([building, rooms]) =>
              building && (
                <Card key={building}>
                  <Card.Content>
                    <Card.Header> {building}</Card.Header>
                    <Menu vertical fluid>
                      {rooms.sort((a, b) => {
                        if(a.displayName < b.displayName) { return -1; }
                        if(a.displayName > b.displayName) { return 1; }
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
