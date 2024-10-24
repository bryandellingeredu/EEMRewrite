import { useEffect, useRef, useState } from "react"
import { useStore } from "../../app/stores/store"
import { Divider, Header, Icon, Label, Loader, Segment, Sidebar, Menu, Button } from "semantic-ui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import ReactDOM from 'react-dom';
import FullCalendar, { DatesSetArg, EventClickArg } from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import { format } from "date-fns";
import agent from "../../app/api/agent";
import ResidentAndDistanceAndStaffFellowsCalendarComponent from "../fullCalendar/ResidentAndDistanceAndStaffFellowsCalendarCategoryComponent";
import InternationalFellowsEventDetails from "./internationalFellowsEventDetails";
import InternationalFellowsAddEvent from "./internationalFellowsAddEvent";


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
    internationalFellowsStaffEventCategory: string
  }

  interface ResidentAndDistanceAndStaffFellowsCategory{
    id: number
    isSelected: boolean
    group: string
    title: string
    color: string
    visible: boolean
}

export default  function InternationalFellowsCalendar(){
    const {userStore} = useStore();
    const {user} = userStore
    const [ifCalendarAdmin, setIFCalendarAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [studentCategories, setStudentCategories] = useState<ResidentAndDistanceAndStaffFellowsCategory[]>([]);
    const [view, setView] = useState(localStorage.getItem("calendarViewSCM") || "listWeek");
    const [initialDate, setInitialDate] = useState<Date | null>(null);
    const calendarRef = useRef<FullCalendar>(null);
    const [title, setTitle] = useState("");
    const [loadingEvent, setLoadingEvent] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [showCalendar, setShowCalendar] = useState(true);


    const setShowDetailFalse = () =>{
        setShowDetails(false);
      }

      const setShowFormFalse = () =>{
        setShowForm(false);
      }

    useEffect(() => {
        setIFCalendarAdmin((user && user.roles && user.roles.includes("ifCalendarAdmin")) || false);
      }, [user]);

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
         internationalFellowsStaffEventCategory: '',
        });

        useEffect(() => {
            if (localStorage.getItem("internationalFellowsCategories")) {
                setStudentCategories(JSON.parse(localStorage.getItem("internationalFellowsCategories") || '{}'));
            }else{
                setStudentCategories([
                  { id: 1, isSelected: true, group: '', title: 'Show All', color: '#00008B', visible: true },
                  { id: 3, isSelected: false, group: 'studentCalendarResident', title: 'Resident', color: '#006400', visible: true },
                  { id: 4, isSelected: false, group: 'studentCalendarDistanceGroup1', title: 'DEP 2024', color: '#FF8C00', visible: false },
                  { id: 5, isSelected: false, group: 'studentCalendarDistanceGroup2', title: 'DEP 2025', color: '#EE4B2B', visible: true },
                  { id: 6, isSelected: false, group: 'studentCalendarDistanceGroup3', title: 'DEP 2026', color: '#800080', visible: true },
                  { id: 7, isSelected: false, group: 'Leave / TDY', title: 'Leave / TDY', color: '#000000', visible: true },
                  { id: 8, isSelected: false, group: 'FSP', title: 'FSP', color: '#D87093', visible: true },
                  { id: 9, isSelected: false, group: 'MTGS', title: 'MTGS', color: '#B8860B', visible: true },
                  { id: 10, isSelected: false, group: 'Office Birthday', title: 'Office Birthday', color: '#654321', visible: true },
                  { id: 11, isSelected: false, group: 'IF Birthday', title: 'IF Birthday', color: '#008080', visible: true },
                  { id: 12, isSelected: false, group: 'IF Holiday', title: 'IF Holiday', color: '#808000', visible: true },
                  { id: 2, isSelected: false, group: 'staff', title: 'IF Staff Event', color: '#708090', visible: true},
                ]);
            }
        }, []);

        const checkCategoryVisibility = (studentType: string): boolean => {
            // Map studentType to category IDs directly
            let categoryId: number | null = null;
            switch (studentType) {
              case "Staff":
                    categoryId = 2;
                    break;
              case "Resident":
                categoryId = 3;
                break;
              case "DEP2024":
                categoryId = 4;
                break;
              case "DEP2025":
                categoryId = 5;
                break;
              case "DEP2026":
                categoryId = 6;
                break;
              case "DEP2027":
                categoryId = 7;
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

            const selectedstudentCategories = studentCategories.filter(category => category.isSelected && category.visible)
      
            let shouldDisplayEvent = (
              (selectedstudentCategories.some(category => category.id === 2) && (info.event.extendedProps.internationalFellowsStaffEvent && ! info.event.extendedProps.internationalFellowsStaffEventCategory)) ||
              (selectedstudentCategories.some(category => category.id === 7) && (info.event.extendedProps.internationalFellowsStaffEvent &&  info.event.extendedProps.internationalFellowsStaffEventCategory === 'Leave/TDY')) ||
              (selectedstudentCategories.some(category => category.id === 8) && (info.event.extendedProps.internationalFellowsStaffEvent &&  info.event.extendedProps.internationalFellowsStaffEventCategory === 'FSP')) ||
              (selectedstudentCategories.some(category => category.id === 9) && (info.event.extendedProps.internationalFellowsStaffEvent &&  info.event.extendedProps.internationalFellowsStaffEventCategory === 'MTGS')) ||
              (selectedstudentCategories.some(category => category.id === 10) && (info.event.extendedProps.internationalFellowsStaffEvent &&  info.event.extendedProps.internationalFellowsStaffEventCategory === 'Office Birthday')) ||
              (selectedstudentCategories.some(category => category.id === 11) && (info.event.extendedProps.internationalFellowsStaffEvent &&  info.event.extendedProps.internationalFellowsStaffEventCategory === 'IF Birthday')) ||
              (selectedstudentCategories.some(category => category.id === 12) && (info.event.extendedProps.internationalFellowsStaffEvent &&  info.event.extendedProps.internationalFellowsStaffEventCategory === 'IF Holiday')) ||
              (selectedstudentCategories.some(category => category.id === 3) && info.event.extendedProps.studentCalendarResident) ||
              (selectedstudentCategories.some(category => category.id === 4) && info.event.extendedProps.studentCalendarDistanceGroup1) ||
              (selectedstudentCategories.some(category => category.id === 5) && info.event.extendedProps.studentCalendarDistanceGroup2) ||
              (selectedstudentCategories.some(category => category.id === 6) && info.event.extendedProps.studentCalendarDistanceGroup3) ||
              (selectedstudentCategories.some(category => category.id === 7) && info.event.extendedProps.studentCalendarDistanceGroup4) 
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
              const eventDot = info.el.querySelector('.fc-list-event-dot');
          
              if (eventDot) {
                  eventDot.style.borderColor = eventColor;
              }
              if(info.event.extendedProps.studentCalendarMandatory){
                const eventContent = info.el.querySelector('.fc-list-event-title');
                if (eventContent) {
                    const icon = document.createElement('i');
                    icon.style.fontSize = '1.5em'; // Increase size of the icon (adjust as needed)
                    icon.style.color = 'orange';
                    icon.className = 'exclamation triangle icon'; // The Semantic UI class for the exclamation triangle icon
                    eventContent.prepend(icon);
                }
              }

                   // Style for recurring events
            if (info.event.extendedProps.recurring) {
                const eventContent = info.el.querySelector('.fc-list-event-title');
                if (eventContent) {
                    const icon = document.createElement('i');
                    icon.className = 'redo alternate icon'; // The Semantic UI class for the repeating icon
                    eventContent.prepend(icon);
                }
            }

                   // Style for teamInd events
                   if (info.event.extendedProps.teamInd) {
                    const eventContent = info.el.querySelector('.fc-list-event-title');
                    if (eventContent) {
                        const icon = document.createElement('i');
                        icon.className = 'tv icon'; // The Semantic UI class for the team indicator icon
                        eventContent.prepend(icon);
                    }
                }
              
                if (info.event.extendedProps.fromExternalCalendarInd){
                    const eventContent = info.el.querySelector('.fc-list-event-title');
              
                  // Create a container for the FontAwesome icon
                  const iconContainer = document.createElement('span');
              
                  // Use React to render the FontAwesomeIcon into the container
                  ReactDOM.render(
                    <FontAwesomeIcon icon={faCalendarPlus} className="fa-calendar-plus"  style={{ marginRight: '8px' }} />,
                    iconContainer
                  );
              
                  // Prepend the rendered icon container to the event content
                  eventContent.prepend(iconContainer);
                  }

            }
          };

          const handleLabelClick = (clickedCategory: ResidentAndDistanceAndStaffFellowsCategory) => {
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
              localStorage.setItem("internationalFellowsCategories", JSON.stringify(updatedCategories));
          };

          const handleButtonClick = () => {
            setShowDetails(false);
          };

          const handleDatesSet = (arg: DatesSetArg) => {
            localStorage.setItem("calendarViewSCM", arg.view.type);
            setView(arg.view.type);
            setTitle(arg.view.title); 
            handleButtonClick();
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

          const handleEventClick = (clickInfo: EventClickArg) => {
            setShowDetails(false);
    
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
                studentType: clickInfo.event.extendedProps.studentType,
                internationalFellowsStaffEventCategory: clickInfo.event.extendedProps.internationalFellowsStaffEventCategory,
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
                  setShowDetails(true);
                }).catch(error => {
                  console.error("An error occurred: ", error);
                  setLoadingEvent(false);
                  setEventInfo(evt);
                  setShowDetails(true);
                });
            
              }else{
                setEventInfo(evt);
                setShowDetails(true);
              }
    

          }
        

        if(user && !ifCalendarAdmin) return  ( 
        <Segment textAlign='center' color='yellow' inverted>
            <Label color='red' content='Unauthorized' size='large' />
        </Segment>
        )

      /*  if (isLoading) return (
           <Loader active size='large' style={{marginTop: '100px'}}>
            Loading events...
          </Loader>)*/


    return (
      <>
     <Button icon="bars" size='small' inverted onClick={() => setSidebarVisible(!sidebarVisible)} style={{ position: 'fixed', top: '70px', left: '15px', zIndex: 1000 }} />
      <Sidebar.Pushable  style={{backgroundColor: '#eaeaea', minHeight: '80vh'}} >
        <Sidebar
          as={Menu}
          animation='overlay'
          icon='labeled'
          inverted
          onHide={() => setSidebarVisible(false)}
          vertical
          visible={sidebarVisible}
          width='wide'
        >
         <Divider inverted/>
          <Header as='h3' textAlign="center" inverted>
            Check or Uncheck Which Categories Should Appear on The Calendar
          </Header>
          <div>
            {studentCategories.map(studentCategory => (
              <ResidentAndDistanceAndStaffFellowsCalendarComponent key={studentCategory.id}
                visible={studentCategory.visible}
                studentCategory={studentCategory}
                handleLabelClick={handleLabelClick} />
            ))}
                 <Divider inverted color='yellow'/>
               <Header as='h3' textAlign="center" inverted >
            Icon Legend
          </Header>
            <Label size='large' color='grey'>
              <Icon name='exclamation triangle' /> Mandatory
            </Label>
            <Label size='large' style={{ marginBottom: '5px' }} color='grey'>
              <Icon name='redo alternate' /> Repeating Event
            </Label>
            <Label size='large' style={{ marginBottom: '5px' }} color='grey'>
              <Icon name='tv' /> Teams Meeting
            </Label>
            <Label style={{ marginBottom: '5px' }} color='grey' size='large'>
              <FontAwesomeIcon icon={faCalendarPlus} className="fa-calendar-plus" style={{ marginRight: '8px' }} />From Other Calendar
            </Label>
          </div>
        </Sidebar>
        <Sidebar.Pusher>
          <Segment basic >
            <div style={{ display: showDetails || showForm ? 'none' : 'block' }}>
            {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
            )}
            <Header as='h2'  textAlign='center'>{title}</Header>
              <FullCalendar
                initialDate={initialDate || new Date()}
                height="auto"
                loading={(isLoading) => setIsLoading(isLoading)}
                ref={calendarRef}
                plugins={[listPlugin]}
                events={`${process.env.REACT_APP_API_URL}/activities/GetInternationalFellowsCalendarEventsByDate/true`}
                datesSet={handleDatesSet}
                eventClick={handleEventClick}
                initialView={view}
                key={studentCategories.map(category => category.isSelected).join(',')}
                headerToolbar={{
                  left: "prev,next",
                  center: "",
                  right: "customMonth,customWeek,customDay,customBookARoom"
                }}
                customButtons={{
                  customMonth: {
                    text: "M",
                    click: () => {
                      handleButtonClick();
                      if (calendarRef.current) {
                        calendarRef.current.getApi().changeView('listMonth');
                      }
                    }
                  },
                  customWeek: {
                    text: "W",
                    click: () => {
                      handleButtonClick();
                      if (calendarRef.current) {
                        calendarRef.current.getApi().changeView('listWeek');
                      }
                    }
                  },
                  customDay: {
                    text: "D",
                    click: () => {
                      handleButtonClick();
                      if (calendarRef.current) {
                        calendarRef.current.getApi().changeView('listDay');
                      }
                    }
                  },
                  customBookARoom: {
                    text: "Add Event",
                    click: () => {
                       setShowForm(true);
                    }
                  },
                }}
                views={{
                  customMonth: {
                    type: "listMonth",
                    title: "Month",
                    buttonText: "Month"
                  },
                  customWeek: {
                    type: "listWeek",
                    title: "Week",
                    buttonText: "Week"
                  },
                  customDay: {
                    type: "listDay",
                    title: "Day",
                    buttonText: "Day"
                  }
                }}
                slotMinTime={"07:00:00"}
                slotMaxTime={"21:00:00"}
                eventDisplay={'block'}
                eventDidMount={eventDidMount}
              />
            </div>
            {loadingEvent &&  <Loader size='small' active inline>Loading ...</Loader> }
            {showDetails && !loadingEvent && <InternationalFellowsEventDetails eventInfo={eventInfo} setShowDetailsFalse = {setShowDetailFalse} /> }
            {showForm &&  <InternationalFellowsAddEvent  setShowFormFalse = {setShowFormFalse} /> }
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
      </>
    ) 
}