import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useEffect, Fragment } from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import { useHistory } from "react-router-dom";
import {useCallback} from "react";
import { Divider, Header, Icon } from "semantic-ui-react";

export default observer(function ASEPCalendar(){
    const {activityStore, categoryStore} = useStore();
    const{loadingInitial, asepEvents, activities} = activityStore 
    const {categories} = categoryStore;
    const history = useHistory();
    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
      const activity = activities.find(x => x.id === clickInfo.event.id);
      const category = categories.find(x => x.id === activity?.categoryId);
      history.push(`/activities/${clickInfo.event.id}/${category?.id}`);
    }, [activities, categories, history]);

    useEffect(() => {
        if(!asepEvents.length) activityStore.loadActivites()
        }, [activityStore])

        return(
            <>
                {loadingInitial
                   &&<LoadingComponent content = 'Loading ASEP Calendar'/>
                }
                {!loadingInitial && 
                      <div>
                        <Divider horizontal>
      <Header as='h2'>
        <Icon name='adn' />
        ASEP Calendar
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
                       events={asepEvents}
                       eventClick={handleEventClick}
                     />
                   </div> 
       }
      </>
      )

})
