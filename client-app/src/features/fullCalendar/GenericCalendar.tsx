import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useEffect, Fragment } from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import { useHistory, useParams } from "react-router-dom";
import { useCallback, useState } from "react";
import { CalendarEvent } from "../../app/models/calendarEvent";
import GenericCalendarHeader from "./GenericCalendarHeader";

export default observer(function GenericCalendar() {
  const { id } = useParams<{ id: string }>();
  const { activityStore, categoryStore } = useStore();
  const { loadingInitial, cslEvents, asepEvents, chapelEvents, activities } = activityStore
  const { categories } = categoryStore;
  const history = useHistory();
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '', categoryId: '', allDay: false, start: new Date(), end: new Date(), title: '' }
  ]);
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const activity = activities.find(x => x.id === clickInfo.event.id);
    const category = categories.find(x => x.id === activity?.categoryId);
    history.push(`/activities/${clickInfo.event.id}/${category?.id}`);
  }, [activities, categories, history]);

  useEffect(() => {
    if (id === 'csl' && cslEvents.length) setEvents(cslEvents);
    if (id === 'asep' && asepEvents.length) setEvents(asepEvents);
    if (id === 'chapel' && chapelEvents.length) setEvents(chapelEvents);
    if (id === 'csl' && !cslEvents.length) activityStore.loadActivites().then(() => setEvents(cslEvents));
    if (id === 'asep' && !asepEvents.length) activityStore.loadActivites().then(() => setEvents(asepEvents));
    if (id === 'chapel' && !chapelEvents.length) activityStore.loadActivites().then(() => setEvents(chapelEvents));
  }, []);

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
            events={events}
            eventClick={handleEventClick}
          />
        </div>
      }
    </>
  )
})
