
import FullCalendar, {EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import agent from "../../app/api/agent";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { useCallback, useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useStore } from "../../app/stores/store";
import Pikaday from "pikaday";
import { EventApi } from '@fullcalendar/react';
import { Loader } from "semantic-ui-react";
import BackToCalendarStore from "../../app/stores/backToCalendarStore";
import { BackToCalendarInfo } from "../../app/models/backToCalendarInfo";

interface Props{
  backToCalendarId: string | undefined
}

export default function IMCCalendarWithoutAcademicEvents({backToCalendarId} : Props) {
  const [view, setView] = useState(localStorage.getItem("calendarViewIMC") || "timeGridWeek");
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const { activityStore, backToCalendarStore } = useStore();
  const { addCalendarEventParameters } = activityStore;
  const {addBackToCalendarInfoRecord, getBackToCalendarInfoRecord} = backToCalendarStore;
  const [isInitialDateSet, setIsInitialDateSet] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const backToCalendarInfo : BackToCalendarInfo = {
        id: uuid(),
        goToDate: clickInfo.event.start || new Date(),
        url: `${process.env.PUBLIC_URL}/imccalendar`
      };
      addBackToCalendarInfoRecord(backToCalendarInfo);
      history.push(
        `${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${clickInfo.event.extendedProps.categoryId}/${backToCalendarInfo.id}`
      );
    },
    [history]
  );
  const [height, setHeight] = useState(window.innerHeight - 200);

  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    let backToCalendarRecord: BackToCalendarInfo | undefined = undefined;
    if (backToCalendarId && !isInitialDateSet) {
      backToCalendarRecord = getBackToCalendarInfoRecord(backToCalendarId);
      if (backToCalendarRecord) {
        console.log("About to set initial date to:", new Date(backToCalendarRecord.goToDate));
        setInitialDate(backToCalendarRecord.goToDate);
        const calendarApi = calendarRef.current?.getApi();
        if(calendarApi){
          calendarApi.gotoDate(backToCalendarRecord.goToDate);
        }
        setIsInitialDateSet(true);
      }
    }
  }, [backToCalendarId, isInitialDateSet, calendarRef]);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight - 100);
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

  const handleDateClick = useCallback(
    (info: any) => {
      const backToCalendarInfo : BackToCalendarInfo = {
        id: uuid(),
        goToDate: info.date,
        url: `${process.env.PUBLIC_URL}/imccalendar`
      };
      addBackToCalendarInfoRecord(backToCalendarInfo);

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
      
      addCalendarEventParameters({
        id: paramId,
        allDay: false,
        dateStr: formattedDate,
        date: new Date(adjustedDate),
        categoryId: "",
        needRoom: false,
      });
      history.push(
        `${process.env.PUBLIC_URL}/createActivityWithCalendar/${paramId}/${backToCalendarInfo.id}`
      );
    },
    [addCalendarEventParameters, history]
  );

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
    ${arg.event.extendedProps.description ? '<p><strong>Description: </strong>' + arg.event.extendedProps.description + '</p>' : '' }
    ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: </strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
    ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: </strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
    ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: </strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
    ${arg.event.extendedProps.actionOfficerPhone ? '<p><strong>Action Officer Phone: </strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
    ${arg.event.extendedProps.categoryName ? '<p><strong>Sub Calendar: </strong>' + (arg.event.extendedProps.categoryName === 'Academic IMC Event' ? 'Faculty Calendar' : arg.event.extendedProps.categoryName === 'Military Family and Spouse Program' ? 'Military Spouse and Family Program' : arg.event.extendedProps.categoryName === 'SSL Calendar' ? 'SSL Admin Calendar' : arg.event.extendedProps.categoryName) + '</p>' : ''}
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
          content = content + '<p><strong>Room(s): <strong>' + response + '</p>';
          tooltip.setContent(content);
        }
      
    }
    catch (error) {
      console.log(error);
    }
  }
}

function addIconToEvent(event: EventApi, el: HTMLElement) {
  const iconName = 'repeat';

  // Create an element for the icon
  const iconElement = `<i class="icon ${iconName} event-icon"></i>`;

  // Find the event content element and insert the icon in it
  const contentElement = el.querySelector('.fc-event-main-frame');
  if (contentElement) {
    (contentElement as HTMLElement).style.position = 'relative';
    contentElement.insertAdjacentHTML('beforeend', iconElement);
  }
}

function addTeamIconToEvent(event: EventApi, el: HTMLElement) {
  const iconName = 'tv';

  // Create an element for the icon
  const iconElement = `<i class="icon ${iconName} event-icon"></i>`;

  // Find the event content element and insert the icon in it
  const contentElement = el.querySelector('.fc-event-main-frame');
  if (contentElement) {
    (contentElement as HTMLElement).style.position = 'relative';
    contentElement.insertAdjacentHTML('beforeend', iconElement);
  }
}


  return (
    <>
       {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}
   <FullCalendar
    initialDate={initialDate || new Date()}
      ref={calendarRef}
      height={height}
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
      events={`${process.env.REACT_APP_API_URL}/activities/getIMCEventsByDate`}
      eventMouseEnter={handleMouseEnter}
      eventClick={handleEventClick}
      dateClick={handleDateClick}
      slotMinTime={"07:00:00"}
      slotMaxTime={"21:00:00"}
      loading={(isLoading) => setIsLoading(isLoading)}
      eventDidMount={({ event, el }) => {
        if (event.extendedProps.recurring) {
          addIconToEvent(event, el);
        }
        if (event.extendedProps.teamInd){
          addTeamIconToEvent(event, el);
        }
      }}
      datesSet={(arg) => {
        // Save the user's view selection
        localStorage.setItem("calendarViewIMC", arg.view.type);
        setView(arg.view.type);
      }}
    
    />
    </>
  )
}
