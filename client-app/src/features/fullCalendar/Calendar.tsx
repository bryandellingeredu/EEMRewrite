import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import {useCallback} from "react";
import { useHistory  } from "react-router-dom";
import "@fullcalendar/daygrid/main.css";

export default observer( function Calendar(){
    const {activityStore} = useStore();
    const {events} = activityStore;
    const history = useHistory();
    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
      history.push(`/activities/${clickInfo.event.id}`);
    }, []);

     return(
        <FullCalendar
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        plugins={[dayGridPlugin, timeGridPlugin]}
        events={events}
        eventClick={handleEventClick}
      />
    )
})