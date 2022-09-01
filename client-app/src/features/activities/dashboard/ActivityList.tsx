import { Item, Segment } from "semantic-ui-react"
import { Activity } from "../../../app/models/activity"

interface Props {
    activities: Activity[]
}

export default function ActivityList({ activities }: Props) {


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
                                <div>{activity.bodyPreview.split('\r')[0]}</div>
                            </Item.Description>
                            )}
                        </Item.Content>
                    </Item>
                ))}
            </Item.Group>
        </Segment>
    )
}