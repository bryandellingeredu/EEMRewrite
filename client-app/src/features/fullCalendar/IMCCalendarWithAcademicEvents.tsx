import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import "@fullcalendar/daygrid/main.css";
import { Divider, Header, Icon, Popup } from "semantic-ui-react";
import { useCallback, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import agent from "../../app/api/agent";

export default observer( function IMCCalendarWithAcademicEvents(){
    const {activityStore, categoryStore} = useStore();
    const { categories } = categoryStore;
    const {getIMCalendarEvents} = activityStore;
    const history = useHistory();

    const getEvents = (info : any, successCallback: any) =>{
      getIMCalendarEvents(info.startStr, info.endStr).then((events) =>{
      successCallback(events)
      })
     }

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


  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${clickInfo.event.extendedProps.categoryId}`);
  }, [ history]);

    useEffect(() => {
      if(!categories.length) categoryStore.loadCategories();
     }, [categories.length, categoryStore])


     return(
      <>

        <FullCalendar
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        plugins={[dayGridPlugin, timeGridPlugin]}
        events={(info, successCallback) => getEvents(info, successCallback)}
        eventClick={handleEventClick}
        eventMouseEnter={handleMouseEnter}  
      />
      </>
    )
})