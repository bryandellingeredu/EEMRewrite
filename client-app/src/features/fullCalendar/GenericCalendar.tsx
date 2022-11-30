import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import { useHistory, useParams } from "react-router-dom";
import { useCallback, useEffect} from "react";
import GenericCalendarHeader from "./GenericCalendarHeader";

export default observer(function GenericCalendar() {
  const { id } = useParams<{ id: string }>();
  const { categoryStore } = useStore();
  const { categories, loadingInitial } = categoryStore;
  const history = useHistory();

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const category = categories.find(x => x.routeName === id);
    history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${category?.id}`);
  }, [ categories, history]);

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
          />
        </div>
      }
    </>
  )
})
