import { observer } from "mobx-react-lite";
import { Divider, Header, Popup } from "semantic-ui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleRoof } from "@fortawesome/free-solid-svg-icons";
import { useStore } from "../../app/stores/store";
import { useCallback, useEffect, useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { GraphRoom } from "../../app/models/graphRoom";
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';


export default observer(function RoomCalendar() {
    const { id } = useParams<{ id: string }>();
    const {graphRoomStore, activityStore, categoryStore} = useStore();
    const{loadingInitial, graphRooms, loadGraphRooms} = graphRoomStore;
    const { categories } = categoryStore;
    const{ getActivityIdByRoom } = activityStore;
    const history = useHistory();
    const[graphRoom, setGraphRoom] = useState<GraphRoom>({
        address: {
            city: '',
            countryOrRegion: '',
            postalCode: '',
            state: '',
            street: '',
        },
displayName: '',
phone: '',
id: '',
emailAddress: '',
capacity: '',
bookingType: '',
tags: [],
building: '',
floorNumber: null,
label: '',
audioDeviceName: '',
videoDeviceName: '',
displayDeviceName: '',
isWheelChairAccessible: ''
    });

    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
      console.log(clickInfo);
      getActivityIdByRoom( clickInfo.event.title, clickInfo.event.startStr, clickInfo.event.endStr).then((activity) => {
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
          const category = categories.find(x => x.id === activity.categoryId);
          history.push(`${process.env.PUBLIC_URL}/activities/${activity.id}/${category?.id}`);
        }
      });
    }, [categories, history]);

    const handleMouseEnter = (arg : any) =>{
      tippy(arg.el, {
        content: `<strong> 
        ${ 
          arg.event.allDay ?
          format(arg.event.start, 'MM/dd') :
          format(arg.event.start, 'h:mm aa')} - ${format(arg.event.end, 'h:mm aa')
        }</strong>              
        <p> <span>${arg.event.title}</span></p>
        ${arg.event.color === 'Green' ? '(Reservation Approved)' : '(Reservation Pending)'}`,
        allowHTML: true,
      });
  }

    function renderEventContent(info : any) {
      if(info.view.type === 'dayGridMonth' && !info.event.allDay)
      {
     return (
        <Popup
         content={info.event.title}
         header={info.event.allDay ? `${format(info.event.start, 'MM/dd')} ${info.event.color === 'Green' ? '(Reservation Approved)' : '(Reservation Pending)'}` : 
         `${format(info.event.start, 'h:mm aa')} - ${format(info.event.end, 'h:mm aa')}  ${info.event.color === 'Green' ? '(Reservation Approved)' : '(Reservation Pending)'}`}
         trigger={
            <Header size='tiny'
            color={info.event.allDay ? 'yellow': info.event.color === 'Green' ? 'green' : 'orange'}
             content={`${info.timeText} ${info.event.title}`}
            style={{overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer'}}
            />} />
      )
    }
    }
    
  useEffect(() => {
    if(!graphRooms.length){
        loadGraphRooms().then((rooms) =>{
            if(rooms && rooms.length){              
                const room  = rooms.find(x => x.id === id) as GraphRoom;
                setGraphRoom(room);
            } 
        });
    } 
    else {
        const room  = graphRooms.find(x => x.id === id) as GraphRoom;
        setGraphRoom(room);
    }
  }, [loadGraphRooms, graphRooms.length, id])

    return(
        <>
        {loadingInitial
            &&<LoadingComponent content = 'Loading Room Calendar'/>}
   
        <Divider horizontal>
        <Header as='h2'>

              <FontAwesomeIcon icon={faPeopleRoof} size='2x' style={{marginRight: '10px'}} />
              {graphRoom.displayName}

        </Header>
      </Divider>

      <FullCalendar
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            plugins={[dayGridPlugin, timeGridPlugin]}
            eventClick={handleEventClick}
            events={`${process.env.REACT_APP_API_URL}/roomEvents/${id}`}
            eventMouseEnter={handleMouseEnter}
            //eventContent={renderEventContent}  
          />
      </>
    )

});