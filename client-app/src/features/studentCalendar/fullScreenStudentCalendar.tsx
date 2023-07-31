import {useState, useEffect, useCallback, useRef} from 'react';
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction";
import { useHistory} from "react-router-dom";
import { format } from 'date-fns';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Pikaday from "pikaday";
import { Loader, Modal, Button, Header } from 'semantic-ui-react'; 
import agent from '../../app/api/agent';
import LoadingComponent from '../../app/layout/LoadingComponent';

interface EventInfo{
  title: string
  time: string
  location: string
  description: string
  leadOrg: string
  actionOfficer: string
  actionOfficerPhone: string
  mandatory: boolean
  presenter: string
  uniform: string
  notes: string
}

export default function FullScreenStudentCalendar (){
    const [view, setView] = useState(localStorage.getItem("calendarViewSC") || "timeGridWeek");
    const [height, setHeight] = useState(window.innerHeight - 100);
    const calendarRef = useRef<FullCalendar>(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    const [openModal, setOpenModal] = useState(false);
    const [eventInfo, setEventInfo] = useState<EventInfo>(
      {title: '',
       time: '',
       location: '',
       description: '',
       leadOrg: '',
       actionOfficer: '',
       actionOfficerPhone: '',
       mandatory: false,
       presenter: '',
       uniform: '',
       notes: ''
      }
      )
    const [loadingEvent, setLoadingEvent] = useState(false);

    useEffect(() => {
        const handleResize = () => {
          setHeight(window.innerHeight - 200);
        };
        window.addEventListener("resize", handleResize);   
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);

    
      

      
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // Initialize Pikaday
      const picker = new Pikaday({
        field: document.querySelector(".fc-datepicker-button") as HTMLElement,
        format: "YYYY-MM-DD",
        onSelect: function (dateString) {
          picker.gotoDate(new Date(dateString));
          calendarApi.gotoDate(new Date(dateString));
        },
      });
  
      return () => {
        picker.destroy();
      };
    }
  },[calendarRef]);



const  handleMouseEnter = async (arg : EventClickArg) =>{
  var content = `<p> ${ getTime(arg)}</p>              
  <p> <strong>Title: </strong> ${arg.event.title} </p>
  ${arg.event.extendedProps.description ?'<p><strong>Description: <strong>' + arg.event.extendedProps.description + '</p>' : '' }
  ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: <strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
  ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: <strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
  ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
  ${arg.event.extendedProps.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
  ${arg.event.extendedProps.studentCalendarMandatory ? '<p><strong>Attendance is : <strong> Mandatory </p>' : '' }
  ${ !arg.event.extendedProps.studentCalendarMandatory ? '<p><strong>Attendance is : <strong> Optional </p>' : '' }
  ${arg.event.extendedProps.studentCalendarPresenter?'<p><strong>Presenter: <strong>' + arg.event.extendedProps.studentCalendarPresenter + '</p>' : ''}
  ${arg.event.extendedProps.studentCalendarUniform?'<p><strong>Uniform: <strong>' + arg.event.extendedProps.studentCalendarUniform + '</p>' : ''}
  ${arg.event.extendedProps.studentCalendarNotes?'<p><strong>Notes: <strong>' + arg.event.extendedProps.studentCalendarNotes + '</p>' : ''}
   `;
 var tooltip : any = tippy(arg.el, {     
    content,
    allowHTML: true,
  });
  if (arg.event.extendedProps.eventLookup && arg.event.extendedProps.coordinatorEmail) {  
  try {
    const response = await agent.Activities.getRoomNames(
      arg.event.extendedProps.eventLookup, arg.event.extendedProps.coordinatorEmail);
      if(response){
        tooltip.setContent('');
        content = content + '<p><strong>Room(s): <strong>' + response + '</p>';
        tooltip.setContent(content);
      }
    
  }
  catch (error) {
    console.log(error);
  }
}
}

const getTime = (clickInfo: EventClickArg) => {
  let time : string = ''
  if(!clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') !== format(clickInfo.event.end!, 'MMMM d, yyyy')){
    time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy h:mm aa')} - ${format(clickInfo.event.end!, 'MMMM d, yyyy h:mm aa')}`
  }
  if(!clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') === format(clickInfo.event.end!, 'MMMM d, yyyy')){
    time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy h:mm aa')} - ${format(clickInfo.event.end!, 'h:mm aa')}`
  }
  if(clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') === format(clickInfo.event.end!, 'MMMM d, yyyy')){
    time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy')} `
  }
  if(clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') !== format(clickInfo.event.end!, 'MMMM d, yyyy')){
    time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy')} - ${format(clickInfo.event.end!, 'MMMM d, yyyy')}`
  }
  return time;
}

