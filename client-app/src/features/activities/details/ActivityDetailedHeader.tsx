import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Header, Item, Segment, Image, Confirm, Label } from 'semantic-ui-react'
import { Activity } from '../../../app/models/activity';
import RecurrenceMessageWrapper from '../recurrenceMessage/RecurrenceMessageWrapper';
import { useStore } from "../../../app/stores/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from 'react-router-dom'
import { useState } from 'react';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';



const activityImageStyle = {
    filter: 'brightness(30%)'
};

const activityImageTextStyle = {
    position: 'absolute',
    bottom: '5%',
    left: '5%',
    width: '100%',
    height: 'auto',
    color: 'white'
};

interface Props {
    activity: Activity
    setReloadTrigger: () => void
}

export default observer(function ActivityDetailedHeader({ activity, setReloadTrigger }: Props) {
    const {modalStore} = useStore();
    const history = useHistory();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const handleDeleteEvent = async() =>{
        try{
           setShowConfirm(false);
           setDeleting(true);
           await agent.Activities.delete(activity.id);
           toast.success('This event has been deleted');
           history.push(`${process.env.PUBLIC_URL}/deletedactivityTable`)
           setDeleting(false);
        } catch(error){
            console.log(error);
           setDeleting(false);

        }
    }
    const handleRestoreEvent = async() =>{
        try{
           setShowConfirm(false);
           setRestoring(true);
           await agent.Activities.restore(activity.id);
           toast.success('This event has been restored');
           setReloadTrigger();
        } catch(error){
            console.log(error);
           setRestoring(false);

        }
    }
    return (
        <Segment.Group>
            <Segment basic attached='top' style={{ padding: '0' }}>
                
                <Image src={`${process.env.PUBLIC_URL}/assets/categoryImages/${activity.category.name}.jpg`} fluid style={activityImageStyle} />
                
                <Segment style={activityImageTextStyle} basic>
                    
             
                    <Item.Group>
  
                        <Item>
                            <Item.Content>
                                <>
                                {activity.logicalDeleteInd && 
        
                                <Label size='huge' color='red' content='This Event is Deleted' style={{marginBottom: '10px'}}/>
                
                                 }
                                <Header
                                    size='huge'
                                    content={activity.title}
                                    style={{ color: 'white' }}
                                />
                                {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
                                    <p>

                                        {format(activity.start, 'MMMM d, yyyy h:mm aa')} -
                                        {format(activity.end, 'MMMM d, yyyy h:mm aa')}
                                    </p>
                                }
                                {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
                                    <p>
                                        {format(activity.start, 'MMMM d, yyyy h:mm aa')} -
                                        {format(activity.end, 'h:mm aa')}
                                    </p>
                                }
                                {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
                                    <p>

                                        {format(activity.start, 'MMMM d, yyyy')}
                                    </p>
                                }
                                {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
                                    <p>

                                        {format(activity.start, 'MMMM d, yyyy')} - {format(activity.end, 'MMMM d, yyyy')}
                                    </p>
                                }
                                { activity.activityRooms && activity.activityRooms.map(room => (
                                       <p key={room.id}>{room.name}</p>
                                ))}   
                                { (!activity.activityRooms || activity.activityRooms.length <= 0) && activity.primaryLocation &&
                                    <p>{activity.primaryLocation}</p>
                                }                                 
                                <p>
                                    <strong>{activity.category.name}</strong>
                                </p>

                                { activity.category.name != "Academic Calendar" && activity.organization && activity.organization?.name &&
                                  <p>
                                  <strong>Lead Org: </strong> {activity.organization?.name}
                                 </p>
                                }

                                { activity.category.name != "Academic Calendar" && activity.actionOfficer &&
                                    <p>
                                    <strong>Action Officer: </strong> {activity.actionOfficer}, {activity.actionOfficerPhone} 
                                   </p>
                                }      
                                { activity.category.name != "Academic Calendar" && (activity.coordinatorName || activity.coordinatorEmail) &&
                                    <p>
                                    <strong>Coordinator: </strong> {activity.coordinatorName}  <a href={`"mailto: ${activity.coordinatorEmail}"`} style={{color: 'white'}}> {activity.coordinatorEmail}</a>
                                   </p>
                                } 
                                </>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
            </Segment>
            <Segment clearing attached='bottom'>
           <Button icon color='brown' onClick={() => history.goBack()} >
            <FontAwesomeIcon icon={faBackward} style={{paddingRight: '5px'}} />
            Back
           </Button>

           {
       activity.category.name !== 'Academic Calendar' && !activity.logicalDeleteInd &&
          <>
                <Button color='red'
                 floated='right'
                  type='button'
                  onClick={() => setShowConfirm(true)}
                  loading={deleting}
                  >
                    Delete Event
                </Button>
                  <Confirm
                  open={showConfirm}
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={handleDeleteEvent}
                  header='You are about to delete this event'
                />
        </>
    }

{
       activity.category.name !== 'Academic Calendar' && activity.logicalDeleteInd &&
          <>
                <Button color='orange'
                 floated='right'
                  type='button'
                  onClick={() => setShowConfirm(true)}
                  loading={restoring}
                  >
                    Restore / Un-Delete
                </Button>
                  <Confirm
                  open={showConfirm}
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={handleRestoreEvent}
                  header='You are about to restore this event. Please note that this action will not restore any associated room reservations.'
                  content='This will restore the deleted event, but will not re-instate any room reservations that were associated with it. If new room reservations are needed, those will have to be made separately.'
                />
        </>
    }

            {activity.recurrenceInd && activity.recurrence && !activity.logicalDeleteInd &&
      <>
      <Button  icon color='teal' 
       onClick={() => modalStore.openModal(
        <RecurrenceMessageWrapper
         recurrence = {activity.recurrence!}
         title = {activity.title}
        />)}
      >
    
      <FontAwesomeIcon icon={faRepeat} style={{paddingRight: '5px'}} />
       Repeating Event
     </Button>

<Button color='purple' floated='right' as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}/true`}>
Update Series
</Button>
</>
   
     }
   { activity.category.name !== 'Academic Calendar' && !activity.logicalDeleteInd &&
                <Button color='orange' floated='right' as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}`}>
                    Update Event
                </Button>
    }
    
            </Segment>
        </Segment.Group>
    )
})

