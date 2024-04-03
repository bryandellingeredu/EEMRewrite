import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import { useState,  useRef, useEffect } from "react";
import { EventClickArg } from "@fullcalendar/core";
import { Button, Divider, Form, Header, Icon, Input, Label, Loader, Message } from "semantic-ui-react";
import { DatesSetArg } from '@fullcalendar/common';
import { format } from 'date-fns';
import agent from "../../app/api/agent";
import StudentCalendarEventDetails from "./studentCalendarEventDetails";
import { toast } from "react-toastify";
import { useStore } from "../../app/stores/store";
import { observer } from 'mobx-react-lite';
import ResidentAndDistanceStudentCalendarComponent from "../fullCalendar/ResidentAndDistanceStudentCalendarCategoryComponent";

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
  }
  

export default observer(function MobileStudentCalendar (){
  const { userStore, navbarStore} = useStore();
  const {setPage} = navbarStore
  const {user, setStudentType} = userStore
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const calendarRef = useRef<FullCalendar>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showCalendar, setShowCalendar] = useState(true);
    const [view, setView] = useState(localStorage.getItem("calendarViewSCM") || "listWeek");
    const [title, setTitle] = useState("");
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

      const setShowDetailFalse = () =>{
        setShowDetails(false);
      }

    const eventDidMount = (info : any) => {

      const selectedstudentCategories = studentCategories.filter(category => category.isSelected);

      let shouldDisplayEvent = (
        (selectedstudentCategories.some(category => category.id === 2) && info.event.extendedProps.studentCalendarResident) ||
        (selectedstudentCategories.some(category => category.id === 3) && info.event.extendedProps.studentCalendarDistanceGroup1) ||
        (selectedstudentCategories.some(category => category.id === 4) && info.event.extendedProps.studentCalendarDistanceGroup2) ||
        (selectedstudentCategories.some(category => category.id === 5) && info.event.extendedProps.studentCalendarDistanceGroup3) ||
        (
          selectedstudentCategories.some(category => category.id === 2) &&
           (!info.event.extendedProps.studentCalendarResident &&
            !info.event.extendedProps.studentCalendarDistanceGroup1 &&
            !info.event.extendedProps.studentCalendarDistanceGroup2 &&
            !info.event.extendedProps.studentCalendarDistanceGroup3)
        )
    );

    if (selectedstudentCategories.some(category => category.id === 1)) {
      shouldDisplayEvent = true;
    }
    
    if (selectedstudentCategories.length < 1) {
      shouldDisplayEvent = true;
    }
     
    if (!shouldDisplayEvent) {
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
              icon.className = 'exclamation triangle icon'; // The Semantic UI class for the exclamation triangle icon
              eventContent.prepend(icon);
          }
        }
      }
    };



    
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
                { id: 1, isSelected: true, group: '', title: 'Show All', color: '#00008B' },
                { id: 2, isSelected: false, group: 'studentCalendarResident', title: 'Resident', color: '#006400' },
                { id: 3, isSelected: false, group: 'studentCalendarDistanceGroup1', title: 'DEP 2024', color: '#FF8C00' },
                { id: 4, isSelected: false, group: 'studentCalendarDistanceGroup2', title: 'DEP 2025', color: '#EE4B2B' },
                { id: 5, isSelected: false, group: 'studentCalendarDistanceGroup3', title: 'DEP 2026', color: '#800080' },
              ]);
            }
          } else {
            setShowLabels(false);
            setStudentCategories([
              { id: 1, isSelected: false, group: '', title: 'Show All', color: '#00008B' },
              { id: 2, isSelected: user.studentType === "Resident", group: 'studentCalendarResident', title: 'Resident', color: '#006400' },
              { id: 3, isSelected: user.studentType === "DL24", group: 'studentCalendarDistanceGroup1', title: 'DEP 2024', color: '#FF8C00' },
              { id: 4, isSelected: user.studentType === "DL25", group: 'studentCalendarDistanceGroup2', title: 'DEP 2025', color: '#EE4B2B' },
              { id: 5, isSelected: user.studentType === "DL26", group: 'studentCalendarDistanceGroup3', title: 'DEP 2026', color: '#800080' },
            ]);
          }
        }
      }
    }, [user, user?.studentType]);

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

    return (
        <>
        {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}
<Header as='h2' textAlign='center'>{title}</Header>
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
{ showCalendar && 
<>

{showLabels && !showDetails &&
       <>
        <Header as='h3' textAlign="center">
                Check or Uncheck Which Categories Should Appear on The Student Calendar
            </Header>
              <div>
              {studentCategories.map(studentCategory => (
                <ResidentAndDistanceStudentCalendarComponent key={studentCategory.id}
                studentCategory = {studentCategory}
                handleLabelClick = {handleLabelClick} />
              ))}
                 <Label size='large'  color='teal'>
              <Icon name='exclamation triangle'/> Mandatory
            </Label>
              </div>
              </>
        }

<div style={{ display: showDetails ? 'none' : 'block'}}>
<FullCalendar
  initialDate={initialDate || new Date()}
      height="auto"
      loading={(isLoading) => setIsLoading(isLoading)}
      ref={calendarRef}
      plugins={[listPlugin]}
      events={`${process.env.REACT_APP_API_URL}/activities/getStudentCalendarEventsByDate`}
        datesSet={handleDatesSet}
      eventClick={handleEventClick}
      initialView={view}
      key={studentCategories.map(category => category.isSelected).join(',')}
      headerToolbar={{
        left: "prev,next",
        center: "",
        right: "customMonth,customWeek,customDay,customBookARoom,customSubscribe"
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
  customSubscribe: {
    text: "Subscribe",
    click: () => {
      setShowCalendar(!showCalendar);
    }
  },
  customBookARoom: {
    text: "Book Room",
    click: () => {
      setPage("bookRoom");
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
    </>
}
{loadingEvent &&  <Loader size='small' active inline>Loading ...</Loader> }

{showDetails && !loadingEvent && <StudentCalendarEventDetails eventInfo={eventInfo} setShowDetailsFalse = {setShowDetailFalse} /> }
         </>
    )

})