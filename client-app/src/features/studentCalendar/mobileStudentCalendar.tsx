import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import { useState,  useRef } from "react";
import { EventClickArg } from "@fullcalendar/core";
import { Button, Divider, Form, Header, Icon, Input, Label, Loader, Message } from "semantic-ui-react";
import { DatesSetArg } from '@fullcalendar/common';
import { format } from 'date-fns';
import agent from "../../app/api/agent";
import StudentCalendarEventDetails from "./studentCalendarEventDetails";
import { toast } from "react-toastify";

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
  }

export default function MobileStudentCalendar (){
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
        }
        )
      const [loadingEvent, setLoadingEvent] = useState(false);

    const eventDidMount = (info : any) => {
        const eventColor = info.event.backgroundColor;
        const eventDot = info.el.querySelector('.fc-list-event-dot');
    
        if (eventDot) {
            eventDot.style.borderColor = eventColor;
        }
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
            teamLink: clickInfo.event.extendedProps.teamLink
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
<FullCalendar
         height={"60.00vh"}
      loading={(isLoading) => setIsLoading(isLoading)}
      ref={calendarRef}
      plugins={[listPlugin]}
      events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/studentCalendar`}
        datesSet={handleDatesSet}
      eventClick={handleEventClick}
      initialView={view}
      headerToolbar={{
        left: "prev,next",
        center: "",
        right: "customMonth,customWeek,customDay,customSubscribe"
      }}
customButtons={{
  customMonth: {
    text: "Month",
    click: () => {
      handleButtonClick();
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView('listMonth');
      }
    }
  },
  customWeek: {
    text: "Week",
    click: () => {
      handleButtonClick();
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView('listWeek');
      }
    }
  },
  customDay: {
    text: "Day",
    click: () => {
      handleButtonClick();
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView('listDay');
      }
    }
  },
  customSubscribe: {
    text: "Subscribe To Changes",
    click: () => {
      setShowCalendar(!showCalendar);
    }
  }
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
}
{loadingEvent &&  <Loader size='small' active inline>Loading ...</Loader> }

{showDetails && !loadingEvent && <StudentCalendarEventDetails eventInfo={eventInfo} /> }
         </>
    )

}