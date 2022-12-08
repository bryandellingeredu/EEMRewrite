
import { Segment, List, Label, Item, Image, Icon, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Activity } from '../../../app/models/activity'

interface Props {
    activity: Activity
}

export default observer(function ActivityDetailedSidebar ({activity}: Props) {
    return (
        <Segment.Group>
            <Segment
                textAlign='center'
                style={{ border: 'none' }}
                attached='top'
                secondary
                inverted
                color='teal'/>    
            
            { activity.category.name != "Academic Calendar" && activity.organization &&
            <>
            <Segment attached>
                <Grid verticalAlign='middle'>
                    <Grid.Column width={1}>
                        <Icon name='boxes' size='large' color='teal' />
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <span>Lead Org: {activity.organization?.name}</span>
                    </Grid.Column>
                </Grid>
            </Segment>
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='user' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                     <span>Activity Officer: {activity.actionOfficer}</span>
                 </Grid.Column>
             </Grid>
         </Segment>
         <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='phone' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                     <span>Action Officer Phone: {activity.actionOfficerPhone}</span>
                 </Grid.Column>
             </Grid>
         </Segment>
         </>
          }
          {activity.coordinatorName &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='user' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                     <span>Coordinator: {activity.coordinatorName}</span>
                 </Grid.Column>
             </Grid>
         </Segment>
          }
            {activity.coordinatorEmail &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='envelope' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                  <a href={`"mailto: ${activity.coordinatorEmail}"`}>
                     {activity.coordinatorEmail}
                     </a>
                 </Grid.Column>
             </Grid>
         </Segment>
          }

        {activity.activityRooms && activity.activityRooms.map(room => (
         <Segment attached key={room.id}>
         <Grid verticalAlign='middle'>
             <Grid.Column width={1}>
                 <Icon name='map marker' size='large' color='teal' />
             </Grid.Column>
             <Grid.Column width={11}>
                 {room.name}
             </Grid.Column>
         </Grid>
     </Segment>
       ))}   

{activity.activityRooms && activity.activityRooms.length > 0 && activity.numberAttending &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='users' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 <span>Attendees: {activity.numberAttending}</span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.phoneNumberForRoom &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='phone' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 <span>Room Requestor: {activity.phoneNumberForRoom}</span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.roomSetUp &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='setting' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 {activity.roomSetUp}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 VTC Required
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.roomSetUpInstructions &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='info' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 {activity.roomSetUpInstructions}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

</Segment.Group>
    )
})
