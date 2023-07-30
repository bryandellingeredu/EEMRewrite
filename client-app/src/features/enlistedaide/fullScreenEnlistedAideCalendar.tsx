import {useState, useEffect, useCallback, useRef} from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction";
import { useHistory, useParams } from "react-router-dom";
import { format } from 'date-fns';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import agent from "../../app/api/agent";
import { v4 as uuid } from "uuid";
import Pikaday from "pikaday";
import { Divider, Header, Icon, Loader } from "semantic-ui-react";

export default function FullScreenEnlistedAideCalendar (){
    const [view, setView] = useState(localStorage.getItem("calendarViewEnlistedAide") || "dayGridMonth");
    const [height, setHeight] = useState(window.innerHeight - 100);
    const calendarRef = useRef<FullCalendar>(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const handleResize = () => {
          setHeight(window.innerHeight - 200);
        };
        window.addEventListener("resize", handleResize);   
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);

      const handleEventClick = useCallback((clickInfo: EventClickArg) => {
  
        history.push(`${process.env.PUBLIC_URL}/enlistedAideCheckListForm/${clickInfo.event.extendedProps.activityId}/${clickInfo.event.extendedProps.categoryId}`);
      }, [ history]);

      
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // Initialize Pikaday
      const picker = new Pikaday({
        field: document.querySelector(".fc-datepicker-button") as HTMLElement,
        format: "YYYY-MM-DD",
        onSelect: function (dateString) {
          picker.gotoDate(new Date(dateString));
          calendarApi.gotoDate(new Date(dateString));
        },
      });
  
      return () => {
        picker.destroy();
      };
    }
  },[calendarRef]);

  const  handleMouseEnter = async (arg : any) =>{
    var content = `<p> 
    ${ 
      arg.event.allDay ? format(arg.event.start, 'MM/dd')  :
      format(arg.event.start, 'h:mm aa')
    
    }</p>  
    <p> <strong>Task: </strong> ${arg.event.extendedProps.task} </p>            
    <p> <strong>Title: </strong> ${arg.event.extendedProps.eventTitle} </p>
    ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideFundingType ? '<p><strong>Funding Type: <strong>' + arg.event.extendedProps.enlistedAideFundingType + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideVenue? '<p><strong>Venue: <strong>' + arg.event.extendedProps.enlistedAideVenue + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideGuestCount? '<p><strong>Guest Count: <strong>' + arg.event.extendedProps.enlistedAideGuestCount + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideCooking ? '<p><strong>Cooking: <strong>' + arg.event.extendedProps.enlistedAideCooking + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideDietaryRestrictions ? '<p><strong>Dietary Restrictions: <strong>' + arg.event.extendedProps.enlistedAideDietaryRestrictions + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideAlcohol ? '<p><strong>Dietary Alcohol: <strong>' + arg.event.extendedProps.enlistedAideAlcohol + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideNumOfBartenders ? '<p><strong>Num of Bartenders: <strong>' + arg.event.extendedProps.enlistedAideNumOfBartenders + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideNumOfServers ? '<p><strong>Num of Servers: <strong>' + arg.event.extendedProps.enlistedAideNumOfServers + '</p>' : ''}
    ${arg.event.extendedProps.enlistedAideSupportNeeded ? `<p><strong>Other Support Needed:</strong> ${arg.event.extendedProps.enlistedAideSupportNeeded.length > 100 ? arg.event.extendedProps.enlistedAideSupportNeeded.substr(0, 100) + '...' : arg.event.extendedProps.enlistedAideSupportNeeded}</p>` : ''}
     `;
   var tooltip : any = tippy(arg.el, {     
      content,
      allowHTML: true,
    });
}


const eventDidMount = (info : any) => {
    const eventColor = info.event.backgroundColor;
    const eventDot = info.el.querySelector('.fc-daygrid-event-dot');
    const recurring = info.event.extendedProps.recurring;
  
    if (eventDot) {
      eventDot.style.borderColor = eventColor;
    }
    if (recurring) {
      const eventContent = info.el.querySelector('.fc-event-title');
      if (eventContent) {
        const icon = document.createElement('i');
        icon.className = 'redo alternate icon'; // The Semantic UI class for the repeating icon
        eventContent.prepend(icon);
      }
    }
  };


    return(
        <>
          <Divider horizontal>
      <Header as='h2'>
        <Icon name='clipboard' />
        Enlisted Aide Calendar
      </Header>
    </Divider>

         {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
         )}

           <FullCalendar
           ref={calendarRef}
            height= {height}
            initialView={view}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "datepicker,dayGridMonth,timeGridWeek,timeGridDay",
            }}
              customButtons={{
                datepicker: {
                text: "go to date",
                },
              }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            events={`${process.env.REACT_APP_API_URL}/enlistedAide/getEventsByDate`}
            eventClick={handleEventClick}
            eventMouseEnter={handleMouseEnter }
            eventDidMount={eventDidMount}
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'} 
            loading={(isLoading) => setIsLoading(isLoading)}    
            datesSet={(arg) => {
              // Save the user's view selection
              localStorage.setItem("calendarViewEnlistedAide", arg.view.type);
              setView(arg.view.type);
            }}
          />
        </>
    )
}