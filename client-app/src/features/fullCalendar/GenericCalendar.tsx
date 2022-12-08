import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import { useHistory, useParams } from "react-router-dom";
import { useCallback, useEffect} from "react";
import GenericCalendarHeader from "./GenericCalendarHeader";
import {  Header, Popup } from "semantic-ui-react";
import { format } from 'date-fns';

export default observer(function GenericCalendar() {
  const { id } = useParams<{ id: string }>();
  const { categoryStore } = useStore();
  const { categories, loadingInitial } = categoryStore;
  const history = useHistory();

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const category = categories.find(x => x.routeName === id);
    history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${category?.id}`);
  }, [ categories, history]);

  function renderEventContent(info : any) {
    if(info.view.type === 'dayGridMonth' && !info.event.allDay)
    {
   return (
      <Popup
       content={info.event.title}
       header={info.event.allDay ? `${format(info.event.start, 'MM/dd')}` : 
       `${format(info.event.start, 'h:mm aa')} - ${format(info.event.end, 'h:mm aa')}`}
       trigger={
          <Header size='tiny'
          color={info.event.allDay ? 'yellow': 'blue'}
           content={`${info.timeText} ${info.event.title}`}
          style={{overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer'}}
          />} />
    )
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
            eventContent={renderEventContent}           
          />
        </div>
      }
    </>
  )
})
