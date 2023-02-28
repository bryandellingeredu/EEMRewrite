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
      history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${category?.id}`);
    }, [ categories, history]);

    useEffect(() => {
      if(!categories.length) categoryStore.loadCategories();
     }, [categories.length, categoryStore])

     function renderEventContent(info: any) {
      try {
        if (info.view.type === "dayGridMonth" && !info.event.allDay) {
          return (
            <Popup
              content={info.event.title}
              header={
                info.event.allDay
                  ? `${format(info.event.start, "MM/dd")}`
                  : `${format(info.event.start, "h:mm aa")} - ${format(
                      info.event.end,
                      "h:mm aa"
                    )}`
              }
              trigger={
                <Header
                  size="tiny"
                  color={info.event.allDay ? "yellow" : "blue"}
                  content={`${info.timeText} ${info.event.title}`}
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                  }}
                />
              }
            />
          );
        }
      } catch (error) {
        console.log(error);
      }
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
        eventClick={handleEventClick}
        eventContent={renderEventContent} 
      />
      </>
    )
})