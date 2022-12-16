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
            { activity.description &&
            <Segment attached='top'>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={15}>
                        <p>{activity.description}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
      }
            <Segment attached>
                <Grid verticalAlign='middle'>
                    <Grid.Column width={1}>
                        <Icon name='calendar' size='large' color='teal' />
                    </Grid.Column>
                    <Grid.Column width={15}>
                        {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
                            <span>

                                {format(activity.start, 'MMMM d, yyyy h:mm aa')} -
                                {format(activity.end, 'MMMM d, yyyy h:mm aa')}
                            </span>
                        }
                        {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
                            <span>

                                {format(activity.start, 'MMMM d, yyyy h:mm aa')} -
                                {format(activity.end, 'h:mm aa')}
                            </span>
                        }
                        {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
                            <span>

                                {format(activity.start, 'MMMM d, yyyy')}
                            </span>
                        }
                        {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
                            <span>
                                {format(activity.start, 'MMMM d, yyyy')} - {format(activity.end, 'MMMM d, yyyy')}
                            </span>
                        }
                    </Grid.Column>
                </Grid>
            </Segment>
            { activity.primaryLocation &&
            <Segment attached>
                <Grid verticalAlign='middle'>
                    <Grid.Column width={1}>
                        <Icon name='marker' size='large' color='teal' />
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <span>{activity.primaryLocation}</span>
                    </Grid.Column>
                </Grid>
            </Segment>
           }
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
          
        </Segment.Group>
    )
})
