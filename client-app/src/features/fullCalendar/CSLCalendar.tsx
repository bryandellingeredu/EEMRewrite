import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useEffect } from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"

export default observer(function CSLCalendar(){
    const {activityStore} = useStore();
    const{loadingInitial, cslEvents} = activityStore 

    useEffect(() => {
        if(!cslEvents.length) activityStore.loadActivites()
        }, [activityStore])

        return(
            <>
                {loadingInitial
                   &&<LoadingComponent content = 'Loading CSL Calendar'/>
                }
                {!loadingInitial &&          
                       <FullCalendar
                       initialView="dayGridMonth"
                       headerToolbar={{
                         left: "prev,next",
                         center: "title",
                         right: "dayGridMonth,timeGridWeek,timeGridDay"
                       }}
                       plugins={[dayGridPlugin, timeGridPlugin]}
                       events={cslEvents}
                     />
       }
      </>
      )

})
