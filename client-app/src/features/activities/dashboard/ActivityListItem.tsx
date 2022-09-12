import { Link } from "react-router-dom";
import { Button, Icon, Item,  Segment, SegmentGroup } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import { useStore } from "../../../app/stores/store";
import { useState, SyntheticEvent } from "react";


interface Props{
    activity: Activity
}

export default function ActivityListItem({activity}:Props){

    const {activityStore} = useStore();
    const {deleteActivity, loading} = activityStore;
    const [target, setTarget] = useState('');

    function handleActivityDelete(e: SyntheticEvent<HTMLButtonElement>, id: string){
        setTarget(e.currentTarget.name);
        deleteActivity(id);
      }

    return (
      <SegmentGroup>
        <Segment>
          <Item.Group>
            <Item>
              {activity.category === 'Academic Calendar' &&
              <Icon circular inverted color='teal' name='graduation cap' size='big' />}
            {activity.category !== 'Academic Calendar' &&
              <Icon circular inverted color='teal' name='building' size='big' />}                   
                <Item.Content>
                    <Item.Header as={Link} to={`/activities/${activity.id}/${activity.location?.locationUri}`}>
                    {activity.subject}
                    </Item.Header> 
                    <Item.Description> {activity.category}
                    </Item.Description>                 
                </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
        <Segment>
                <Icon name='clock'/>
                {new Date(activity.start.dateTime)
                    .toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                }
                &nbsp; - &nbsp;

                {

                    new Date(activity.start.dateTime).toLocaleDateString() ===
                        new Date(activity.end.dateTime).toLocaleDateString() ?
                        new Date(activity.end.dateTime)
                            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        :
                        new Date(activity.start.dateTime)
                            .toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                }
                </Segment>
                <Segment>
             <Icon name='marker' style={{marginLeft: '10'}}/> Unites States Army War College
             </Segment>
    
        <Segment secondary>
          attendees go here
        </Segment>
        <Segment clearing>
            <span>{activity.bodyPreview}</span>
        </Segment>
        <Segment clearing>
        <Button
                    name={activity.id}
                    onClick={(e) =>handleActivityDelete(e, activity.id)}
                    floated='right'
                    content='Delete'
                    color='red'
            loading={loading && target === activity.id}/>
            <Button as={Link} to={`/activities/${activity.id}/${activity.location?.locationUri}`}
                 floated='right' content='View' color='blue'/>

      </Segment>
      </SegmentGroup>
    )
}