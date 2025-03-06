import FullCalendar, {EventClickArg } from "@fullcalendar/react";
import { observer } from "mobx-react-lite";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import agent from "../../app/api/agent";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { useCallback, useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useStore } from "../../app/stores/store";
import Pikaday from "pikaday";
import ReactDOM from 'react-dom';
import { BackToCalendarInfo } from "../../app/models/backToCalendarInfo";
import { Button, Divider, Header, Icon, Input, Label, Loader } from "semantic-ui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import ResidentAndDistanceStudentCalendarComponent from "./ResidentAndDistanceStudentCalendarCategoryComponent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import GenericCalendarTable from "./GenericCalendarTable";
import SyncCalendarInformation from "./SyncCalendarInformation";
import html2canvas from 'html2canvas';

interface ResidentAndDistanceStudentCalendarCategory{
    id: number
    isSelected: boolean
    group: string
    title: string
    color: string
    visible: boolean
}

export default observer(function ResidentAndDistanceStudentCalendar(){
const history = useHistory();
const { backToCalendarStore, categoryStore, activityStore,  userStore, modalStore } = useStore();
const {openModal} = modalStore;
const {user, setStudentType, isLoggedIn} = userStore
const { categories, loadingInitial } = categoryStore;
const {addBackToCalendarInfoRecord, getBackToCalendarInfoRecord} = backToCalendarStore;
const {addCalendarEventParameters} = activityStore;
const [searchQuery, setSearchQuery] = useState("");
const [studentCategories, setStudentCategories] = useState<ResidentAndDistanceStudentCalendarCategory[]>([]);
const [initialDate, setInitialDate] = useState<Date | null>(null);
const { backToCalendarId } = useParams<{ backToCalendarId?: string }>();
const [showLabels, setShowLabels] = useState(false);
const [isInitialDateSet, setIsInitialDateSet] = useState(false);
const calendarRef = useRef<FullCalendar>(null);
const calendarDivRef = useRef<HTMLDivElement>(null);
const [height, setHeight] = useState(window.innerHeight - 200);
const [view, setView] = useState(localStorage.getItem("residentAndDistanceStudentCalendarView") || "timeGridWeek");
const [isLoading, setIsLoading] = useState(true);
const [canViewIFCalendarEvents, setCanViewIFCalendarEvents] = useState(false);

const getFiscalYear = (startDate: string | Date, offset: number = 0): number => {
  const date = new Date(startDate);
  const year = date.getFullYear();
  const isFiscalNextYear = date.getMonth() >= 9; // October or later moves to next fiscal year
  return year + (isFiscalNextYear ? 1 : 0) + offset;
};


useEffect(() => {
  if (user && user.roles && user.roles.includes("ifCalendarAdmin") ) setCanViewIFCalendarEvents(true);
  if (user && user.userName && user.userName.toLowerCase().endsWith('.fm@armywarcollege.edu')) setCanViewIFCalendarEvents(true);
}, [user]);

useEffect(() => {
  if(!isLoggedIn)  window.location.href = `${window.location.origin}/eem?redirecttopage=residentAndDistanceStudentCalendar`;
 }, [isLoggedIn] )

useEffect(() => {
  if (user) {
    if (!user.studentType) {
      setStudentType(user.userName);
    } else {
      if (user.studentType === 'not a student') {
        setShowLabels(true);
        if (localStorage.getItem("studentCategories1")) {
          setStudentCategories(JSON.parse(localStorage.getItem("studentCategories1") || '{}'));
        } else {
          setStudentCategories([
            { id: 1, isSelected: true, group: '', title: 'Show All', color: '#00008B', visible: true },
            { id: 2, isSelected: false, group: 'studentCalendarResident', title: 'Resident', color: '#006400', visible: true },
            { id: 4, isSelected: false, group: 'studentCalendarDistanceGroup2', title: `DEP ${getFiscalYear(initialDate || new Date(), 0)}`, color: '#EE4B2B', visible: true },
            { id: 5, isSelected: false, group: 'studentCalendarDistanceGroup3', title: `DEP ${getFiscalYear(initialDate || new Date(), 1)}`, color: '#800080', visible: true },
            { id: 6, isSelected: false, group: 'studentCalendarDistanceGroup4', title: `DEP ${getFiscalYear(initialDate || new Date(), 2)}`, color: '#B22222', visible: true  },
          ]);
        }
      } else {
        setShowLabels(false);
        setStudentCategories([
          { id: 1, isSelected: false, group: '', title: 'Show All', color: '#00008B', visible: true },
          { id: 2, isSelected: user.studentType === "Resident", group: 'studentCalendarResident', title: 'Resident', color: '#006400' , visible: true },
          { id: 4, isSelected: user.studentType === `DL${getFiscalYear(initialDate || new Date(), 0).toString().slice(-2)}`, group: 'studentCalendarDistanceGroup2', title: `DEP ${getFiscalYear(initialDate || new Date(), 0)}`, color: '#EE4B2B', visible: true },
          { id: 5, isSelected: user.studentType === `DL${getFiscalYear(initialDate || new Date(), 1).toString().slice(-2)}`, group: 'studentCalendarDistanceGroup3', title: `DEP ${getFiscalYear(initialDate || new Date(), 1)}`, color: '#800080', visible: true },
          { id: 6, isSelected: user.studentType === `DL${getFiscalYear(initialDate || new Date(), 2).toString().slice(-2)}`, group: 'studentCalendarDistanceGroup4', title: `DEP ${getFiscalYear(initialDate || new Date(), 2)}`, color: '#B22222', visible: true },
        ]);
      }
    }
  }
}, [user, user?.studentType]);



 useEffect(() => {
   if(!categories.length) categoryStore.loadCategories();
  }, [categories.length])

useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight - 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

useEffect(() => {
    let backToCalendarRecord: BackToCalendarInfo | undefined = undefined;
    if (backToCalendarId && !isInitialDateSet) {
      backToCalendarRecord = getBackToCalendarInfoRecord(backToCalendarId);
      if (backToCalendarRecord) {
        setInitialDate(backToCalendarRecord.goToDate);
        const calendarApi = calendarRef.current?.getApi();
        if(calendarApi){
          calendarApi.gotoDate(backToCalendarRecord.goToDate);
        }
        setIsInitialDateSet(true);
      }
    }
  }, [backToCalendarId, isInitialDateSet, calendarRef]);

  

const handleLabelClick = (clickedCategory: ResidentAndDistanceStudentCalendarCategory) => {
  const calendarApi = calendarRef.current?.getApi();
  if (calendarApi) {
    setInitialDate(calendarApi.getDate());
  }
 
    let updatedCategories;

    if (clickedCategory.id === 1) {
        // If the clicked category is the 'Show All' category (assuming id 1 is for 'Show All')
        // then set isSelected to true for this and false for all others
        updatedCategories = studentCategories.map(category => ({
            ...category,
            isSelected: category.id === 1
        }));
    } else {
        // Update the isSelected property for the clicked category
        // and ensure 'Show All' is unchecked
        updatedCategories = studentCategories.map(category => {
            if (category.id === clickedCategory.id) {
                return { ...category, isSelected: !category.isSelected };
            } else if (category.id === 1) {
                // Ensure the 'Show All' category is unselected when any other category is selected
                return { ...category, isSelected: false };
            }
            return category;
        });
    }

    // Update the state
    setStudentCategories(updatedCategories);

    // Update localStorage
    localStorage.setItem("studentCategories1", JSON.stringify(updatedCategories));
};

const handleDateClick = useCallback((info : any) => {
 
  const backToCalendarInfo : BackToCalendarInfo = {
    id: uuid(),
    goToDate: info.date,
    url: `${process.env.PUBLIC_URL}/residentAndDistanceStudentCalendar`
  };
  addBackToCalendarInfoRecord(backToCalendarInfo);

  const category = categories.find(x => x.routeName === "studentCalendar");
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

  addCalendarEventParameters({id: paramId, allDay: false, dateStr: formattedDate, date:new Date(adjustedDate), categoryId: category?.id || '', needRoom: false})
  history.push(`${process.env.PUBLIC_URL}/createActivityWithCalendar/${paramId}/${backToCalendarInfo.id}`);
}, [ categories, history]);

const handleEventClick = useCallback((clickInfo: EventClickArg) => {
  const category = categories.find(x => x.routeName === "studentCalendar");
  
  const backToCalendarInfo : BackToCalendarInfo = {
    id: uuid(),
    goToDate: clickInfo.event.start || new Date(),
    url: `${process.env.PUBLIC_URL}/residentAndDistanceStudentCalendar`
  };
  addBackToCalendarInfoRecord(backToCalendarInfo);
     
  history.push(`${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${category?.id}/${backToCalendarInfo.id}`);
}, [ categories, history]);

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

const getStudentPrograms = (extendedProps : any) => {

    let programs = [];
    if(extendedProps.studentCalendarResident ) programs.push('Resident');
    if(extendedProps.studentCalendarDistanceGroup2 ) programs.push(`DEP ${getFiscalYear(initialDate || new Date(), 0)}`);
    if(extendedProps.studentCalendarDistanceGroup3 ) programs.push(`DEP ${getFiscalYear(initialDate || new Date(), 1)}`);
    if(extendedProps.studentCalendarDistanceGroup4 ) programs.push(`DEP ${getFiscalYear(initialDate || new Date(), 2)}`);
    if(programs.length < 1) programs.push('Resident');
    return programs.join(', ');
}





const  handleMouseEnter = async (arg : any) =>{
  var content = `<p> ${ getTime(arg)}</p>              
  <p> <strong>Title: </strong> ${arg.event.title} </p>
  <p> <strong>Student Category: </strong> ${arg.event.extendedProps.studentType} </p>
  ${arg.event.extendedProps.internationalFellowsOnly ? '<p><strong>INTERNATIONAL FELLOWS ONLY</strong></p>' : ''}
  ${arg.event.extendedProps.description ?'<p><strong>Description: <strong>' + arg.event.extendedProps.description + '</p>' : '' }
  ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: <strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
  ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: <strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
  ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
  ${arg.event.extendedProps.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
  ${arg.event.extendedProps.copiedTosymposiumAndConferences && arg.event.extendedProps.symposiumLinkInd && arg.event.extendedProps.symposiumLink?'<p><strong>Click to view registration link<strong></p>' : ''}
  ${showLabels ? '<p><strong>Student Program/s: ' + getStudentPrograms(arg.event.extendedProps) + '</strong></p>' : ''}
  <p><strong>Attendance is : <strong>  ${arg.event.extendedProps.studentCalendarMandatory ? 'Mandatory' : 'Optional'} </p>
  ${arg.event.extendedProps.studentCalendarPresenter?'<p><strong>Presenter: <strong>' + arg.event.extendedProps.studentCalendarPresenter + '</p>' : ''}
  ${arg.event.extendedProps.studentCalendarUniform
  ? '<p><strong>Uniform: <strong>' 
      + (arg.event.extendedProps.studentCalendarUniform.length > 100 
          ? arg.event.extendedProps.studentCalendarUniform.slice(0, 100) + '...' 
          : arg.event.extendedProps.studentCalendarUniform) 
      + '</p>' 
  : ''
}
${arg.event.extendedProps.studentCalendarNotes
  ? '<p><strong>Notes: <strong>' 
      + (arg.event.extendedProps.studentCalendarNotes.length > 100 
          ? arg.event.extendedProps.studentCalendarNotes.slice(0, 100) + '...' 
          : arg.event.extendedProps.studentCalendarNotes) 
      + '</p>' 
  : ''
}
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

  const checkCategoryVisibility = (studentType: string): boolean => {
    // Map studentType to category IDs directly
    let categoryId: number | null = null;
    debugger;
    switch (studentType) {
      case "Resident":
        categoryId = 2;
        break;

      case `DEP ${getFiscalYear(initialDate || new Date(), 0)}`:
        categoryId = 4;
        break;
        case `DEP ${getFiscalYear(initialDate || new Date(), 1)}`:
        categoryId = 5;
        break;
        case `DEP ${getFiscalYear(initialDate || new Date(), 2)}`:
        categoryId = 6;
        break;
      default:
        categoryId = 2;
    }
  
    // Find the category based on the determined categoryId
    const category = studentCategories.find(cat => cat.id === categoryId);
  
    // Return the visibility of the category, or false if not found
    return category ? category.visible : false;
  };

return(
    <>
     {(loadingInitial || !user)
        && <LoadingComponent content='Loading Calendar' />
      }
      {!loadingInitial && 
      <>
         <Button icon  floated="right" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SyncCalendarInformation
                routeName={'studentCalendar'}
                showSyncInfo={true}
              />, 'large'
            )
          }
        >
      <Icon name='sync'/>
       &nbsp; Sync To My Calendar
    </Button>
    <Button icon  floated="right" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SyncCalendarInformation
                routeName={'studentCalendar'}
                showSyncInfo={false}
              />, 'large'
            )
          }
        >
      <Icon name='bell'/>
       &nbsp; Subscribe to Changes
    </Button>
    <Divider horizontal>
    <Header as='h2'>
        <FontAwesomeIcon icon={faGraduationCap} size='2x' style={{ marginRight: '10px' }} />
        Student Calendar
    </Header>
    </Divider>
    {showLabels && 
    <Header as='h3' textAlign="center">
            Check or Uncheck Which Categories Should Appear on The Student Calendar
        </Header>
    }
       {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}
      {showLabels && 
    <div>
    {studentCategories.map(studentCategory => (
      <ResidentAndDistanceStudentCalendarComponent key={studentCategory.id}
      visible={studentCategory.visible}
      studentCategory = {studentCategory}
      handleLabelClick = {handleLabelClick} />
    ))}
       <Label size='large'  color='teal'>
          <Icon name='exclamation triangle'/> Mandatory
      </Label>
      {canViewIFCalendarEvents && 
      <Label size='large'  color='teal'>
          <Icon name='globe'/> International Fellows Only
      </Label>
     }
    </div>
   }


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
      initialDate={initialDate || new Date()}
      ref={calendarRef}
      height="auto"
      key={studentCategories.map(category => category.isSelected).join(',')}
      initialView={view}
      headerToolbar={{
        left: "prev,next",
        center: "title",
        right: "datepicker,dayGridMonth,timeGridWeek,timeGridDay,screenShot",
      }}
      customButtons={{
        datepicker: {
          text: "go to date",
          click: function() {
            // Initialize Pikaday
            const picker = new Pikaday({
              field: document.querySelector(".fc-datepicker-button") as HTMLElement,
              format: "YYYY-MM-DD",
              onSelect: function (dateString) { 
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) {
                  picker.gotoDate(new Date(dateString));
                  calendarApi.gotoDate(new Date(dateString));
                }
              },
            });
            // Show the Pikaday date picker
            picker.show();
          },
        },
        screenShot: {
          text: "screenshot",
          click: takeScreenshot,
        },
      }}
      datesSet={(arg) => {
        // Save the user's view selection
        localStorage.setItem("residentAndDistanceStudentCalendarView", arg.view.type);
        setView(arg.view.type);
      }}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      events={`${process.env.REACT_APP_API_URL}/activities/getStudentCalendarEventsByDate`}
      eventClick={handleEventClick}
      dateClick={handleDateClick}
      eventMouseEnter={handleMouseEnter} 
      slotMinTime={"07:00:00"}
      slotMaxTime={"21:00:00"}
      loading={(isLoading) => setIsLoading(isLoading)}

      

      eventDidMount={(info: any) => {
        const selectedstudentCategories = studentCategories.filter(category => category.isSelected && category.visible)
  
        let shouldDisplayEvent = (
            (selectedstudentCategories.some(category => category.id === 2) && info.event.extendedProps.studentCalendarResident) ||
            (selectedstudentCategories.some(category => category.id === 3) && info.event.extendedProps.studentCalendarDistanceGroup1) ||
            (selectedstudentCategories.some(category => category.id === 4) && info.event.extendedProps.studentCalendarDistanceGroup2) ||
            (selectedstudentCategories.some(category => category.id === 5) && info.event.extendedProps.studentCalendarDistanceGroup3) ||
            (selectedstudentCategories.some(category => category.id === 6) && info.event.extendedProps.studentCalendarDistanceGroup4) ||
            (
              selectedstudentCategories.some(category => category.id === 2) &&
               (!info.event.extendedProps.studentCalendarResident &&
                !info.event.extendedProps.studentCalendarDistanceGroup1 &&
                !info.event.extendedProps.studentCalendarDistanceGroup2 &&
                !info.event.extendedProps.studentCalendarDistanceGroup3 &&
                !info.event.extendedProps.studentCalendarDistanceGroup4
              )
            )
        );

        if (selectedstudentCategories.some(category => category.id === 1)) {
          shouldDisplayEvent = true;
        }

        if (selectedstudentCategories.length < 1) {
          shouldDisplayEvent = true;
        }

        if (!canViewIFCalendarEvents && info.event.extendedProps.internationalFellowsOnly)  shouldDisplayEvent = false;

    
        if (!shouldDisplayEvent || !checkCategoryVisibility(info.event.extendedProps.studentType)) {
            info.el.style.display = 'none';
        } else {
            const eventColor = info.event.backgroundColor;
            const eventDot = info.el.querySelector('.fc-daygrid-event-dot');
            if (eventDot) {
                eventDot.style.borderColor = eventColor;
            }
            if (info.event.extendedProps.studentCalendarMandatory) {
              const eventContent = info.el.querySelector('.fc-event-title');
              if (eventContent) {
                const icon = document.createElement('i');
                icon.className = 'exclamation triangle icon'; // The Semantic UI class for the exclamation triangle icon
                
                // Add custom styles to make the icon larger and bright orange
                icon.style.fontSize = '1.6em'; // Increase size of the icon (adjust as needed)
                icon.style.color = 'orange'; // Set the color to bright orange
                
                eventContent.prepend(icon); // Prepend the icon to the event content
              }
            }

            if (info.event.extendedProps.internationalFellowsOnly) {
              const eventContent = info.el.querySelector('.fc-event-title');
              if (eventContent) {
                const icon = document.createElement('i');
                icon.className = 'globe icon'; // Add the Semantic UI class for spinning animation
                
                // Add custom styles to make the icon larger and bright orange
                icon.style.fontSize = '1.6em'; // Increase size of the icon (adjust as needed)
                icon.style.color = 'goldenrod'; // Set the color to bright orange
                
                eventContent.prepend(icon); // Prepend the icon to the event content
              }
            }
    
            // Style for recurring events
            if (info.event.extendedProps.recurring) {
                const eventContent = info.el.querySelector('.fc-event-title');
                if (eventContent) {
                    const icon = document.createElement('i');
                    icon.className = 'redo alternate icon'; // The Semantic UI class for the repeating icon
                    eventContent.prepend(icon);
                }
            }
    
            // Style for teamInd events
            if (info.event.extendedProps.teamInd) {
                const eventContent = info.el.querySelector('.fc-event-title');
                if (eventContent) {
                    const icon = document.createElement('i');
                    icon.className = 'tv icon'; // The Semantic UI class for the team indicator icon
                    eventContent.prepend(icon);
                }
            }
            if(searchQuery){
              highlightMatchingEvents(searchQuery)
            }
        }
    }}
    />
    </div>
    <GenericCalendarTable id={'studentCalendar'} />
     </>
  }
    </>
)
})