import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Header, Input, Loader } from "semantic-ui-react";
import { useCallback, useEffect, useState, useRef } from "react";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { v4 as uuid } from "uuid";
import Pikaday from "pikaday";
import { useStore } from "../../app/stores/store";
import { BackToCalendarInfo } from "../../app/models/backToCalendarInfo";
import { saveAs } from 'file-saver';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';

interface Resource {
  id: string
  title: string
}



export default function Bldg651Calendar (){
  const {
    userStore: {isLoggedIn},
    graphRoomStore: {graphRooms, loadGraphRooms}
  } = useStore()
  const calendarDivRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(localStorage.getItem("calendarView651Timeline") || "resourceTimelineDay");
    const { id, backToCalendarId } = useParams<{id: string, backToCalendarId?: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    const [height, setHeight] = useState(window.innerHeight - 100);
    const {activityStore, backToCalendarStore} = useStore();
    const{ getActivityIdByRoom , addCalendarEventParameters} = activityStore;
    const {addBackToCalendarInfoRecord, getBackToCalendarInfoRecord} = backToCalendarStore;
    const [isInitialDateSet, setIsInitialDateSet] = useState(false);
    const [initialDate, setInitialDate] = useState<Date | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [resources, setResources] = useState<Resource[]>([]);



    useEffect(() => {
        if (!graphRooms || graphRooms.length < 1) {
            loadGraphRooms();
        }
        if (graphRooms && graphRooms.length > 1 && id) {
            let filteredGraphRooms = graphRooms;
            if(id !== 'all'){
            const bldg = id === '651' ? 'Bldg 651' : 'Collins Hall, Bldg 650'
            filteredGraphRooms = graphRooms.filter(x => x.building === bldg);
            }
            // Sort the filtered rooms alphabetically by displayName
            filteredGraphRooms.sort((a, b) => a.displayName.localeCompare(b.displayName));
    
            // Map the sorted rooms to resources and set them
            const sortedResources = filteredGraphRooms.map(x => ({
                id: x.emailAddress,
                building: x.building,
                title: x.displayName
            }));
            setResources(sortedResources);
        }
    }, [graphRooms, id]); // Dependency array includes graphRooms to trigger effect when it changes
    
     
    useEffect(() => {
      if(!isLoggedIn)  window.location.href = `${window.location.origin}/eem?redirecttopage=studentcalendar`;
     }, [isLoggedIn] )

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

      const takeScreenshot = () => {
        const calendarElement = calendarDivRef.current;
      
        if (calendarElement) {
          // Wait for the next frame to ensure any pending updates are applied
          requestAnimationFrame(() => {
            // Take the screenshot of the calendar element
            html2canvas(calendarElement).then(canvas => {
              // Create and download the image
              const image = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = image;
              link.download = 'fullcalendar-screenshot.png';
              link.click();
            });
          });
        }
      };

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
        if(searchQuery){
          highlightMatchingEvents(searchQuery)
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



      const handleExportToExcel = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;
    
        const events = calendarApi.getEvents();
        let csv = 'Title,Room,Start,End\n';
    
        function escapeCsvValue(value: string): string {
            if (value.includes(',') || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }
    
        function formatDate(dateString?: string | Date): string {
            let date = typeof dateString === 'string' ? new Date(dateString) : dateString;
            // Check if date is valid
            if (date instanceof Date && !isNaN(date.getTime())) {
                // Format date to MM/DD/YYYY HH:mm:ss format
                return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            return '';
        }
    
        events.forEach(event => {
            const eventData = event.toPlainObject();
            const resources = event.getResources();
    
            const startDate = formatDate(eventData.start);
            const endDate = formatDate(eventData.end);
    
            if (resources.length > 0) {
                resources.forEach(resource => {
                    const room = resource.title;
                    csv += `${escapeCsvValue(eventData.title)},${escapeCsvValue(room)},${escapeCsvValue(startDate)},${escapeCsvValue(endDate)}\n`;
                });
            } else {
                csv += `${escapeCsvValue(eventData.title)},,${escapeCsvValue(startDate)},${escapeCsvValue(endDate)}\n`;
            }
        });
    
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'calendarData.csv');
    };
    
    
    
    

    const highlightMatchingEvents = (query: string) => {
      const calendarDOMNode = ReactDOM.findDOMNode(calendarRef.current);
      
      if (calendarDOMNode instanceof Element) {
          const eventTitles = document.querySelectorAll('.fc-event-title');
    
          // If query is empty, reset styles and return
          if (!query.trim()) {
              eventTitles.forEach(titleEl => {
                  const parentDiv = (titleEl as HTMLElement).closest('div');
                  if (parentDiv) {
                      parentDiv.style.border = 'none';
                      parentDiv.style.animation = 'none';  // Remove animation
                      parentDiv.style.minHeight = '';  // Reset min height
                      parentDiv.style.zIndex = '';  // Reset z-index
                      parentDiv.style.backgroundColor = '';  // Reset background color
                  }
              });
              return;
          }
          
          eventTitles.forEach(titleEl => {
              const title = titleEl.textContent;
              const parentDiv = (titleEl as HTMLElement).closest('div');
    
              if (title && title.toLowerCase().includes(query.toLowerCase())) {
                  if (parentDiv) {
                      parentDiv.style.border = '7px solid darkred';
                      parentDiv.style.animation = 'pulse 1.5s infinite';  // Add animation
                      parentDiv.style.minHeight = '50px';  // Set min height
                      parentDiv.style.zIndex = '1000';  // Increase z-index by a lot
                      parentDiv.style.backgroundColor = 'darkorange';  // Set background to dark orange
                  }
              } else {
                  if (parentDiv) {
                      parentDiv.style.border = 'none';
                      parentDiv.style.animation = 'none';  // Remove animation
                      parentDiv.style.minHeight = '';  // Reset min height
                      parentDiv.style.zIndex = '';  // Reset z-index
                      parentDiv.style.backgroundColor = '';  // Reset background color
                  }
              }
          });
      }
    }; 
    

    return(
      <>
      <Divider horizontal>
        <Header as='h2'>

              <FontAwesomeIcon icon={faBuilding} size='2x' style={{marginRight: '10px'}} />
             {id === 'all' ? 'All Rooms' : id === '651' ? 'Building 651' : 'Collins Hall, Bldg 650'} 
        </Header>
        </Divider>
        {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}

<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
      <Input 
          icon='search' 
          placeholder='Search event titles...' 
          value={searchQuery} 
          onChange={e => {
              setSearchQuery(e.target.value);
              highlightMatchingEvents(e.target.value);
          }} 
      />
        </div> 



        <div ref={calendarDivRef}>

<FullCalendar
    schedulerLicenseKey="0778622346-fcs-1703792826"
  initialDate={initialDate || new Date()}
ref={calendarRef}
height="auto"
initialView={view}
resources={resources}

//initialView="resourceTimeline"
headerToolbar={{
  left: "prev,next",
  center: "title",
  right: "exportToExcel,datepicker,resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,screenShot"
}}
customButtons={{
  datepicker: {
  text: "go to date",
},
exportToExcel: {
  text: "export to excel",
  click: handleExportToExcel,
},
screenShot: {
  text: "screenshot",
  click: takeScreenshot,
},
}}
plugins={[resourceTimelinePlugin,  interactionPlugin]}
eventClick={handleEventClick}
dateClick={handleDateClick}
events={`${process.env.REACT_APP_API_URL}/roomEvents/bldg651timeline/${id}`}
eventMouseEnter={handleMouseEnter}
slotMinTime={'07:00:00'}
slotMaxTime={'21:00:00'}
resourceGroupField={id === 'all' ? 'building': ''}
loading={(isLoading) => setIsLoading(isLoading)}
eventDidMount={eventDidMount}
datesSet={(arg) => {
  // Save the user's view selection
  localStorage.setItem("calendarView651Timeline", arg.view.type);
 setView(arg.view.type);
}} 
/>
</div> 
</>
    )
}