import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import { useState,  useRef } from "react";
import { EventClickArg } from "@fullcalendar/core";
import { Button, Divider, Header, Icon, Loader } from "semantic-ui-react";
import { EnlistedAideMobileDetails } from "../../app/models/enlistedAideMobileDetails";
import EnlistedAideEventDetails from "./enlistedAideEventDetails";
import { useStore } from '../../app/stores/store';
import SyncCalendarInformation from '../fullCalendar/SyncCalendarInformation';


export default function MobileEnlistedAideCalendar (){
  const { modalStore } = useStore();
  const {openModal} = modalStore;
    const [isLoading, setIsLoading] = useState(true);
    const calendarRef = useRef<FullCalendar>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [details, setDetails] = useState<EnlistedAideMobileDetails>(
        {activityId: '', categoryId: '',  title: '',  task: '', duration: '',
         allDayEvent: false, start: new Date(), end: new Date(),
         enlistedAideFundingType : '',
         enlistedAideVenue : '',
         enlistedAideGuestCount : '',
         enlistedAideCooking : '',
         enlistedAideDietaryRestrictions : '',
         enlistedAideAlcohol : '',
         enlistedAideNumOfBartenders : '',
         enlistedAideNumOfServers : '',
         enlistedAideSupportNeeded : ''
        })

        const getDuration =  (startStr: string, endStr: string, allDay: boolean): string  => {
            const start = new Date(startStr);
            if (allDay) {
              start.setDate(start.getDate() + 1);
            }
            const end = new Date(endStr);
            const formatterDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' });
            const startDate : string = formatterDate.format(start);
            const endDate : string = formatterDate.format(end);
            if(allDay){
              if(startDate === endDate) return startDate;
              return `${startDate} - ${endDate}`;   
            }else{
              const formatterTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute:'numeric', hour12: true });
              const formattedStartedTime = formatterTime.format(start);
              const formattedEndTime = formatterTime.format(end);
              return (startDate === endDate) ? `${startDate} ${formattedStartedTime} - ${formattedEndTime}` : `${startDate} ${formattedStartedTime} - ${endDate} ${formattedEndTime}` 
            }
          }

        const handleEventClick = (clickInfo: EventClickArg) => {
            setShowDetails(true);
            console.log(clickInfo.event);
            setDetails({
              title: clickInfo.event.extendedProps.eventTitle,
              duration: getDuration(clickInfo.event.startStr, clickInfo.event.endStr, clickInfo.event.allDay),
              allDayEvent: clickInfo.event.allDay,
              start: clickInfo.event.start ? clickInfo.event.start : new Date() ,
              end: clickInfo.event.end ? clickInfo.event.end : new Date(),
              activityId: clickInfo.event.extendedProps.activityId,
              categoryId: clickInfo.event.extendedProps.categoryId,
              task: clickInfo.event.extendedProps.task,
              enlistedAideFundingType : clickInfo.event.extendedProps.enlistedAideFundingType,
              enlistedAideVenue : clickInfo.event.extendedProps.enlistedAideVenue ,
              enlistedAideGuestCount : clickInfo.event.extendedProps.enlistedAideGuestCount,
              enlistedAideCooking : clickInfo.event.extendedProps.enlistedAideCooking,
              enlistedAideDietaryRestrictions : clickInfo.event.extendedProps.enlistedAideDietaryRestrictions,
              enlistedAideAlcohol : clickInfo.event.extendedProps.enlistedAideAlcohol,
              enlistedAideNumOfBartenders : clickInfo.event.extendedProps.enlistedAideNumOfBartenders,
              enlistedAideNumOfServers : clickInfo.event.extendedProps.enlistedAideNumOfServers,
              enlistedAideSupportNeeded : clickInfo.event.extendedProps.enlistedAideSupportNeeded
              }
              )
          } 

    const handleDatesSet = () => {
        handleButtonClick();
      }

      const handleButtonClick = () => {
        setShowDetails(false);
      };

      const eventDidMount = (info : any) => {
        const eventColor = info.event.backgroundColor;
        const eventDot = info.el.querySelector('.fc-list-event-dot');
    
        if (eventDot) {
            eventDot.style.borderColor = eventColor;
        }
    };
    return(
        <>
                <Button icon  floated="right" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SyncCalendarInformation
                routeName={'enlistedAide'}
                showSyncInfo={true}
              />, 'large'
            )
          }
        >
      <Icon name='sync'/>
       &nbsp; Sync To My Calendar
    </Button>
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
         height={"60.00vh"}
      loading={(isLoading) => setIsLoading(isLoading)}
      ref={calendarRef}
      plugins={[listPlugin]}
      events={`${process.env.REACT_APP_API_URL}/enlistedAide/getEventsByDate`}
        datesSet={handleDatesSet}
      eventClick={handleEventClick}
      initialView="listMonth"
      headerToolbar={{
        left: "prev,next",
        center: "title",
        right: "customMonth,customWeek,customDay"
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
    {showDetails && <EnlistedAideEventDetails details={details} /> }
        </>
    )
}