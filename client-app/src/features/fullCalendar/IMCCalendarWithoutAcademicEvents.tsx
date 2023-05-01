
import FullCalendar, {EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import agent from "../../app/api/agent";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { useCallback, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useStore } from "../../app/stores/store";
import Pikaday from "pikaday";
import { EventApi } from '@fullcalendar/react';

export default function IMCCalendarWithoutAcademicEvents(this: any) {
  const history = useHistory();
  const { activityStore } = useStore();
  const { addCalendarEventParameters } = activityStore;
  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      history.push(
        `${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${clickInfo.event.extendedProps.categoryId}`
      );
    },
    [history]
  );
  const [height, setHeight] = useState(window.innerHeight - 200);

  const calendarRef = useRef<FullCalendar>(null);

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
          debugger;
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
      const paramId = uuid();
      const currentDate = info.date;
      let formattedDate = "";
      let adjustedDate = "";
      
      if (info.allDay) {
        currentDate.setHours(currentDate.getHours() + 1);
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
        `${process.env.PUBLIC_URL}/createActivityWithCalendar/${paramId}`
      );
    },
    [addCalendarEventParameters, history]
  );

  const  handleMouseEnter = async (arg : any) =>{
    var content = `<p> 
    ${ 
      arg.event.allDay ?
      format(arg.event.start, 'MM/dd') :
      format(arg.event.start, 'h:mm aa')} - ${format(arg.event.end, 'h:mm aa')
    }</p>              
    <p> <strong>Title: </strong> ${arg.event.title} </p>
    ${arg.event.extendedProps.description ? '<p><strong>Description: </strong>' + arg.event.extendedProps.description + '</p>' : '' }
    ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: </strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
    ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: </strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
    ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: </strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
    ${arg.event.extendedProps.actionOfficerPhone ? '<p><strong>Action Officer Phone: </strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
    ${arg.event.extendedProps.categoryName ? '<p><strong>Sub Calendar: </strong>' + (arg.event.extendedProps.categoryName === 'Academic IMC Event' ? 'Academic Calendar' : arg.event.extendedProps.categoryName) + '</p>' : ''}
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


  return (
    <>
   
   <FullCalendar
      ref={calendarRef}
      height={height}
      initialView="timeGridWeek"
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
      eventDidMount={({ event, el }) => {
        if (event.extendedProps.recurring) {
          addIconToEvent(event, el);
        }
      }}
    />
    </>
  )
}
