import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import "@fullcalendar/daygrid/main.css";
import { Divider, Header, Icon } from "semantic-ui-react";
import { useState } from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer( function AcademicCalendar(){
    const {activityStore} = useStore();
    const {getAcademicCalendarEvents} = activityStore;
    const [loading, setLoading] = useState<boolean>(false);

    const getEvents = (info : any, successCallback: any) =>{
     getAcademicCalendarEvents(info.startStr, info.endStr).then((events) =>{
      successCallback(events)
      })
     }


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
      />
      </>
    )
})