import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import { useHistory, useParams } from "react-router-dom";
import { useCallback, useEffect} from "react";
import GenericCalendarHeader from "./GenericCalendarHeader";
import { format } from 'date-fns';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import agent from "../../app/api/agent";

export default observer(function GenericCalendar() {
  const { id } = useParams<{ id: string }>();
  const { categoryStore } = useStore();
  const { categories, loadingInitial } = categoryStore;
  const history = useHistory();

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const category = categories.find(x => x.routeName === id);
    history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${category?.id}`);
  }, [ categories, history]);

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

  return (
    <>
      {loadingInitial
        && <LoadingComponent content='Loading Calendar' />
      }
      {!loadingInitial &&
        <div>
          <GenericCalendarHeader id={id} />
          <FullCalendar
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            plugins={[dayGridPlugin, timeGridPlugin]}
            events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/${id}`}
            eventClick={handleEventClick}
            eventMouseEnter={handleMouseEnter} 
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'}     
          />
        </div>
      }
    </>
  )
})
