import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import {useCallback} from "react";
import { useHistory  } from "react-router-dom";
import "@fullcalendar/daygrid/main.css";
import { Divider, Header, Icon } from "semantic-ui-react";

export default observer( function AcademicCalendar(){
    const {activityStore, categoryStore} = useStore();
    const {academicEvents, activities} = activityStore;
    const {categories} = categoryStore;
    const history = useHistory();
    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
      const activity = activities.find(x => x.id === clickInfo.event.id);
      const category = categories.find(x => x.id === activity?.categoryId);
      history.push(`/activities/${clickInfo.event.id}/${category?.id}`);
    }, []);

     return(
      <>
    <Divider horizontal>
      <Header as='h2'>
        <Icon name='graduation cap' />
        Academic Calendar
      </Header>
    </Divider>
        <FullCalendar
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        plugins={[dayGridPlugin, timeGridPlugin]}
        events={academicEvents}
        eventClick={handleEventClick}
      />
      </>
    )
})