const handleEventClick = useCallback((clickInfo: EventClickArg) => {
  setOpenModal(true);

  const evt = {
    title: clickInfo.event.title,
    time: getTime(clickInfo),
    location: clickInfo.event.extendedProps.primaryLocation,
    description: clickInfo.event.extendedProps.description,
    leadOrg: clickInfo.event.extendedProps.leadOrg,
    actionOfficer: clickInfo.event.extendedProps.actionOfficer,
    actionOfficerPhone: clickInfo.event.extendedProps.actionOfficerPhone,
    mandatory: clickInfo.event.extendedProps.studentCalendarMandatory,
    presenter: clickInfo.event.extendedProps.studentCalendarPresenter,
    uniform: clickInfo.event.extendedProps.studentCalendarUniform,
    notes: clickInfo.event.extendedProps.studentCalendarNotes,
  };

  if (clickInfo.event.extendedProps.eventLookup && clickInfo.event.extendedProps.coordinatorEmail) { 
    setLoadingEvent(true);
    agent.Activities.getRoomNames(
      clickInfo.event.extendedProps.eventLookup, 
      clickInfo.event.extendedProps.coordinatorEmail
    ).then(response => {
      evt.location = response;
      if(!evt.location) evt.location = clickInfo.event.extendedProps.primaryLocation;
      setEventInfo(evt);
      setLoadingEvent(false);
    }).catch(error => {
      console.error("An error occurred: ", error);
      setLoadingEvent(false);
      setEventInfo(evt);
    });

  }else{
    setEventInfo(evt);
  }

}, []);


const eventDidMount = (info : any) => {
    const eventColor = info.event.backgroundColor;
    const eventDot = info.el.querySelector('.fc-daygrid-event-dot');
    const recurring = info.event.extendedProps.recurring;
  
    if (eventDot) {
      eventDot.style.borderColor = eventColor;
    }
    if (recurring) {
      const eventContent = info.el.querySelector('.fc-event-title');
      if (eventContent) {
        const icon = document.createElement('i');
        icon.className = 'redo alternate icon'; // The Semantic UI class for the repeating icon
        eventContent.prepend(icon);
      }
    }
  };


    return(
        <>
         
         <Modal
  open={openModal}
  onClose={() => setOpenModal(false)}
  closeIcon
>
 {!loadingEvent &&  <Modal.Header>{eventInfo.title}</Modal.Header> }
 {loadingEvent &&  <Modal.Header>
  <Loader size='small' active inline>Loading ...</Loader>
 </Modal.Header> }
  <Modal.Content>
    <Modal.Description>
      <Header>{eventInfo.time}</Header>  
       <p><strong>{eventInfo.location}</strong></p>
      <p><strong>Description: </strong>{eventInfo.description}</p>
      {eventInfo.leadOrg && <p><strong>Lead Org: </strong>{eventInfo.leadOrg}</p>}
      {eventInfo.actionOfficer && <p><strong>Action Officer: </strong>{eventInfo.actionOfficer}</p>}
      {eventInfo.actionOfficerPhone && <p><strong>Action Officer Phone: </strong>{eventInfo.actionOfficerPhone}</p>}
      {eventInfo.mandatory && <p><strong>Attendance is mandatory </strong></p>}
      {eventInfo.presenter && <p><strong>Presenter: </strong>{eventInfo.presenter}</p>}
      {eventInfo.uniform && <p><strong>Uniform: </strong>{eventInfo.uniform}</p>}
      {eventInfo.notes && <p><strong>Notes: </strong>{eventInfo.notes}</p>}

    </Modal.Description>
  </Modal.Content>
</Modal>

         {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
         )}

           <FullCalendar
           ref={calendarRef}
            height= {height}
            initialView={view}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "datepicker,dayGridMonth,timeGridWeek,timeGridDay",
            }}
              customButtons={{
                datepicker: {
                text: "go to date",
                },
              }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/studentCalendar`}
            eventClick={handleEventClick}
            eventMouseEnter={handleMouseEnter }
            eventDidMount={eventDidMount}
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'} 
            loading={(isLoading) => setIsLoading(isLoading)}    
            datesSet={(arg) => {
              // Save the user's view selection
              localStorage.setItem("calendarViewSC", arg.view.type);
              setView(arg.view.type);
            }}
          />
        </>
    )
}