
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import agent from "../../app/api/agent";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { useCallback} from "react";
import { useHistory} from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useStore } from "../../app/stores/store";

export default function IMCCalendarWithoutAcademicEvents() {
  const history = useHistory();
  const { activityStore } = useStore();
  const {addCalendarEventParameters} = activityStore;
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${clickInfo.event.extendedProps.categoryId}`);
  }, [ history]);

  const handleDateClick = useCallback((info : any) => {
    const paramId = uuid();
    addCalendarEventParameters({id: paramId, allDay: info.allDay, dateStr: info.dateStr, date:info.date, categoryId: '', needRoom: false})
    history.push(`${process.env.PUBLIC_URL}/createActivityWithCalendar/${paramId}`);
  }, [ history]);

  const  handleMouseEnter = async (arg : any) =>{
    var content = `<p> 
    ${ 
      arg.event.allDay ?
      format(arg.event.start, 'MM/dd') :
      format(arg.event.start, 'h:mm aa')} - ${format(arg.event.end, 'h:mm aa')
    }</p>              
    <p> <strong>Title: </strong> ${arg.event.title} </p>
    ${arg.event.extendedProps.description ?'<p><strong>Description: <strong>' + arg.event.extendedProps.description + '</p>' : '' }
    ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: <strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
    ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: <strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
    ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
    ${arg.event.extendedProps.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
    ${arg.event.extendedProps.categoryName ?'<p><strong>Sub Calendar: <strong>' + arg.event.extendedProps.categoryName + '</p>' : ''}
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

  return (
    <>
    
          <FullCalendar
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            events={`${process.env.REACT_APP_API_URL}/activities/getIMCEventsByDate`} 
            eventMouseEnter={handleMouseEnter}  
            eventClick={handleEventClick}  
            dateClick={handleDateClick}
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'}
          />
    </>
  )
}
