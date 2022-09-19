import { Link } from "react-router-dom";
import { Button, Container, Icon, Item,  Label,  Segment, SegmentGroup } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useState, SyntheticEvent } from "react";
import { Activity } from "../../../app/models/activity";
import { format } from "date-fns";


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
              <Icon circular inverted color='teal' name='graduation cap' size='big' />} 
              {activity.category.name === 'CSL Calendar' && 
                <Icon circular inverted color='violet' name='copyright' size='big' />} 
                            
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
        <Segment>
                <Icon name='clock'/>
                {format(activity.start, 'MMMM d, yyyy h:mm aa')} - 
                {format(activity.end, 'MMMM d, yyyy h:mm aa')}
                </Segment>
                <Segment>
             <Icon name='marker' style={{marginLeft: '10'}}/> Unites States Army War College
             </Segment>
    
        <Segment secondary>
          attendees go here
        </Segment>
        <Segment clearing>
            <span>{activity.description}</span>
        </Segment>
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