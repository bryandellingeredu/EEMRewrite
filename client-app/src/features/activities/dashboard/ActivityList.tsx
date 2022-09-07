import { observer } from "mobx-react-lite";
import { SyntheticEvent, useState } from "react";
import { Button, Item, Label, Segment } from "semantic-ui-react"
import { useStore } from "../../../app/stores/store";



export default observer (function ActivityList() {

    const {activityStore} = useStore();
    const {deleteActivity, activities, loading} = activityStore;
    const [target, setTarget] = useState('');

    function handleActivityDelete(e: SyntheticEvent<HTMLButtonElement>, id: string){
        setTarget(e.currentTarget.name);
        deleteActivity(id);
      }

    return (
        <Segment>
            <Item.Group divided>
                {activities.map(activity => (
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
                                <Button onClick={() =>activityStore.selectActivity(activity.id)}
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
                ))}
            </Item.Group>
        </Segment>
    )
})