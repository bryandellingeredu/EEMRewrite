import { observer } from "mobx-react-lite";
import FullCalendar, {EventClickArg } from "@fullcalendar/react";
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
import { Divider, Header, Icon, Label, Loader } from "semantic-ui-react";
import { Category } from "../../app/models/category";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import BackToCalendarStore from "../../app/stores/backToCalendarStore";
import { BackToCalendarInfo } from "../../app/models/backToCalendarInfo";

interface CategoryWithSelected extends Category {
  selected: boolean;
}


export default observer(function customCalendar() {
  const [categoriesWithSelected, setCategoriesWithSelected] = useState<CategoryWithSelected[]>([]);
  const { categoryStore, backToCalendarStore } = useStore();
  const {addBackToCalendarInfoRecord, getBackToCalendarInfoRecord} = backToCalendarStore;
  const [isInitialDateSet, setIsInitialDateSet] = useState(false);
  const { categories, loadingInitial } = categoryStore;
  const [view, setView] = useState(localStorage.getItem("calendarViewCustom") || "timeGridWeek");
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const { activityStore } = useStore();
  const { addCalendarEventParameters } = activityStore;
  const { backToCalendarId } = useParams<{ backToCalendarId?: string }>();
  const [initialDate, setInitialDate] = useState<Date | null>(null);

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const backToCalendarInfo : BackToCalendarInfo = {
        id: uuid(),
        goToDate: clickInfo.event.start || new Date(),
        url: `${process.env.PUBLIC_URL}/customcalendar`
      };
      addBackToCalendarInfoRecord(backToCalendarInfo);
      history.push(
        `${process.env.PUBLIC_URL}/activities/${clickInfo.event.id}/${clickInfo.event.extendedProps.activityCategoryId}/${backToCalendarInfo.id}`
      );
    },
    [history]
  );
  

  const [height, setHeight] = useState(window.innerHeight - 200);

  const calendarRef = useRef<FullCalendar>(null);

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


  useEffect(() => {
    // Initialize or update the categories
    if (!categories.length) {
      categoryStore.loadCategories().then(() => {
        // Retrieve selected states from localStorage
        const storedCategories = localStorage.getItem("categoriesWithSelected");
        if (storedCategories) {
          setCategoriesWithSelected(JSON.parse(storedCategories));
        } else {
          // Initialize selected states
          const newCategories = categories.map(category => ({
            ...category,
            selected: false
          }));
          setCategoriesWithSelected(newCategories);
        }
      });
    } else {
      // Retrieve selected states from localStorage
      const storedCategories = localStorage.getItem("categoriesWithSelected");
      if (storedCategories) {
        setCategoriesWithSelected(JSON.parse(storedCategories));
      } else {
        // Initialize selected states
        const newCategories = categories.map(category => ({
          ...category,
            selected: false
        }));
        setCategoriesWithSelected(newCategories);
      }
    }

 
  }, [categories.length, categoriesWithSelected]);


  const handleDateClick = useCallback(
    (info: any) => {

      const backToCalendarInfo : BackToCalendarInfo = {
        id: uuid(),
        goToDate: info.date,
        url: `${process.env.PUBLIC_URL}/customcalendar`
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
      
      addCalendarEventParameters({
        id: paramId,
        allDay: false,
        dateStr: formattedDate,
        date: new Date(adjustedDate),
        categoryId: "",
        needRoom: false,
      });
      history.push(
        `${process.env.PUBLIC_URL}/createActivityWithCalendar/${paramId}/${backToCalendarInfo.id}`
      );
    },
    [addCalendarEventParameters, history]
  );

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

  const  handleMouseEnter = async (arg : any) =>{
    var content = `<p> ${ getTime(arg)}</p>               
    <p> <strong>Title: </strong> ${arg.event.title} </p>
    ${arg.event.extendedProps.description ? '<p><strong>Description: </strong>' + arg.event.extendedProps.description + '</p>' : '' }
    ${arg.event.extendedProps.primaryLocation ? '<p><strong>Location: </strong>' + arg.event.extendedProps.primaryLocation + '</p>' : '' }
    ${arg.event.extendedProps.leadOrg ? '<p><strong>Lead Org: </strong>' + arg.event.extendedProps.leadOrg + '</p>' : '' }
    ${arg.event.extendedProps.actionOfficer ? '<p><strong>Action Officer: </strong>' + arg.event.extendedProps.actionOfficer + '</p>' : ''}
    ${arg.event.extendedProps.actionOfficerPhone ? '<p><strong>Action Officer Phone: </strong>' + arg.event.extendedProps.actionOfficerPhone + '</p>' : ''}
    ${arg.event.extendedProps.categoryName ? '<p><strong>Sub Calendar: </strong>' + (arg.event.extendedProps.categoryName === 'Academic IMC Event' ? 'Faculty Calendar' : arg.event.extendedProps.categoryName === 'Military Family and Spouse Program' ? 'Military Spouse and Family Program':  arg.event.extendedProps.categoryName === 'SSL Calendar' ? 'SSL Admin Calendar' : arg.event.extendedProps.categoryName) + '</p>' : ''}
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
          content = content + '<p><strong>Room(s): <strong>' + response + '</p>';
          tooltip.setContent(content);
        }
      
    }
    catch (error) {
      console.log(error);
    }
  }
}



const handleLabelClick = (id: string) => {
  const newCategories = categoriesWithSelected.map(category =>
    category.id === id
      ? { ...category, selected: !category.selected }
      : category
  );
  setCategoriesWithSelected(newCategories);

  // Store selected states in localStorage
  localStorage.setItem("categoriesWithSelected", JSON.stringify(newCategories));
};


  return (
    <>
       <Divider horizontal>
        <Header as='h2'>

              <FontAwesomeIcon icon={faCog} size='2x' style={{marginRight: '10px'}} />
             Customizable Calendar
        </Header>
        </Divider>

        <Header as='h3' textAlign="center">
            Check or Uncheck Which Categories Should Appear on Your Custom Calendar
        </Header>

       {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}

<div>
        {categoriesWithSelected.filter(x => x.imcColor && x.imcColor.length)
        .filter(
          (item) =>
            item.name !== "PKSOI Calendar" && item.name !== "Staff Calendar" && item.name !== "Other"
        ).map(category => (
          <Label size="large"
            key={category.id} 
            style={{backgroundColor: category.imcColor, color: 'white', marginBottom: '5px'}}
            onClick={() => handleLabelClick(category.id)}
          >
            <Icon name={category.selected ? 'check square outline' : 'square outline'} size="large" />
            {category.name === 'Academic IMC Event'? 'Faculty Calendar' : 
            category.name === 'Military Family and Spouse Program'? 'Military Spouse and Family Program' : 
             category.name === 'SSL Calendar'? 'SSL Admin Calendar' : category.name}
          </Label>
      ))}
      </div>


   <FullCalendar
    initialDate={initialDate || new Date()}
      ref={calendarRef}
      height={height}
      key={categoriesWithSelected.map(category => category.selected).join(',')}
      initialView={view}
      headerToolbar={{
        left: "prev,next",
        center: "title",
        right: "datepicker,dayGridMonth,timeGridWeek,timeGridDay",
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
      }}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      events={`${process.env.REACT_APP_API_URL}/activities/getAllEventsByDate`}
      eventMouseEnter={handleMouseEnter}
      eventClick={handleEventClick}
      dateClick={handleDateClick}
      slotMinTime={"07:00:00"}
      slotMaxTime={"21:00:00"}
      loading={(isLoading) => setIsLoading(isLoading)}
      eventDidMount={( info : any )  => {
        const selectedCategoryIds = categoriesWithSelected.filter(category => category.selected).map(category => category.id);
        if (!selectedCategoryIds.includes(info.event.extendedProps.categoryId)) {
          // Hide the event if its category is not selected
          info.el.style.display = 'none';
        }else{
        const eventColor = info.event.backgroundColor;
        const eventDot = info.el.querySelector('.fc-daygrid-event-dot');
        const recurring = info.event.extendedProps.recurring;
        const teamInd = info.event.extendedProps.teamInd;
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
        if (teamInd) {
          const eventContent = info.el.querySelector('.fc-event-title');
          if (eventContent) {
            const icon = document.createElement('i');
            icon.className = 'tv icon'; // The Semantic UI class for the repeating icon
            eventContent.prepend(icon);
          }
        }
      }
      }} 
      datesSet={(arg) => {
        // Save the user's view selection
        localStorage.setItem("calendarViewCustom", arg.view.type);
        setView(arg.view.type);
      }}
    
    />
    </>
  )
})