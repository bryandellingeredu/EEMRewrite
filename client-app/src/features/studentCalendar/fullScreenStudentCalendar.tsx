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
import ResidentAndDistanceStudentCalendarComponent from '../fullCalendar/ResidentAndDistanceStudentCalendarCategoryComponent';
import { observer } from 'mobx-react-lite';


interface EventInfo{
  title: string
  time: string
  location: string
  description: string
  leadOrg: string
  actionOfficer: string
  actionOfficerPhone: string
  mandatory: boolean
  presenter: string
  uniform: string
  notes: string
  hyperLink: string
  hyperLinkDescription: string
  teamLink: string
  studentType: string
}

interface ResidentAndDistanceStudentCalendarCategory{
  id: number
  isSelected: boolean
  group: string
  title: string
  color: string
  visible: boolean
}

export default observer( function FullScreenStudentCalendar (){
    const { userStore, navbarStore} = useStore();
    const {setPage} = navbarStore
    const {user, setStudentType} = userStore
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    const [email, setEmail] = useState('');
    const [showCalendar, setShowCalendar] = useState(true);
    const [view, setView] = useState(localStorage.getItem("calendarViewSC") || "timeGridWeek");
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
       mandatory: false,
       presenter: '',
       uniform: '',
       notes: '',
       hyperLink: '',
       hyperLinkDescription: '',
       teamLink: '',
       studentType: '',
      }
      )
    const [loadingEvent, setLoadingEvent] = useState(false);
    const [studentCategories, setStudentCategories] = useState<ResidentAndDistanceStudentCalendarCategory[]>([]);
    const [showLabels, setShowLabels] = useState(false);
    const [initialDate, setInitialDate] = useState<Date | null>(null);



    useEffect(() => {
      if (user) {
        if (!user.studentType) {
          setStudentType(user.userName);
        } else {
          if (user.studentType === 'not a student') {
            setShowLabels(true);
            if (localStorage.getItem("studentCategories")) {
              setStudentCategories(JSON.parse(localStorage.getItem("studentCategories1") || '{}'));
            } else {
              setStudentCategories([
                { id: 1, isSelected: true, group: '', title: 'Show All', color: '#00008B', visible: true },
                { id: 2, isSelected: false, group: 'studentCalendarResident', title: 'Resident', color: '#006400', visible: true },
                { id: 3, isSelected: false, group: 'studentCalendarDistanceGroup1', title: 'DEP 2024', color: '#FF8C00', visible: false },
                { id: 4, isSelected: false, group: 'studentCalendarDistanceGroup2', title: 'DEP 2025', color: '#EE4B2B', visible: true },
                { id: 5, isSelected: false, group: 'studentCalendarDistanceGroup3', title: 'DEP 2026', color: '#800080', visible: true },
                { id: 6, isSelected: false, group: 'studentCalendarDistanceGroup4', title: 'DEP 2027', color: '#B22222', visible: true },
              ]);
            }
          } else {
            setShowLabels(false);
            setStudentCategories([
              { id: 1, isSelected: false, group: '', title: 'Show All', color: '#00008B', visible: true },
              { id: 2, isSelected: user.studentType === "Resident", group: 'studentCalendarResident', title: 'Resident', color: '#006400', visible: true  },
              { id: 3, isSelected: user.studentType === "DL24", group: 'studentCalendarDistanceGroup1', title: 'DEP 2024', color: '#FF8C00', visible: false  },
              { id: 4, isSelected: user.studentType === "DL25", group: 'studentCalendarDistanceGroup2', title: 'DEP 2025', color: '#EE4B2B', visible: true  },
              { id: 5, isSelected: user.studentType === "DL26", group: 'studentCalendarDistanceGroup3', title: 'DEP 2026', color: '#800080', visible: true  },
              { id: 6, isSelected: user.studentType === "DL27", group: 'studentCalendarDistanceGroup4', title: 'DEP 2027', color: '#B22222', visible: true  },
            ]);
          }
        }
      }
    }, [user, user?.studentType]);

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
  },[calendarRef, showCalendar]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(false);
        setEmail(e.target.value);
      };

            const handleSubmit = async () => {
        setError(false);
        if (email && /\S+@\S+\.\S+/.test(email)) {
          setSaving(true);
          try {
            await agent.SyncCalendarNotifications.create({ email, route: 'studentCalendar' });
                // Show the toast notification
                toast.info('Success: You have been added to the synchronization notifications', {
                  position: "top-left",
                  autoClose: 20000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
      
          } catch (error) {
            console.error("An error occurred:", error);
            setError(true);
          } finally {
            setSaving(false);
            setShowCalendar(!showCalendar)
          }
        } else {
          setError(true);
        }
      };

const  handleMouseEnter = async (arg : EventClickArg) =>{
  var content = `<p> ${ getTime(arg)}</p>              
  <p> <strong>Title: </strong> ${arg.event.title} </p>
  <p> <strong>Student Category: </strong> ${arg.event.extendedProps.studentType} </p>
  ${arg.event.extendedProps.description ?'<p><strong>Description: <strong>' + arg.event.extendedProps.description + '</p>' : '' }
  ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: <strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
  ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: <strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
  ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: <strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
  ${arg.event.extendedProps.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
  ${arg.event.extendedProps.studentCalendarMandatory ? '<p><strong>Attendance is : <strong> Mandatory </p>' : '' }
  ${ !arg.event.extendedProps.studentCalendarMandatory ? '<p><strong>Attendance is : <strong> Optional </p>' : '' }
  ${arg.event.extendedProps.studentCalendarPresenter?'<p><strong>Presenter: <strong>' + arg.event.extendedProps.studentCalendarPresenter + '</p>' : ''}
  ${arg.event.extendedProps.studentCalendarUniform?'<p><strong>Uniform: <strong>' + arg.event.extendedProps.studentCalendarUniform + '</p>' : ''}
  ${arg.event.extendedProps.studentCalendarNotes?'<p><strong>Notes: <strong>' + arg.event.extendedProps.studentCalendarNotes + '</p>' : ''}
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
    mandatory: clickInfo.event.extendedProps.studentCalendarMandatory,
    presenter: clickInfo.event.extendedProps.studentCalendarPresenter,
    uniform: clickInfo.event.extendedProps.studentCalendarUniform,
    notes: clickInfo.event.extendedProps.studentCalendarNotes,
    hyperLink: clickInfo.event.extendedProps.hyperLink,
    hyperLinkDescription: clickInfo.event.extendedProps.hyperLinkDescription || 'Go To Link',
    teamLink: clickInfo.event.extendedProps.teamLink,
    studentType: clickInfo.event.extendedProps.studentType
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

const checkCategoryVisibility = (studentType: string): boolean => {
  // Map studentType to category IDs directly
  let categoryId: number | null = null;
  debugger;
  switch (studentType) {
    case "Resident":
      categoryId = 2;
      break;
    case "DEP2024":
      categoryId = 3;
      break;
    case "DEP2025":
      categoryId = 4;
      break;
    case "DEP2026":
      categoryId = 5;
      break;
    case "DEP2027":
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


const eventDidMount = (info : any) => {
   
  const selectedstudentCategories = studentCategories.filter(category => category.isSelected && category.visible);

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

if (!shouldDisplayEvent || !checkCategoryVisibility(info.event.extendedProps.studentType)) {
  info.el.style.display = 'none';
} else {

    const eventColor = info.event.backgroundColor;
    const eventDot = info.el.querySelector('.fc-daygrid-event-dot');
    const recurring = info.event.extendedProps.recurring;
    const teamsInd = info.event.extendedProps.teamsInd;
  
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
    if (teamsInd) {
      const eventContent = info.el.querySelector('.fc-event-title');
      if (eventContent) {
        const icon = document.createElement('i');
        icon.className = 'tv icon'; 
        eventContent.prepend(icon);
      }
    }

    if (info.event.extendedProps.studentCalendarMandatory) {
      const eventContent = info.el.querySelector('.fc-event-title');
      if (eventContent) {
        const icon = document.createElement('i');
        icon.className = 'exclamation triangle icon'; // The Semantic UI class for the exclamation triangle icon
        
        // Add custom styles to make the icon larger and bright orange
        icon.style.fontSize = '1.5em'; // Increase size of the icon (adjust as needed)
        icon.style.color = 'orange'; // Set the color to bright orange
        
        eventContent.prepend(icon); // Prepend the icon to the event content
      }
    }
    
   }
  };


    return(
        <>
         
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
{eventInfo.teamLink && 
  <p> 
    <a href={eventInfo.teamLink} className="ui teal button" target="_blank">
     Join Team Meeting
    </a>
  </p>
}
      <p><strong>Description: </strong>{eventInfo.description}</p>
      <p><strong>Student Category: </strong>{eventInfo.studentType}</p>
      {eventInfo.leadOrg && <p><strong>Lead Org: </strong>{eventInfo.leadOrg}</p>}
      {eventInfo.actionOfficer && <p><strong>Action Officer: </strong>{eventInfo.actionOfficer}</p>}
      {eventInfo.actionOfficerPhone && <p><strong>Action Officer Phone: </strong>{eventInfo.actionOfficerPhone}</p>}
      {eventInfo.mandatory && <p><strong>Attendance is mandatory </strong></p>}
      {eventInfo.presenter && <p><strong>Presenter: </strong>{eventInfo.presenter}</p>}
      {eventInfo.uniform && <p><strong>Uniform: </strong>{eventInfo.uniform}</p>}
      {eventInfo.notes && <p><strong>Notes: </strong>{eventInfo.notes}</p>}

    </Modal.Description>
  </Modal.Content>
</Modal>

         {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
         )}

         <Button size='large' primary content="Subscribe to Changes"
          onClick= {() => setShowCalendar(!showCalendar)}/>
        <Button size='large' color='green' content="Reserve a Room" floated='right'
          onClick= {() => setPage("bookRoom")}/>
         <Divider/>

         {!showCalendar && 
         <Message info>
         <Message.Header>Subscribe to Changes</Message.Header>
         If you subscribe you will receive an email with any changes to the Student Calendar that are within 3 days, please enter your email and click "Submit."<p/>
         <Form>
           <Input
             fluid
             size="large"
             label={{ icon: 'asterisk' }}
             labelPosition='left corner'
             placeholder='Email...'
             onChange={handleInputChange}
             value={email}
             error={error}
           />
           <p>
           <Button type='button' size="large"  onClick={() => setShowCalendar(!showCalendar)} loading={saving}>Cancel </Button>
           <Button type='button' size="large" primary onClick={handleSubmit} loading={saving}>Submit </Button>
     
           </p>
           {error && <Label basic color='red' pointing='left'>Please enter a valid email</Label>}
         </Form>
       </Message>
}

       {showCalendar &&    
       
       <>
       {showLabels && 
       <>
        <Header as='h3' textAlign="center">
                Check or Uncheck Which Categories Should Appear on The Student Calendar
            </Header>
              <div>
              {studentCategories.map(studentCategory => (
                <ResidentAndDistanceStudentCalendarComponent key={studentCategory.id}
                studentCategory = {studentCategory}
                visible={studentCategory.visible}
                handleLabelClick = {handleLabelClick} />
              ))}
                 <Label size='large'  color='teal'>
              <Icon name='exclamation triangle'/> Mandatory
            </Label>
              </div>
              </>
        }

          <FullCalendar
           initialDate={initialDate || new Date()}
           ref={calendarRef}
            height= {height}
            initialView={view}
            key={studentCategories.map(category => category.isSelected).join(',')}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "datepicker,dayGridMonth,timeGridWeek,timeGridDay",
            }}
              customButtons={{
                datepicker: {
                text: "go to date",
                }
              }}
            
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            events={`${process.env.REACT_APP_API_URL}/activities/getStudentCalendarEventsByDate`}
            eventClick={handleEventClick}
            eventMouseEnter={handleMouseEnter }
            eventDidMount={eventDidMount}
            slotMinTime={'07:00:00'}
            slotMaxTime={'21:00:00'} 
            loading={(isLoading) => setIsLoading(isLoading)}    
            datesSet={(arg) => {
              // Save the user's view selection
              localStorage.setItem("calendarViewSC", arg.view.type);
              setView(arg.view.type);
            }}
          />
          </>
        }    
        </>
    )
})