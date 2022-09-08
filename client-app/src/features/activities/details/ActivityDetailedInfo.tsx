import { observer } from 'mobx-react-lite';
import {Segment, Grid, Icon} from 'semantic-ui-react'
import {Activity} from "../../../app/models/activity";

interface Props {
    activity: Activity
}

export default observer(function ActivityDetailedInfo({activity}: Props) {
    return (
        <Segment.Group>
            <Segment attached='top'>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info'/>
                    </Grid.Column>
                    <Grid.Column width={15}>
                        <p>{activity.bodyPreview}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
            <Segment attached>
                <Grid verticalAlign='middle'>
                    <Grid.Column width={1}>
                        <Icon name='calendar' size='large' color='teal'/>
                    </Grid.Column>
                    <Grid.Column width={15}>
            <span>
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

            </span>
                    </Grid.Column>
                </Grid>
            </Segment>
            <Segment attached>
                <Grid verticalAlign='middle'>
                    <Grid.Column width={1}>
                        <Icon name='marker' size='large' color='teal'/>
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <span>Collins Hall, Army War College</span>
                    </Grid.Column>
                </Grid>
            </Segment>
        </Segment.Group>
    )
})
