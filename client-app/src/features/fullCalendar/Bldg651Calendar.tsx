import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Header, Loader } from "semantic-ui-react";
import { useCallback, useEffect, useState, useRef } from "react";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { v4 as uuid } from "uuid";
import Pikaday from "pikaday";
import { useStore } from "../../app/stores/store";
import BackToCalendarStore from "../../app/stores/backToCalendarStore";
import { BackToCalendarInfo } from "../../app/models/backToCalendarInfo";


export default function Bldg651Calendar (){
  const [view, setView] = useState(localStorage.getItem("calendarView651") || "timeGridWeek");
    const { id, backToCalendarId } = useParams<{id: string, backToCalendarId?: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    const [height, setHeight] = useState(window.innerHeight - 100);
    const {activityStore, backToCalendarStore} = useStore();
    const{ getActivityIdByRoom , addCalendarEventParameters} = activityStore;
    const {addBackToCalendarInfoRecord, getBackToCalendarInfoRecord} = backToCalendarStore;
    const [isInitialDateSet, setIsInitialDateSet] = useState(false);
    const [initialDate, setInitialDate] = useState<Date | null>(null);

    useEffect(() => {
        const handleResize = () => {
          setHeight(window.innerHeight - 100);
        };
      
        window.addEventListener("resize", handleResize);
      
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);

      const calendarRef = useRef<FullCalendar>(null);

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
      }, [calendarRef])

      useEffect(() => {
        let backToCalendarRecord: BackToCalendarInfo | undefined = undefined;
        if (backToCalendarId && !isInitialDateSet) {
          backToCalendarRecord = getBackToCalendarInfoRecord(backToCalendarId);
          if (backToCalendarRecord) {
            console.log("About to set initial date to:", new Date(backToCalendarRecord.goToDate));
            setInitialDate(backToCalendarRecord.goToDate);
            const calendarApi = calendarRef.current?.getApi();
            if(calendarApi){
              calendarApi.gotoDate(backToCalendarRecord.goToDate);
            }
            setIsInitialDateSet(true);
          }
        }
      }, [backToCalendarId, isInitialDateSet, calendarRef]);

      const getTime = (clickInfo: EventClickArg) => {
        let time : string = ''
        if(!clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') !== format(clickInfo.event.end!, 'MMMM d, yyyy')){
          time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy h:mm aa')} - ${format(clickInfo.event.end!, 'MMMM d, yyyy h:mm aa')}`
        }
        if(!clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') === format(clickInfo.event.end!, 'MMMM d, yyyy')){
          time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy h:mm aa')} - ${format(clickInfo.event.end!, 'h:mm aa')}`
        }
        if(clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') === format(clickInfo.event.end!, 'MMMM d, yyyy')){
          time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy')} `
        }
        if(clickInfo.event.allDay && format(clickInfo.event.start!, 'MMMM d, yyyy') !== format(clickInfo.event.end!, 'MMMM d, yyyy')){
          time =   `${format(clickInfo.event.start!, 'MMMM d, yyyy')} - ${format(clickInfo.event.end!, 'MMMM d, yyyy')}`
        }
        return time;
      }

      const handleMouseEnter = async (arg : any) =>{
        let content =  `<p><strong>${ getTime(arg)} 
       </strong></p>             
        <p> <span>${arg.event.title}</span></p>
        ${arg.event.backgroundColor === 'Green' ? '(Reservation Approved)' : '(Reservation Pending)'}`;
  
       var tooltip : any = tippy(arg.el, {     
        content,
        allowHTML: true,
      });
  
        try {
          var sanitizedTitle = arg.event.title.split('(Bldg')[0].replace(/\//g, '');
          const activity =  await getActivityIdByRoom( sanitizedTitle, arg.event.startStr, arg.event.endStr, arg.event.extendedProps.roomId)
          if(activity && activity.id !== '00000000-0000-0000-0000-000000000000' ){
            const activityContent  = ` <p></p>
            ${activity.description ?'<p><strong>Description: <strong>' + activity.description + '</p>' : '' }
            ${activity.category  ? '<p><strong>Sub Calendar: </strong>' + (activity.category.name === 'Academic IMC Event' ? 'Faculty Calendar' : activity.category.name === 'Military Family and Spouse Program' ? 'Military Spouse and Family Program' : activity.category.name === 'SSL Calendar' ? 'SSL Admin Calendar' : activity.category.name) + '</p>' : ''}
            ${activity.organization?.name ? '<p><strong>Lead Org: <strong>' + activity.organization?.name + '</p>' : '' }
            ${activity.actionOfficer ? '<p><strong>Action Officer: <strong>' + activity.actionOfficer + '</p>' : ''}
            ${activity.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + activity.actionOfficerPhone + '</p>' : ''}
             `;
  
            content = content + activityContent
            tooltip.setContent(content);
          }
        }
        catch (error) {
          console.log(error);
        }
    }

    const handleEventClick = useCallback((clickInfo: EventClickArg) => {

      const backToCalendarInfo : BackToCalendarInfo = {
        id: uuid(),
        goToDate: clickInfo.event.start || new Date(),
        url: `${process.env.PUBLIC_URL}/bldg651Calendar/651`
      };
      addBackToCalendarInfoRecord(backToCalendarInfo);
      var sanitizedTitle = clickInfo.event.title.split('(Bldg')[0].replace(/\//g, '');
        getActivityIdByRoom( sanitizedTitle, clickInfo.event.startStr, clickInfo.event.endStr, clickInfo.event.extendedProps.roomId).then((activity) => {
          if(!activity || activity.id === '00000000-0000-0000-0000-000000000000' ){
            toast.info(`Event ${clickInfo.event.title} is reserved in outlook only, there is no eem information`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              });
          } else {
            history.push(`${process.env.PUBLIC_URL}/activities/${activity.id}/${activity.categoryId}/${backToCalendarInfo.id}`);
          }
        });
      }, [ history]);

      const eventDidMount = (info : any) => {
        const eventColor = info.event.backgroundColor;
        const eventDot = info.el.querySelector('.fc-daygrid-event-dot');
      
        if (eventDot) {
          eventDot.style.borderColor = eventColor;
        }
      };

      const handleDateClick = useCallback((info : any) => {

        const backToCalendarInfo : BackToCalendarInfo = {
          id: uuid(),
          goToDate: info.start || new Date(),
          url: `${process.env.PUBLIC_URL}/bldg651Calendar/651`
        };
        addBackToCalendarInfoRecord(backToCalendarInfo);
      
        const paramId = uuid();
  
         const currentDate = info.date;
        let formattedDate = "";
        let adjustedDate = "";
        
        if (info.allDay) {
          currentDate.setHours(new Date().getHours() + 1);
          currentDate.setMinutes(0);
          currentDate.setSeconds(0);
          adjustedDate = currentDate.toISOString();
          formattedDate = adjustedDate;
        } else {
          adjustedDate = info.date.toISOString();
          formattedDate = info.dateStr;
        }
        
  
  
        addCalendarEventParameters({id: paramId, allDay: false, dateStr: formattedDate, date:new Date(adjustedDate), categoryId: '', needRoom: true})
        history.push(`${process.env.PUBLIC_URL}/createActivityWithCalendar/${paramId}/${backToCalendarInfo.id}`);
      }, [ history]);

    return(
      <>
      <Divider horizontal>
        <Header as='h2'>

              <FontAwesomeIcon icon={faBuilding} size='2x' style={{marginRight: '10px'}} />
             {id === '651' ? 'Building 651' : 'Root Hall Bldg 122'} 
        </Header>
        </Divider>
        {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}
<FullCalendar
  initialDate={initialDate || new Date()}
ref={calendarRef}
height={height}
initialView={view}
headerToolbar={{
  left: "prev,next",
  center: "title",
  right: "datepicker,dayGridMonth,timeGridWeek,timeGridDay"
}}
customButtons={{
  datepicker: {
  text: "go to date",
},
}}
plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
eventClick={handleEventClick}
dateClick={handleDateClick}
events={`${process.env.REACT_APP_API_URL}/roomEvents/bldg651/${id}`}
eventMouseEnter={handleMouseEnter}
slotMinTime={'07:00:00'}
slotMaxTime={'21:00:00'}
loading={(isLoading) => setIsLoading(isLoading)}
eventDidMount={eventDidMount}
datesSet={(arg) => {
  // Save the user's view selection
  localStorage.setItem("calendarView651", arg.view.type);
  setView(arg.view.type);
}}
//eventContent={renderEventContent}  
/>
</>
    )
}