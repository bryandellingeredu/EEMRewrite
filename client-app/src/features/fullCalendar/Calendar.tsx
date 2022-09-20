import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import {useCallback} from "react";
import { useHistory  } from "react-router-dom";
import "@fullcalendar/daygrid/main.css";

export default observer( function Calendar(){
    const {activityStore, categoryStore} = useStore();
    const {events, activities} = activityStore;
    const {categories} = categoryStore;
    const history = useHistory();
    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
      const activity = activities.find(x => x.id === clickInfo.event.id);
      const category = categories.find(x => x.id === activity?.categoryId);
      history.push(`/activities/${clickInfo.event.id}/${category?.id}`);
    }, [activities, categories, history]);

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