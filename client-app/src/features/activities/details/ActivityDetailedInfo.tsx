import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Segment, Grid, Icon } from 'semantic-ui-react'
import { Activity } from '../../../app/models/activity';

interface Props {
    activity: Activity
}

export default observer(function ActivityDetailedInfo({ activity }: Props) {
    return (
        <Segment.Group>
            <Segment attached='top'>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={15}>
                        <p>{activity.description || activity.title}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
      
        </Segment.Group>
    )
})
