import {useState, useEffect, useCallback, useRef} from 'react';
import { Divider, Header, Icon } from 'semantic-ui-react';
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
import SVTCCalendarTable from './SVTCCalendarTable';

export default function SVTCCalendar(){
    const [height, setHeight] = useState(window.innerHeight - 100);
    const history = useHistory();

    const  handleMouseEnter = async (arg : any) =>{
      var content = `<p> 
      ${ 
        arg.event.allDay ?
        format(arg.event.start, 'MM/dd') :
        format(arg.event.start, 'h:mm aa')} - ${format(arg.event.end, 'h:mm aa')
      }</p>              
      <p> <strong>Title: </strong> ${arg.event.title} </p>
      ${arg.event.extendedProps.description ?'<p><strong>Description: <strong>' + arg.event.extendedProps.description + '</p>' : '' }
      ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: <strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
      ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: <strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
      ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
      ${arg.event.extendedProps.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
      ${arg.event.extendedProps.vtcClassification  ?'<p><strong>SVTC Classification: <strong>' + arg.event.extendedProps.vtcClassification + '</p>' : ''}
      ${arg.event.extendedProps.distantTechPhoneNumber  ?'<p><strong>Distant Tech Phone Number: <strong>' + arg.event.extendedProps.distantTechPhoneNumber + '</p>' : ''}
      ${arg.event.extendedProps.requestorPOCContactInfo  ?'<p><strong>Requestor POC Contact Info: <strong>' + arg.event.extendedProps.requestorPOCContactInfo + '</p>' : ''}
      ${arg.event.extendedProps.dialInNumber  ?'<p><strong>Dial-In Number: <strong>' + arg.event.extendedProps.dialInNumber + '</p>' : ''}
      ${arg.event.extendedProps.siteIDDistantEnd  ?'<p><strong>Site-ID Distant End: <strong>' + arg.event.extendedProps.siteIDDistantEnd  + '</p>' : ''}
      ${arg.event.extendedProps.seniorAttendeeNameRank  ?'<p><strong>Senior Attendee Name/Rank: <strong>' + arg.event.extendedProps.seniorAttendeeNameRank  + '</p>' : ''}
      ${arg.event.extendedProps.additionalVTCInfo  ?'<p><strong>Additional SVTC Info: <strong>' + arg.event.extendedProps.additionalVTCInfo + '</p>' : ''}
      ${arg.event.extendedProps.vtcStatus  ?'<p><strong>SVTC Status: <strong>' + arg.event.extendedProps.vtcStatus + '</p>' : '<p><strong>SVTC Status: <strong>' + 'Tentative' + '</p>'}
       `;
     var tooltip : any = tippy(arg.el, {     
        content,
        allowHTML: true,
      });
      if (arg.event.extendedProps.eventLookup && arg.event.extendedProps.coordinatorEmail) {  
      try {
        const response = await agent.Activities.getRoomNames(
          arg.event.extendedProps.eventLookup, arg.event.extendedProps.coordinatorEmail);
          if(response){
            tooltip.setContent('');
            content = content + '<p><strong>Room(s): <strong>' + response + '</p>';
            tooltip.setContent(content);
          }
        
      }
      catch (error) {
        console.log(error);
      }
    }
  }

    useEffect(() => {
        const handleResize = () => {
          setHeight(window.innerHeight - 200);
        };
      
        window.addEventListener("resize", handleResize);
      
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);

      const calendarRef = useRef<FullCalendar>(null);

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

      const handleEventClick = useCallback((clickInfo: EventClickArg) => {
        history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${clickInfo.event.extendedProps.categoryId}`);
      }, [ history]);

    return (
        <>
      <Divider horizontal>
      <Header as='h2'>
        <Icon name='tv' />
        SVTC Calendar
      </Header>
    </Divider>

    <FullCalendar
           ref={calendarRef}
            height= {height}
            initialView="dayGridMonth"
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
            events={`${process.env.REACT_APP_API_URL}/activities/getSVTCEventsByDate`}
            eventClick={handleEventClick}
            eventDidMount={eventDidMount}
           // dateClick={handleDateClick}
            eventMouseEnter={handleMouseEnter} 
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'}     
          />
          <SVTCCalendarTable />
        </>
    )
}