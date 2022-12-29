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

    const handleMouseEnter = async (arg : any) =>{
      let content =  `<p><strong> 
      ${ 
        arg.event.allDay ?
        format(arg.event.start, 'MM/dd') :
        format(arg.event.start, 'h:mm aa')} - ${format(arg.event.end, 'h:mm aa')
      }</strong></p>             
      <p> <span>${arg.event.title}</span></p>
      ${arg.event.backgroundColor === 'Green' ? '(Reservation Approved)' : '(Reservation Pending)'}`;

     var tooltip : any = tippy(arg.el, {     
      content,
      allowHTML: true,
    });

      try {
        const activity =  await getActivityIdByRoom( arg.event.title, arg.event.startStr, arg.event.endStr)
        if(activity && activity.id !== '00000000-0000-0000-0000-000000000000' ){
          const activityContent  = ` <p></p>
          ${activity.description ?'<p><strong>Description: <strong>' + activity.description + '</p>' : '' }
          ${activity.category ?'<p><strong>Sub Calendar: <strong>' + activity.category.name + '</p>' : '' }
          ${activity.organization?.name ? '<p><strong>Lead Org: <strong>' + activity.organization?.name + '</p>' : '' }
          ${activity.actionOfficer ? '<p><strong>Action Officer: <strong>' + activity.actionOfficer + '</p>' : ''}
          ${activity.actionOfficerPhone ?'<p><strong>Action Officer Phone: <strong>' + activity.actionOfficerPhone + '</p>' : ''}
           `;

          content = content + activityContent
          tooltip.setContent(content);
        }
      }
      catch (error) {
        console.log(error);
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