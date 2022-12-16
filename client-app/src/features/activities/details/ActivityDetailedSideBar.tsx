
import { Segment, Icon, Grid, List } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'
import { Activity } from '../../../app/models/activity'

interface Props {
    activity: Activity
}

export default observer(function ActivityDetailedSidebar ({activity}: Props) {
    return (
        <Segment.Group>
           {/* <Segment
                textAlign='center'
                style={{ border: 'none' }}
                attached='top'
                secondary
                inverted
    color='teal'/>   */} 
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

{activity.g5Calendar &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='calendar' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 Added to the G5 Calendar
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.g5Calendar && activity.g5Organization &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='building' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 G5 Related Organization: {activity.g5Organization}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.hyperlink &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='linkify' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                 <a target="_blank" rel="noreferrer" href={activity.hyperlink}>
                   {activity.hyperlinkDescription || activity.hyperlink}
                </a>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.eventClearanceLevel &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='spy' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                   Clearance: {activity.eventClearanceLevel}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.communityEvent &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='globe' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                   Community Event
                 </Grid.Column>
             </Grid>
         </Segment>
 } 
 {activity.mfp &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='calendar check' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                  Military Family Program
                 </Grid.Column>
             </Grid>
         </Segment>
 } 
 {(activity.commandantRequested || activity.dptCmdtRequested || activity.provostRequested ||
   activity.cofsRequested || activity.deanRequested || activity.ambassadorRequested ||
   activity.cSMRequested) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
           <Icon name='users' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={8}>
         Leaders Requested: 
       </Grid.Column>
       <Grid.Column width={6}>
       <List >
            {activity.commandantRequested && <List.Item>Commandant</List.Item> }
            {activity.dptCmdtRequested && <List.Item>Dept Cmdt</List.Item> }
            {activity.provostRequested && <List.Item>Provost</List.Item> }
            {activity.cofsRequested && <List.Item>Cofs</List.Item> }
            {activity.deanRequested && <List.Item>Dean</List.Item> }
            {activity.ambassadorRequested && <List.Item>Ambassador</List.Item> }
            {activity.cSMRequested && <List.Item>CSM</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }


{activity.report && activity.report !== 'none' &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='file' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={11}>
                   {activity.report}
                 </Grid.Column>
             </Grid>
         </Segment>
 } 

</Segment.Group>
    )
})
