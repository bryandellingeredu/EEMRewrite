import { observer } from "mobx-react-lite";
import { Button, Divider, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import {useState, useEffect} from 'react'
import { GraphRoom } from "../../app/models/graphRoom";
import { useStore } from "../../app/stores/store";
import { GraphScheduleResponse} from "../../app/models/graphScheduleResponse";
import LoadingComponent from "../../app/layout/LoadingComponent";
import RoomAvailabilityDetails from "./RoomAvailabilityDetails";
import { v4 as uuid } from "uuid";
import { useHistory } from "react-router-dom";
import { GraphRoomReservationParameters } from "../../app/models/graphRoomReservationParameters";

interface Props{
    room: GraphRoom
}

export default observer (function RoomAvailability({room}: Props){

    const {availabilityStore, commonStore, graphRoomStore} = useStore();
    const history = useHistory();
    const{loadSchedule } = availabilityStore
    const{roundToNearest15} = commonStore;
    const {addGraphRoomReservation} = graphRoomStore;
    const tommorow = new Date();
    const [startDate, setStartDate] = useState<Date>(roundToNearest15(new Date()));
    const [endDate, setEndDate] = useState<Date>(roundToNearest15(new Date(tommorow.setDate(new Date().getDate() + 1))));
    const [loading, setLoading] = useState(false);
    const [graphScheduleResponse, setGraphScheduleResponse] = useState<GraphScheduleResponse[]>([{availabilityView:  '',
    scheduleId: '',
    scheduleItems:  [
        {
        start: {dateTime: '',
            timeZone: ''
        },
        isPrivate: false,
        location: '',
        end: {dateTime: '',
            timeZone: ''
        },
        status: '',
        subject: '',
        isMeeting: false,
        isRecurring: false,
        isException: false,
        isReminderSet: false
    }
  ]}])
  
    const handleSetStartDate = (date: Date) => {
        setStartDate(date);
    }

    const handleSetEndDate = (date: Date) => {
        setEndDate(date);
    }

    const handleAddGraphRoomReservation = () =>{
        const startDateAsString = `${startDate.toLocaleDateString()}-${startDate.toLocaleTimeString()}`
        const endDateAsString = `${endDate.toLocaleDateString()}-${endDate.toLocaleTimeString()}`
        const paramId = uuid();
        const reservation : GraphRoomReservationParameters = {id: paramId, start: startDateAsString, end: endDateAsString, roomId: room.id}
        addGraphRoomReservation(reservation)
        history.push(`${process.env.PUBLIC_URL}/createActivityWithRoom/${paramId}`);
        }

    useEffect(() => {
        setLoading(true);
        const milliseconds  = +endDate -  +startDate;
        if(milliseconds > 60000 ){
        loadSchedule(startDate, endDate, room.emailAddress ).then(
            response => {
                setGraphScheduleResponse(response!)
                setLoading(false);
               })
            }else{
                setLoading(false);
            }
        }, [availabilityStore, room.emailAddress, startDate, endDate, loadSchedule]);


    return(
        <>
          {loading && 
                 <LoadingComponent content = 'Loading availability'/>
          }
          {!loading && 
          
       
        <Form>
         <Divider horizontal>
              <Header as='h5'>
                Availability
              </Header>
            </Divider>
        <Form.Field>
        <label>Pick a Start Time</label>
        <DatePicker
        timeIntervals={15}
        selected={startDate}
        onChange={(date:Date) => handleSetStartDate(date)}
        showTimeSelect
        timeCaption='time'
        dateFormat='MMMM d, yyyy h:mm aa'
         />
        </Form.Field>
        <Form.Field>
        <label>Pick an End Time</label>
        <DatePicker
        minDate={startDate}
        timeIntervals={15}
        selected={endDate}
        onChange={(date:Date) => handleSetEndDate(date)}
        showTimeSelect
        timeCaption='time'
        dateFormat='MMMM d, yyyy h:mm aa'
         />
        </Form.Field>
        <div className="ui divider"></div>
        {graphScheduleResponse[0] && graphScheduleResponse[0].scheduleItems.length < 1 &&
            <Segment.Group>
            <Segment >
             <Grid>
                 <Grid.Column width={1}>
                     <Icon size='large' color='green' name='thumbs up' />
                 </Grid.Column>
                 <Grid.Column width={9}>
                     This Room is available for the time selected
                 </Grid.Column>
                 <Grid.Column width={6}>
                 <Button size='tiny' type='button'primary onClick={handleAddGraphRoomReservation}>
                        <Icon name='calendar'></Icon>
                        Reserve This Room
                     </Button>
                 </Grid.Column>
             </Grid>
         </Segment>
         </Segment.Group>
        }
       
           {graphScheduleResponse[0] && graphScheduleResponse[0].scheduleItems.length > 0 &&
               graphScheduleResponse[0].scheduleItems.map((item, index) => (
                <RoomAvailabilityDetails
                 key={index}
                 item={item}
                  />
             ))  
        }
     </Form>
     }
     </>
   )})