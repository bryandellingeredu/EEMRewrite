import { Link } from "react-router-dom";
import { Button, Item, Label } from "semantic-ui-react";
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
        <Item key={activity.id}>
        <Item.Content>
            <Item.Header as='a'>
                {activity.subject}
            </Item.Header>
            <Item.Meta>
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
            </Item.Meta>
            {activity.bodyPreview && (
            <Item.Description>
                <div>{activity.bodyPreview}</div>
            </Item.Description>
            )}
            <Item.Extra>
                <Button as={Link} to={`/activities/${activity.id}`}
                 floated='right' content='View' color='blue'/>
                  <Button
                    name={activity.id}
                    onClick={(e) =>handleActivityDelete(e, activity.id)}
                    floated='right'
                    content='Delete'
                    color='red'
                    loading={loading && target === activity.id}/>
                <Label basic content= {activity.category}/>
            </Item.Extra>
        </Item.Content>
    </Item>
    )
}