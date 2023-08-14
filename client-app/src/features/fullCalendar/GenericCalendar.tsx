import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction";
import { useHistory, useParams } from "react-router-dom";
import GenericCalendarHeader from "./GenericCalendarHeader";
import {useState, useEffect, useCallback, useRef} from 'react';
import { format } from 'date-fns';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import agent from "../../app/api/agent";
import { v4 as uuid } from "uuid";
import GenericCalendarTable from "./GenericCalendarTable";
import Pikaday from "pikaday";
import { Loader } from "semantic-ui-react";
import CIOEventPlanningTable from "./CIOEventPlanningTable";

export default observer(function GenericCalendar() {
  const [view, setView] = useState(localStorage.getItem("calendarViewGeneric") || "dayGridMonth");
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const { categoryStore, activityStore, userStore } = useStore();
  const { categories, loadingInitial } = categoryStore;
  const {addCalendarEventParameters} = activityStore;
  const history = useHistory();
  const [height, setHeight] = useState(window.innerHeight - 100);

  const [cioEventPlanningAdmin, setCIOEventPlanningAdmin] = useState(false);
  const {user} = userStore
  useEffect(() => {
    setCIOEventPlanningAdmin((user && user.roles && user.roles.includes("CIOEventPlanningAdmin")) || false);
}, [user]);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight - 200);
    };
  
    window.addEventListener("resize", handleResize);
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


     const calendarRef = useRef<FullCalendar>(null);


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

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const category = categories.find(x => x.routeName === id);
    history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${category?.id}`);
  }, [ categories, history]);

  const handleDateClick = useCallback((info : any) => {
    const category = categories.find(x => x.routeName === id);
    const paramId = uuid();
    
    const currentDate = info.date;
    let formattedDate = "";
    let adjustedDate = "";
    
    if (info.allDay) {
      currentDate.setHours(new Date().getHours() + 1);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      adjustedDate = currentDate.toISOString();
      formattedDate = adjustedDate;
    } else {
      adjustedDate = info.date.toISOString();
      formattedDate = info.dateStr;
    }

    addCalendarEventParameters({id: paramId, allDay: false, dateStr: formattedDate, date:new Date(adjustedDate), categoryId: category?.id || '', needRoom: false})
    history.push(`${process.env.PUBLIC_URL}/createActivityWithCalendar/${paramId}`);
  }, [ categories, history]);

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

  const  handleMouseEnter = async (arg : any) =>{
    var content = `<p> ${ getTime(arg)}</p>              
    <p> <strong>Title: </strong> ${arg.event.title} </p>
    ${arg.event.extendedProps.description ?'<p><strong>Description: <strong>' + arg.event.extendedProps.description + '</p>' : '' }
    ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: <strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
    ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: <strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
    ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
    ${arg.event.extendedProps.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
    ${id === "cio" && arg.event.extendedProps.eventPlanningPAX?'<p><strong>PAX: <strong>' + arg.event.extendedProps.eventPlanningPAX + '</p>' : ''}
    ${id === "cio" && arg.event.extendedProps.eventPlanningStatus?'<p><strong>Status: <strong>' + arg.event.extendedProps.eventPlanningStatus + '</p>' : ''}
    ${id === "cio" && arg.event.extendedProps.eventClearanceLevel?'<p><strong>Event Clearance Level: <strong>' + arg.event.extendedProps.eventClearanceLevel + '</p>' : '<p><strong>Event Clearance Level: <strong> Undetermined </p>'}
    ${id === "studentCalendar" && arg.event.extendedProps.studentCalendarMandatory ? '<p><strong>Attendance is : <strong> Mandatory </p>' : '' }
    ${id === "studentCalendar" && !arg.event.extendedProps.studentCalendarMandatory ? '<p><strong>Attendance is : <strong> Optional </p>' : '' }
    ${id === "studentCalendar" && arg.event.extendedProps.studentCalendarPresenter?'<p><strong>Presenter: <strong>' + arg.event.extendedProps.studentCalendarPresenter + '</p>' : ''}
    ${id === "studentCalendar" && arg.event.extendedProps.studentCalendarUniform
    ? '<p><strong>Uniform: <strong>' 
        + (arg.event.extendedProps.studentCalendarUniform.length > 100 
            ? arg.event.extendedProps.studentCalendarUniform.slice(0, 100) + '...' 
            : arg.event.extendedProps.studentCalendarUniform) 
        + '</p>' 
    : ''
}
${id === "studentCalendar" && arg.event.extendedProps.studentCalendarNotes
    ? '<p><strong>Notes: <strong>' 
        + (arg.event.extendedProps.studentCalendarNotes.length > 100 
            ? arg.event.extendedProps.studentCalendarNotes.slice(0, 100) + '...' 
            : arg.event.extendedProps.studentCalendarNotes) 
        + '</p>' 
    : ''
}
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


  useEffect(() => {
   if(!categories.length) categoryStore.loadCategories();
  }, [categories.length])

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

  return (
    <>
      {loadingInitial
        && <LoadingComponent content='Loading Calendar' />
      }
      {!loadingInitial &&
        <div>
             {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}
          <GenericCalendarHeader id={id} />
          {(id !== 'cio' || cioEventPlanningAdmin) &&
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
            events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/${id}`}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventMouseEnter={handleMouseEnter} 
            eventDidMount={eventDidMount}
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'} 
            loading={(isLoading) => setIsLoading(isLoading)}    
            datesSet={(arg) => {
              // Save the user's view selection
              localStorage.setItem("calendarViewGeneric", arg.view.type);
              setView(arg.view.type);
            }}
          />
      }
           {id !== 'cio' && <GenericCalendarTable id={id} />}
           {id === 'cio' && cioEventPlanningAdmin && <CIOEventPlanningTable  />}
           
        </div>
        
      }
    </>
  )
})
