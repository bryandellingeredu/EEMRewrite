import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { useStore } from "../../app/stores/store";
import { useState, useEffect } from 'react';
import { GraphRoom } from "../../app/models/graphRoom";
import agent from '../../app/api/agent';
import { utcToZonedTime} from 'date-fns-tz';
import { Divider, Header, Icon, Message, Table } from 'semantic-ui-react';
import ApproveRoomReservationRow from './ApproveRoomReservationRow';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { ProviderState, Providers } from '@microsoft/mgt-element';

interface RoomEvent {
  roomName: string,
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  webLink: string;
}

function useIsEduSignedIn(): [boolean] {
  const [isSEduignedIn, setIsSEduignedIn] = useState(false);
  useEffect(() => {
    const updateState = () => {
      const provider = Providers.globalProvider;
      setIsSEduignedIn(provider && provider.state === ProviderState.SignedIn);
    };

    Providers.onProviderUpdated(updateState);
    updateState();

    return () => {
      Providers.removeProviderUpdatedListener(updateState);
    };
  }, []);
  return [isSEduignedIn];
}

export default observer(function ApproveRoomReservations() {
    const [isEduSignedIn] = useIsEduSignedIn();
    const {id} = useParams<{id: string}>();
    const { graphRoomStore} = useStore();
    const [loadingEmails, setLoadingEmails] = useState<boolean>(true);
    const { graphRooms, loadGraphRooms } = graphRoomStore;
    const [roomEvents, setRoomEvents] = useState<RoomEvent[]>([]);
    const [graphRoom, setGraphRoom] = useState<GraphRoom>(
        {
            address: {             
                    city: '',
                    countryOrRegion: '',
                    postalCode: '',
                    state: '',
                    street: ''     
            },
            displayName: '',
            phone: '',
            id: '',
            emailAddress: '',
            capacity: '',
            bookingType: '',
            tags: [],
            building: '',
            floorNumber: null,
            floorLabel: '',
            label: '',
            audioDeviceName: '',
            videoDeviceName: '',
            displayDeviceName: '',
            isWheelChairAccessible: '',
            thumbURL: '',
            picURL: ''
            }
    );
    useEffect(() => {
         console.log('starting use effect');
        if (!graphRooms || graphRooms.length < 1) loadGraphRooms();
    
        if (graphRooms && graphRooms.length > 0 ) {
          console.log('graph rooms exist')
          const foundRoom = graphRooms.find(x => x.id === id);
          if (foundRoom !== undefined) {
            console.log('found room')
            setGraphRoom(foundRoom);
            agent.ApproveEvents.getEmail()
              .then(result => {
                console.log('got results')
            
    
                // @ts-ignore
                const filteredMessages = result.filter(message => {
                  return message.location && message.location.displayName === foundRoom.displayName && message.meetingRequestType && message.meetingRequestType === 'newMeetingRequest';
                });
                if (filteredMessages.length > 0){
                console.log("Emails:", filteredMessages ); 
                const roomEvents : RoomEvent[] = [];
                // @ts-ignore
                filteredMessages.forEach((message, index) => {
                     // Explicitly specify that the original date-time is in UTC
              const startUtc = new Date(message.startDateTime.dateTime + 'Z');
              const endUtc = new Date(message.endDateTime.dateTime + 'Z');
      
              // Convert to the desired time zone ('America/New_York' for Eastern Time)
              const start = utcToZonedTime(startUtc, 'America/New_York');
              const end = utcToZonedTime(endUtc, 'America/New_York');
                  const roomEvent : RoomEvent = {
                    roomName: message.location.displayName,
                    title:  message.subject.startsWith('FW: ') ? message.subject.substring(4) : message.subject,
                    webLink: message.webLink,
                    start: start,
                    end: end,
                    allDay: message.isAllDay
                  }
                  roomEvents.push(roomEvent);
          
                });
                setRoomEvents(roomEvents);
                setLoadingEmails(false);
                } else {
                  setLoadingEmails(false);
                  console.log('no filtered events');
                } 
                                 
              })
              .catch(error => {
                setLoadingEmails(false);
                console.log("Error fetching Emails:", error);
              });
          }
        }
      }
    , [graphRooms]);
    


    return (
      <div>
    <Divider horizontal>
     <Header as='h2'>
     <Icon name='checked calendar'  />
       Approve Pending Room Reservations for {graphRoom.displayName}
     </Header>
     </Divider>
        {loadingEmails && <LoadingComponent content='Searching your email for room reservation requests, this can take several minutes'/>}
      <Table striped>
        <Table.Header>
          <Table.Row>
        <Table.HeaderCell>Title</Table.HeaderCell>
        <Table.HeaderCell>Start</Table.HeaderCell>
        <Table.HeaderCell>End</Table.HeaderCell>
        <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
  {roomEvents
  .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .map((event, index) => {
      return (
       <ApproveRoomReservationRow key={index}
        index = {index}
        title = {event.title}
        start = {event.start}
        end = {event.end}
        allDay = {event.allDay}
        webLink = {event.webLink}
         />
      );
    })}
</Table.Body>
      </Table>
{roomEvents.length < 1 &&
  <Message
    info
    header='No Data Found'
    content="The system could not find any pending room reservations"
  />
}
     
    </div>
    );
})
