import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import "@fullcalendar/daygrid/main.css";
import { Divider, Header, Icon } from "semantic-ui-react";
import { useCallback, useEffect } from 'react';
import { useHistory } from "react-router-dom";

export default observer( function AcademicCalendar(){
    const {activityStore, categoryStore} = useStore();
    const { categories } = categoryStore;
    const {getAcademicCalendarEvents} = activityStore;
    const history = useHistory();

    const getEvents = (info : any, successCallback: any) =>{
     getAcademicCalendarEvents(info.startStr, info.endStr).then((events) =>{
      successCallback(events)
      })
     }

     const handleEventClick = useCallback((clickInfo: EventClickArg) => {
      const category = categories.find(x => x.name === 'Academic Calendar');
      history.push(`/activities/${clickInfo.event.id}/${category?.id}`);
    }, [ categories, history]);

    useEffect(() => {
      if(!categories.length) categoryStore.loadCategories();
     }, [categories.length, categoryStore])

     return(
      <>
    <Divider horizontal>
      <Header as='h2'>
        <Icon name='graduation cap' />
        Academic Calendar
      </Header>
    </Divider>
        <FullCalendar
         displayEventEnd
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        plugins={[dayGridPlugin, timeGridPlugin]}
        events={(info, successCallback) => getEvents(info, successCallback)}
        eventClick={handleEventClick}
      />
      </>
    )
})