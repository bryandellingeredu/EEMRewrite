import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useEffect, useState} from 'react';

export default observer( function Calendar(){
    const {activityStore} = useStore();
    const {events} = activityStore;

   //const events = [{ title: "today's event", date: new Date() }];
    return(
        <FullCalendar
        initialView="dayGridMonth"
        plugins={[dayGridPlugin]}
        events={events}
      />
    )
})