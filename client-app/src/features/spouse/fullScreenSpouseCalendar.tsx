import {useState, useEffect, useCallback, useRef} from 'react';
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction";
import { useHistory} from "react-router-dom";
import { format } from 'date-fns';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Pikaday from "pikaday";
import { Loader, Modal, Button, Header, Message, Form, Input, Label, Divider, Icon } from 'semantic-ui-react'; 
import agent from '../../app/api/agent';
import { toast } from "react-toastify";
import { useStore } from "../../app/stores/store";
import { observer } from 'mobx-react-lite';

interface EventInfo{
    title: string
    time: string
    location: string
    description: string
    leadOrg: string
    actionOfficer: string
    actionOfficerPhone: string
    spouseCategory : string
    hyperLink: string
    hyperLinkDescription: string
  }

  interface SpouseCategory{
    id: number
    isSelected: boolean
    title: string
    color: string
  }

  export default function FullScreenSpouseCalendar(){
    const [spouseCategories, setSpouseCategories] = useState<SpouseCategory[]>([]);
    const [view, setView] = useState(localStorage.getItem("calendarViewSpouse") || "dayGridMonth");
    const [height, setHeight] = useState(window.innerHeight - 100);
    const calendarRef = useRef<FullCalendar>(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    const [openModal, setOpenModal] = useState(false);
    const [eventInfo, setEventInfo] = useState<EventInfo>(
        {title: '',
         time: '',
         location: '',
         description: '',
         leadOrg: '',
         actionOfficer: '',
         actionOfficerPhone: '',
         spouseCategory: '',
         hyperLink: '',
         hyperLinkDescription: ''
        }
        )
      const [loadingEvent, setLoadingEvent] = useState(false);
     
      useEffect(() => {
        setSpouseCategories([
          { id: 1, isSelected: true, title: 'Show All', color: '#00008B' },
          { id: 2, isSelected: false, title: 'ACS', color: '#8A3324' },
          { id: 3, isSelected: false, title: 'Chapel', color: '#C2B280' },
          { id: 4, isSelected: false, title: 'Dunham', color: '#FF8C00', },
          { id: 5, isSelected: false, title: 'Fitness', color: '#301934', },
          { id: 6, isSelected: false, title: 'MSFP', color: '#E75480', },
          { id: 7, isSelected: false, title: 'MWR', color: '#8B0000', },
          { id: 8, isSelected: false, title: 'USAWC', color: '#006400', },
        ])
      }, [])

      useEffect(() => {
        const handleResize = () => {
          setHeight(window.innerHeight - 200);
        };
        window.addEventListener("resize", handleResize);   
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);

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

      const  handleMouseEnter = async (arg : EventClickArg) =>{
        var content = `<p> ${ getTime(arg)}</p>              
        <p> <strong>Title: </strong> ${arg.event.title} </p>
        ${arg.event.extendedProps.description ?'<p><strong>Description: <strong>' + arg.event.extendedProps.description + '</p>' : '' }
        ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: <strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
        ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: <strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
        ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
        ${arg.event.extendedProps.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
        ${arg.event.extendedProps.spouseCategory ?'<p><strong>Category: <strong>' + arg.event.extendedProps.spouseCategory + '</p>' : ''}
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

      const handleEventClick = useCallback((clickInfo: EventClickArg) => {
        setOpenModal(true);
      
        const evt = {
          title: clickInfo.event.title,
          time: getTime(clickInfo),
          location: clickInfo.event.extendedProps.primaryLocation,
          description: clickInfo.event.extendedProps.description,
          leadOrg: clickInfo.event.extendedProps.leadOrg,
          actionOfficer: clickInfo.event.extendedProps.actionOfficer,
          actionOfficerPhone: clickInfo.event.extendedProps.actionOfficerPhone,
          spouseCategory: clickInfo.event.extendedProps.spouseCategory,
          hyperLink: clickInfo.event.extendedProps.hyperLink,
          hyperLinkDescription: clickInfo.event.extendedProps.hyperLinkDescription || 'Go To Link'
        };
      
        if (clickInfo.event.extendedProps.eventLookup && clickInfo.event.extendedProps.coordinatorEmail) { 
          setLoadingEvent(true);
          agent.Activities.getRoomNames(
            clickInfo.event.extendedProps.eventLookup, 
            clickInfo.event.extendedProps.coordinatorEmail
          ).then(response => {
            evt.location = response;
            if(!evt.location) evt.location = clickInfo.event.extendedProps.primaryLocation;
            setEventInfo(evt);
            setLoadingEvent(false);
          }).catch(error => {
            console.error("An error occurred: ", error);
            setLoadingEvent(false);
            setEventInfo(evt);
          });
      
        }else{
          setEventInfo(evt);
        }
      
      }, []);

      const eventDidMount = (info : any) => {
        const selectedCategories = spouseCategories.filter(category => category.isSelected);
        const showAllSelected = selectedCategories.some(category => category.id === 1);
        const noSelection = selectedCategories.length === 0;

        if (!showAllSelected && !noSelection) {
          const eventSpouseCategory = info.event.extendedProps.spouseCategory;
          const isEventVisible = selectedCategories.some(category => category.title === eventSpouseCategory);
          if (!isEventVisible) {
            info.el.style.display = 'none';
          }
        }
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

      const handleLabelClick = (spouseCategory: SpouseCategory) => {
        setSpouseCategories(prevCategories => {
          if (spouseCategory.id === 1) {
            // If "Show All" is clicked
            return prevCategories.map(category => ({
              ...category,
              isSelected: category.id === 1, // Only "Show All" should be selected
            }));
          } else {
            // If any other category is clicked
            return prevCategories.map(category => ({
              ...category,
              isSelected: category.id === spouseCategory.id ? !category.isSelected : (category.id === 1 ? false : category.isSelected),
            }));
          }
        });
      };

      return <>
               <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    closeIcon
                >
                {!loadingEvent &&  <Modal.Header>{eventInfo.title}</Modal.Header> }
                {loadingEvent &&  <Modal.Header>
                    <Loader size='small' active inline>Loading ...</Loader>
                    </Modal.Header> }
                    <Modal.Content>
    <Modal.Description>
      <Header>{eventInfo.time}</Header>  
       <p><strong>{eventInfo.location}</strong></p>
       {eventInfo.hyperLink && 
  <p> 
    <a href={eventInfo.hyperLink} className="ui orange button" target="_blank">
      {eventInfo.hyperLinkDescription.length > 500 
       ? `${eventInfo.hyperLinkDescription.substring(0, 500)}...` 
       : eventInfo.hyperLinkDescription}
    </a>
  </p>
}
      <p><strong>Description: </strong>{eventInfo.description}</p>
      {eventInfo.leadOrg && <p><strong>Lead Org: </strong>{eventInfo.leadOrg}</p>}
      {eventInfo.actionOfficer && <p><strong>Action Officer: </strong>{eventInfo.actionOfficer}</p>}
      {eventInfo.actionOfficerPhone && <p><strong>Action Officer Phone: </strong>{eventInfo.actionOfficerPhone}</p>}
      {eventInfo.spouseCategory && <p><strong>Category: </strong>{eventInfo.spouseCategory}</p>}


    </Modal.Description>
  </Modal.Content>
</Modal>

<Header as='h3' textAlign="center">
                Check or Uncheck Which Categories Should Appear on The Spouse Calendar
    </Header>
    {spouseCategories.map(spouseCategory =>(
      <Label key={spouseCategory.id} onClick={() => handleLabelClick(spouseCategory)}
      style={{backgroundColor: spouseCategory.color, color: 'white', marginBottom: '5px'}}
      >
      <Icon name={spouseCategory.isSelected ? 'check square outline' : 'square outline'}  size='large' />
      {spouseCategory.title}
    </Label>
    ))}

      {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
         )}
         
            <FullCalendar
           key={spouseCategories.map(category => category.isSelected).join(',')}
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
            events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/spouse`}
            eventClick={handleEventClick}
            eventMouseEnter={handleMouseEnter }
            eventDidMount={eventDidMount}
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'} 
            loading={(isLoading) => setIsLoading(isLoading)}    
            datesSet={(arg) => {
              // Save the user's view selection
              localStorage.setItem("calendarViewSpouse", arg.view.type);
              setView(arg.view.type);
            }}
          />  
      </>
    
  }