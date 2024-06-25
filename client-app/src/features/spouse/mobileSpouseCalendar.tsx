import FullCalendar from "@fullcalendar/react";
import listPlugin from '@fullcalendar/list';
import { useState,  useRef, useEffect } from "react";
import { EventClickArg } from "@fullcalendar/core";
import { Divider, Header, Icon, Label, Loader } from "semantic-ui-react";
import { DatesSetArg } from '@fullcalendar/common';
import { format } from 'date-fns';
import agent from "../../app/api/agent";
import SpouseCalendarEventDetails from "./spouseCalendarEventDetails";

interface EventInfo{
    title: string
    time: string
    location: string
    description: string
    leadOrg: string
    actionOfficer: string
    actionOfficerPhone: string
    spouseCategory: string
    hyperLink: string
    hyperLinkDescription: string
  }

  interface SpouseCategory{
    id: number
    isSelected: boolean
    title: string
    color: string
  }

  export default function MobileSpouseCalendar (){
    const [spouseCategories, setSpouseCategories] = useState<SpouseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const calendarRef = useRef<FullCalendar>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [view, setView] = useState(localStorage.getItem("calendarViewSpouseMobile") || "listMonth");
    const [title, setTitle] = useState("");
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
            const eventDot = info.el.querySelector('.fc-list-event-dot');
        
            if (eventDot) {
                eventDot.style.borderColor = eventColor;
            }
        };
        
        const setShowDetailFalse = () =>{
            setShowDetails(false);
          }
        
    const handleButtonClick = () => {
        setShowDetails(false);
      };

        const handleDatesSet = (arg: DatesSetArg) => {
            localStorage.setItem("calendarViewSpouseMobile", arg.view.type);
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

          return (
            <>
            {isLoading && (
             <Loader active size='large' style={{marginTop: '100px'}}>
               Loading events...
             </Loader>
            )}
    <Header as='h2' textAlign='center'>{title}</Header>
    <div style={{ display: showDetails ? 'none' : 'block'}}>
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
    
    <FullCalendar
          key={spouseCategories.map(category => category.isSelected).join(',')}
             height={"60.00vh"}
          loading={(isLoading) => setIsLoading(isLoading)}
          ref={calendarRef}
          plugins={[listPlugin]}
          events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/spouse`}
            datesSet={handleDatesSet}
          eventClick={handleEventClick}
          initialView={view}
          headerToolbar={{
            left: "prev,next",
            center: "",
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
        </div>
    {loadingEvent &&  <Loader size='small' active inline>Loading ...</Loader> }
    
    {showDetails && !loadingEvent && <SpouseCalendarEventDetails eventInfo={eventInfo} setShowDetailsFalse = {setShowDetailFalse}/> }
             </>
        )
  }