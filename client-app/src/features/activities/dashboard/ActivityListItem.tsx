import { Link } from "react-router-dom";
import { Button,  Icon, Item,  Label,  Segment, SegmentGroup } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useState, SyntheticEvent } from "react";
import { Activity } from "../../../app/models/activity";
import { format } from "date-fns";
import { faBahai, faBook, faBookOpenReader, faBuilding, faBus, faCalendar, faChalkboardTeacher, faChurch, faDove, faO, faPersonRifle, faStar } from "@fortawesome/free-solid-svg-icons";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { faTree } from "@fortawesome/free-solid-svg-icons";
import { faChampagneGlasses } from "@fortawesome/free-solid-svg-icons";
import { faPersonMilitaryPointing } from "@fortawesome/free-solid-svg-icons";
import { faHandshake } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RecurrenceMessageWrapper from "../recurrenceMessage/RecurrenceMessageWrapper";
import { faNewspaper } from "@fortawesome/free-regular-svg-icons";

interface Props{
    activity: Activity
}

export default function ActivityListItem({activity}:Props){

    const {activityStore, modalStore} = useStore();
    const {deleteGraphEvent, loading} = activityStore;
    const [target, setTarget] = useState('');

    function handleAcademicCalendarDelete(e: SyntheticEvent<HTMLButtonElement>, id: string){
        setTarget(e.currentTarget.name);
        deleteGraphEvent(id);
      }

    return (
      <SegmentGroup>
           
        <Segment>
          <Item.Group>       
            <Item>
            {activity.category.name === 'SSL Calendar' &&
              <Label color='olive'>
                     <FontAwesomeIcon icon={faPersonRifle} size='3x' />
              </Label>
             }
            {activity.category.name === 'Weekly Pocket Calendar' &&
              <Label color='yellow'>
                     <FontAwesomeIcon icon={faCalendar} size='3x' />
              </Label>
             }
            {activity.category.name === 'Visits And Tours' &&
              <Label color='teal'>
                     <FontAwesomeIcon icon={faBus} size='3x' />
              </Label>
             }
            {activity.category.name === 'Training And Misc Events' &&
              <Label color='red'>
                     <FontAwesomeIcon icon={faChalkboardTeacher} size='3x' />
              </Label>
             }
            {activity.category.name === 'SSI And USAWC Press Calendar' &&
              <Label color='orange'>
                     <FontAwesomeIcon icon={faNewspaper} size='3x' />
              </Label>
             }
            {activity.category.name === 'PKSOI Calendar' &&
              <Label color='violet'>
                     <FontAwesomeIcon icon={faDove} size='3x' />
              </Label>
             }
            {activity.category.name === 'Other' &&
              <Label color='grey'>
                     <FontAwesomeIcon icon={faO} size='3x' />
              </Label>
             }
            {activity.category.name === 'General Interest' &&
              <Label color='purple'>
                     <FontAwesomeIcon icon={faBahai} size='3x' />
              </Label>
             }
            {activity.category.name === 'USAHEC Facilities Usage Calendar' &&
              <Label color='black'>
                     <FontAwesomeIcon icon={faBookOpenReader} size='3x' />
              </Label>
             }
            {activity.category.name === 'USAHEC Calendar' &&
              <Label color='green'>
                     <FontAwesomeIcon icon={faBook} size='3x' />
              </Label>
             }
            {activity.category.name === 'Garrison Calendar' &&
              <Label color='blue'>
                     <FontAwesomeIcon icon={faBuilding} size='3x' />
              </Label>
             }
            {activity.category.name === 'Complemenary Events' &&
              <Label color='olive'>
                     <FontAwesomeIcon icon={faStar} size='3x' />
              </Label>
             }
            {activity.category.name === 'Community Relations' &&
              <Label color='brown'>
                     <FontAwesomeIcon icon={faHandshake} size='3x' />
              </Label>
             }
            {activity.category.name === 'Command Group Calendar' &&
              <Label color='yellow'>
                     <FontAwesomeIcon icon={faPersonMilitaryPointing} size='3x' />
              </Label>
             }

              {activity.category.name === 'Academic Calendar' &&
              <Label color='teal'>
                     <FontAwesomeIcon icon={faGraduationCap} size='3x' />
              </Label>
             }

               {activity.category.name === 'Holiday Calendar' &&
              <Label color='red'>
                     <FontAwesomeIcon icon={faTree} size='3x' />
              </Label>
             }

            {activity.category.name === 'Social Events And Ceremonies' &&
              <Label color='orange'>
                     <FontAwesomeIcon icon={faChampagneGlasses} size='3x' />
              </Label>
             }

              {activity.category.name === 'CSL Calendar' && 
                  <Label color='violet'>
                  <h1>CSL</h1>
           </Label>} 
               {activity.category.name === 'ASEP Calendar' && 
                 <Label color='grey'>
                 <h1>ASP</h1>
                </Label>
               } 
              {activity.category.name === 'Chapel' && 
           

                <Label color='pink' >
               <FontAwesomeIcon icon={faChurch}
                size='3x' />
               </Label>
               }
                            
                <Item.Content>
                    <Item.Header as={Link} to={`${process.env.PUBLIC_URL}/activities/${activity.id}/${activity.categoryId}`}>
                    {activity.title}
                    </Item.Header> 
                    <Item.Description> {activity.category.name}
                    </Item.Description>                 
                </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
        {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
        <Segment>
                <Icon name='clock'/>
                {format(activity.start, 'MMMM d, yyyy h:mm aa')} - 
                {format(activity.end, 'MMMM d, yyyy h:mm aa')}
      </Segment>
       }
      {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
        <Segment>
                <Icon name='clock'/>
                {format(activity.start, 'MMMM d, yyyy h:mm aa')} - 
                {format(activity.end, 'h:mm aa')}
      </Segment>
       }
      {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
        <Segment>
                <Icon name='clock'/>
                {format(activity.start, 'MMMM d, yyyy')}
      </Segment>
       }
      {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
        <Segment>
                <Icon name='clock'/>
                {format(activity.start, 'MMMM d, yyyy')} - {format(activity.end, 'MMMM d, yyyy')}
      </Segment>
       }
       {activity.primaryLocation && 
          <Segment>
           <Icon name='marker' style={{marginLeft: '10'}}/>
          {activity.primaryLocation}
       </Segment>
       }
       {activity.activityRooms && activity.activityRooms.length > 0 && 
         <Segment>
         <Icon name='marker' style={{marginLeft: '10'}}/>
          {activity.activityRooms.map(x => x.name).join(', ')}
     </Segment>
       }
       { activity.category.name !== "Academic Calendar" && activity.organization && 
       <>
      <Segment>       
          <Icon name='boxes' style={{marginLeft: '10'}}/>
            Lead Org:  {activity.organization?.name}
      </Segment>
        <Segment>       
        <Icon name='user' style={{marginLeft: '10'}}/>
          Action Officer:  {activity.actionOfficer} {activity.actionOfficerPhone}
    </Segment>
    </>
       }
     { activity.description && 
        <Segment clearing>
            <span>{activity.description}</span>
        </Segment>
      }
        <Segment clearing>
        {activity.recurrenceInd && activity.recurrence &&
         <>
          <Button  icon color='blue'
           onClick={() => modalStore.openModal(
            <RecurrenceMessageWrapper
             recurrence = {activity.recurrence!}
             title = {activity.title}
            />)}
          >
          <FontAwesomeIcon icon={faRepeat} style={{paddingRight: '5px'}} />
          Repeating Event
         </Button>
         </>
         }
            <Button as={Link} to={`${process.env.PUBLIC_URL}/activities/${activity.id}/${activity.categoryId}`}
                 floated='right' content='View' color='blue'/>

      </Segment>
      </SegmentGroup>
    )
}