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
import ReactDOM from 'react-dom';
import { BackToCalendarInfo } from "../../app/models/backToCalendarInfo";
import { Divider, Header, Loader } from "semantic-ui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import ResidentAndDistanceStudentCalendarComponent from "./ResidentAndDistanceStudentCalendarCategoryComponent";
import LoadingComponent from "../../app/layout/LoadingComponent";

interface ResidentAndDistanceStudentCalendarCategory{
    id: number
    isSelected: boolean
    group: string
    title: string
    color: string
}

export default function ResidentAndDistanceStudentCalendar(){ const history = useHistory();
const { backToCalendarStore, categoryStore, activityStore } = useStore();
const { categories, loadingInitial } = categoryStore;
const {addBackToCalendarInfoRecord, getBackToCalendarInfoRecord} = backToCalendarStore;
const {addCalendarEventParameters} = activityStore;

const [studentCategories, setStudentCategories] = useState<ResidentAndDistanceStudentCalendarCategory[]>(
    localStorage.getItem("studentCategories") 
        ? JSON.parse(localStorage.getItem("studentCategories") || '{}') 
        : [ 
            {id: 1, isSelected: true, group: '', title: 'Show All', color: '#00008B'},
            {id: 2, isSelected: false, group: 'studentCalendarResident', title: 'Resident', color: '#006400'},
            {id: 3, isSelected: false, group: 'studentCalendarDistanceGroup1', title: 'Distance (FY 2024)', color: '#FF8C00'},
            {id: 4, isSelected: false, group: 'studentCalendarDistanceGroup2', title: 'Distance (FY 2025)', color: '#EE4B2B'},
            {id: 5, isSelected: false, group: 'studentCalendarDistanceGroup3', title: 'Distance (FY 2026)', color: '#800080'},
        ]
);
const [initialDate, setInitialDate] = useState<Date | null>(null);
const { backToCalendarId } = useParams<{ backToCalendarId?: string }>();
const [isInitialDateSet, setIsInitialDateSet] = useState(false);
const calendarRef = useRef<FullCalendar>(null);
const [height, setHeight] = useState(window.innerHeight - 200);
const [view, setView] = useState(localStorage.getItem("residentAndDistanceStudentCalendarView") || "timeGridWeek");
const [isLoading, setIsLoading] = useState(true);

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
    localStorage.setItem("studentCategories", JSON.stringify(updatedCategories));
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


return(
    <>
     {loadingInitial
        && <LoadingComponent content='Loading Calendar' />
      }
      {!loadingInitial && 
      <>
    <Divider horizontal>
        <Header as='h2'>
       <FontAwesomeIcon icon={faGraduationCap} size='2x' style={{marginRight: '10px'}} />
          Student Calendar
          </Header>
    </Divider>
    <Header as='h3' textAlign="center">
            Check or Uncheck Which Categories Should Appear on The Student Calendar
        </Header>

       {isLoading && (
         <Loader active size='large' style={{marginTop: '100px'}}>
           Loading events...
         </Loader>
        )}
    <div>
    {studentCategories.map(studentCategory => (
      <ResidentAndDistanceStudentCalendarComponent key={studentCategory.id}
      studentCategory = {studentCategory}
      handleLabelClick = {handleLabelClick} />
    ))}
    </div>

    <FullCalendar
      initialDate={initialDate || new Date()}
      ref={calendarRef}
      height={height}
      key={studentCategories.map(category => category.isSelected).join(',')}
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
      datesSet={(arg) => {
        // Save the user's view selection
        localStorage.setItem("residentAndDistanceStudentCalendarView", arg.view.type);
        setView(arg.view.type);
      }}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      events={`${process.env.REACT_APP_API_URL}/activities/getEventsByDate/residentAndDistanceStudentCalendar`}
      slotMinTime={"07:00:00"}
      slotMaxTime={"21:00:00"}
      loading={(isLoading) => setIsLoading(isLoading)}

      eventDidMount={(info: any) => {
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
            const eventDot = info.el.querySelector('.fc-daygrid-event-dot');
            if (eventDot) {
                eventDot.style.borderColor = eventColor;
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
        }
    }}
    />
     </>
  }
    </>
)
}