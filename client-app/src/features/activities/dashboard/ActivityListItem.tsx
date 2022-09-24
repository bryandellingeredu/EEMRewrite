import { Link } from "react-router-dom";
import { Button,  Icon, Item,  Label,  Segment, SegmentGroup } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useState, SyntheticEvent } from "react";
import { Activity } from "../../../app/models/activity";
import { format } from "date-fns";
import { faChurch } from "@fortawesome/free-solid-svg-icons";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faCircle } from "@fortawesome/free-regular-svg-icons";



interface Props{
    activity: Activity
}

export default function ActivityListItem({activity}:Props){

    const {activityStore} = useStore();
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

              {activity.category.name === 'Academic Calendar' &&
              <Label color='teal'>
                     <FontAwesomeIcon icon={faGraduationCap} size='3x' />
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
                    <Item.Header as={Link} to={`/activities/${activity.id}/${activity.categoryId}`}>
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
        {activity.category.name === 'Academic Calendar' && 
        <Button
                    name={activity.id}
                    onClick={(e) =>handleAcademicCalendarDelete(e, activity.id)}
                    floated='right'
                    content='Delete'
                    color='red'
            loading={loading && target === activity.id}/> }
            <Button as={Link} to={`/activities/${activity.id}/${activity.categoryId}`}
                 floated='right' content='View' color='blue'/>

      </Segment>
      </SegmentGroup>
    )
}