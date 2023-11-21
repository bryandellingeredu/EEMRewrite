import { useState, useEffect } from 'react';
import { utcToZonedTime} from 'date-fns-tz';
import { Divider, Header, Icon, Message, Table } from 'semantic-ui-react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import agent from '../../app/api/agent';
import ApproveRoomReservationAnyRow from './ApproveRoomReservationAnyRow';

interface RoomEvent {
    roomName: string,
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    webLink: string;
  }

  export default function ApproveAnyRoomReservation(){
    const [loadingEmails, setLoadingEmails] = useState<boolean>(true);
    const [roomEvents, setRoomEvents] = useState<RoomEvent[]>([]);
    
    useEffect(() => {
      const fetchEmailsInBatches = async () => {
        const roomEvents: RoomEvent[] = [];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0); // Set time to start of the day
    
        for (let i = 0; i < 100; i++) {
          try {
            const skip = i * 10;
            const result = await agent.ApproveEvents.getEmail(skip);
    
            // @ts-ignore
            const filteredMessages = result.filter(message => {
              return message.meetingRequestType && message.meetingRequestType === 'newMeetingRequest'
              && message.subject.startsWith('FW:');
            });
    
            // @ts-ignore
            filteredMessages.forEach((message) => {
              const startUtc = new Date(message.startDateTime.dateTime + 'Z');
              const endUtc = new Date(message.endDateTime.dateTime + 'Z');
              const start = utcToZonedTime(startUtc, 'America/New_York');
              const end = utcToZonedTime(endUtc, 'America/New_York');
    
              if (start >= yesterday) { // Check if the start date is greater than or equal to yesterday
                const roomEvent: RoomEvent = {
                  roomName: message.location.displayName,
                  title: message.subject.startsWith('FW: ') ? message.subject.substring(4) : message.subject,
                  webLink: message.webLink,
                  start: start,
                  end: end,
                  allDay: message.isAllDay,
                };
                roomEvents.push(roomEvent);
              }
            });
    
          } catch (error) {
            console.log(`Error fetching Emails for batch ${i + 1}:`, error);
            // Decide whether to continue or stop the loop
          }
        }
    
        setRoomEvents(roomEvents);
        setLoadingEmails(false);
      };
    
      fetchEmailsInBatches();
    }, []);
    
    
    return (
        <div>
        <Divider horizontal>
        <Header as='h2'>
        <Icon name='checked calendar'  />
          Approve Pending Room Reservations
        </Header>
        </Divider>
         {loadingEmails && <LoadingComponent content='Searching your email for room reservation requests, this can take several minutes'/>}
         <Table striped>
         <Table.Header>
          <Table.Row>
          <Table.HeaderCell>Room</Table.HeaderCell>
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
       <ApproveRoomReservationAnyRow key={index}
        index = {index}
        title = {event.title}
        start = {event.start}
        end = {event.end}
        allDay = {event.allDay}
        webLink = {event.webLink}
        roomName = {event.roomName}
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
    )
  }
