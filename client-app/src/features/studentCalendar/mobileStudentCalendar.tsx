import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import { useState,  useRef } from "react";
import { EventClickArg } from "@fullcalendar/core";
import { Divider, Header, Icon, Loader } from "semantic-ui-react";
import { DatesSetArg } from '@fullcalendar/common';
import { format } from 'date-fns';
import agent from "../../app/api/agent";
import StudentCalendarEventDetails from "./studentCalendarEventDetails";

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

export default function MobileStudentCalendar (){
    const [isLoading, setIsLoading] = useState(true);
    const calendarRef = useRef<FullCalendar>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [view, setView] = useState(localStorage.getItem("calendarViewSCM") || "listWeek");
    const [title, setTitle] = useState("");
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

    const eventDidMount = (info : any) => {
        const eventColor = info.event.backgroundColor;
        const eventDot = info.el.querySelector('.fc-list-event-dot');
    
        if (eventDot) {
            eventDot.style.borderColor = eventColor;
        }
    };

    const handleButtonClick = () => {
        setShowDetails(false);
      };

      const handleDatesSet = (arg: DatesSetArg) => {
        localStorage.setItem("calendarViewSCM", arg.view.type);
        setView(arg.view.type);
        setTitle(arg.view.title); 
        handleButtonClick();
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

      const handleEventClick = (clickInfo: EventClickArg) => {
        setShowDetails(false);

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
              setShowDetails(true);
            }).catch(error => {
              console.error("An error occurred: ", error);
              setLoadingEvent(false);
              setEventInfo(evt);
              setShowDetails(true);
            });
        
          }else{
            setEventInfo(evt);
            setShowDetails(true);
          }


      }

    return (
        <>
        {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}
<Header as='h2' textAlign='center'>{title}</Header>
<FullCalendar
         height={"60.00vh"}
      loading={(isLoading) => setIsLoading(isLoading)}
      ref={calendarRef}
      plugins={[listPlugin]}
      events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/studentCalendar`}
        datesSet={handleDatesSet}
      eventClick={handleEventClick}
      initialView={view}
      headerToolbar={{
        left: "prev,next",
        center: "",
        right: "customMonth,customWeek,customDay"
      }}
customButtons={{
  customMonth: {
    text: "Month",
    click: () => {
      handleButtonClick();
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView('listMonth');
      }
    }
  },
  customWeek: {
    text: "Week",
    click: () => {
      handleButtonClick();
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView('listWeek');
      }
    }
  },
  customDay: {
    text: "Day",
    click: () => {
      handleButtonClick();
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView('listDay');
      }
    }
  },
}}
      views={{
        customMonth: {
          type: "listMonth",
          title: "Month",
          buttonText: "Month"
        },
        customWeek: {
          type: "listWeek",
          title: "Week",
          buttonText: "Week"
        },
        customDay: {
          type: "listDay",
          title: "Day",
          buttonText: "Day"
        }
      }}
      slotMinTime={"07:00:00"}
      slotMaxTime={"21:00:00"}
      eventDisplay={'block'}
      eventDidMount={eventDidMount}
    />
{loadingEvent &&  <Loader size='small' active inline>Loading ...</Loader> }

{showDetails && !loadingEvent && <StudentCalendarEventDetails eventInfo={eventInfo} /> }
         </>
    )

}