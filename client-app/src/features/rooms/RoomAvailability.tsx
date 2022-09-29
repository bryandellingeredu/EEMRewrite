import { observer } from "mobx-react-lite";
import { Button, Divider, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import {useState, useEffect} from 'react'
import { GraphRoom } from "../../app/models/graphRoom";
import { useStore } from "../../app/stores/store";
import { GraphScheduleResponse } from "../../app/models/graphScheduleResponse";
import LoadingComponent from "../../app/layout/LoadingComponent";
import RoomAvailabilityDetails from "./RoomAvailabilityDetails";

interface Props{
    room: GraphRoom
}

export default observer (function RoomAvailability({room}: Props){
    const {availabilityStore, commonStore} = useStore();
    const{loadingInitial, loadSchedule } = availabilityStore
    const{roundToNearest15} = commonStore;
    const tommorow = new Date();
    const [startDate, setStartDate] = useState<Date>(roundToNearest15(new Date()));
    const [endDate, setEndDate] = useState<Date>(roundToNearest15(new Date(tommorow.setDate(new Date().getDate() + 1))));
    const [loading, setLoading] = useState(false);
    const [graphScheduleResponse, setGraphScheduleResponse] = useState<GraphScheduleResponse[]>(
        [{
            availabilityView: '',
            scheduleId: '',
            scheduleItems: [
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
            }]
        }]
    )
  

    useEffect(() => {
        setLoading(true);
        const milliseconds  = +endDate -  +startDate;
        if(milliseconds > 60000 ){
        loadSchedule(room.emailAddress, startDate, endDate).then(
            response => {
                setGraphScheduleResponse(response!)
                setLoading(false);
               })
            }else{
                setLoading(false);
            }
        }, [availabilityStore, room.emailAddress, startDate, endDate]);


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
        onChange={(date:Date) => setStartDate(date)}
        showTimeSelect
        timeCaption='time'
        dateFormat='MMMM d, yyyy h:mm aa'
         />
        </Form.Field>
        <Form.Field>
        <label>Pick an End Time</label>
        <DatePicker
        timeIntervals={15}
        selected={endDate}
        onChange={(date:Date) => setEndDate(date)}
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
                 <Grid.Column width={14}>
                     This Room is available for the time selected
                 </Grid.Column>
             </Grid>
         </Segment>
         <Segment>
         <Button.Group>
            <Button secondary >Department Activity Reservation</Button>
            <Button.Or />
            <Button positive>Non Department Reservation</Button>
        </Button.Group>
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