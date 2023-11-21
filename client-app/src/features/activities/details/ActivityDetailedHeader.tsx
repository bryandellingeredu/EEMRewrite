import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Header, Item, Segment, Image, Confirm, Label, ButtonGroup, Grid, Icon, Message, Divider, } from 'semantic-ui-react'
import { Activity } from '../../../app/models/activity';
import RecurrenceMessageWrapper from '../recurrenceMessage/RecurrenceMessageWrapper';
import { useStore } from "../../../app/stores/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faInfo, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from 'react-router-dom'
import { useState } from 'react';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';
import CancelEventForm from './CancelEventForm';
import { BackToCalendarInfo } from '../../../app/models/backToCalendarInfo';



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
    setReloadTrigger: () => void,
    backToCalendarId: string | undefined,
    fromForm: string | undefined
}

export default observer(function ActivityDetailedHeader({ activity, setReloadTrigger, backToCalendarId, fromForm }: Props) {
    const {modalStore, activityStore, backToCalendarStore} = useStore();
    const {createICSFile} = activityStore;
    const {getBackToCalendarInfoRecord} = backToCalendarStore
    const history = useHistory();
    const [showConfirm, setShowConfirm] = useState(false);
    const [showCopyConfirm, setShowCopyConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [reload, setReloading] = useState(false);

    const handleGoBackClick = () => {
      if (backToCalendarId) {
          const backToCalendarRecord: BackToCalendarInfo | undefined = getBackToCalendarInfoRecord(backToCalendarId);
          if (backToCalendarRecord) {
              const url: string = `${backToCalendarRecord.url}/${backToCalendarRecord.id}`;
              history.push(url);
          } else {
              history.goBack();
          }
      } else if (fromForm === "true") {
          history.go(-3);
      } else {
          history.goBack();
      }
  }
    const handleCopyEvent = () => {
        history.push(`${process.env.PUBLIC_URL}/copy/${activity.id}/${activity.categoryId}/true`);
    }
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
                    
             
                    <Item.Group style={{marginRight: '5px'}}>
  
                        <Item>
                            <Item.Content>
                                <>
                                {activity.logicalDeleteInd && 
                                <p>
                                <Label size='huge' color='red' content='This Event is Deleted' style={{marginBottom: '10px'}}/>
                                </p>
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
                                       <p key={room.id}>{`${room.name} (${room.status})`}</p>
                                ))}   
                                { (!activity.activityRooms || activity.activityRooms.length <= 0) && activity.primaryLocation &&
                                    <p>{activity.primaryLocation}</p>
                                }
                                {activity.category.name !== 'Other' &&                                
                                <p>
                                    <strong>{activity.category.name === 'Academic Calendar' ? 'Student Calendar Academic Year 2023' :
                                             activity.category.name === 'Academic IMC Event' ? 'Faculty Calendar' :
                                             activity.category.name === 'Military Family and Spouse Program'? 'Military Spouse and Family Program' :
                                             activity.category.name === 'SSL Calendar' ? 'SSL Admin Calendar' : activity.category.name}</strong>
                                </p>
                                }

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
            <Segment clearing  textAlign='center'>
            <ButtonGroup size='tiny' fluid>
            
           <Button icon  color='brown'
            onClick={handleGoBackClick} >
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
                  confirmButton="Delete Event from all Calendars"
                  header='You are about to delete this event from all calendars'
                  content='This will delete the entire event from all calendars,
                   If you only want to remove the event from a specific calendar do NOT use this option instead use the update event button.
                   If you want to cancel the event do NOT use this option instead use the cancel event option.'
                />
        </>
    }
        { activity.category.name === 'Academic Calendar' &&
        <>
        
            <Button  color='teal'  as={Link} to={`${process.env.PUBLIC_URL}/addtomycalendar/${activity.id}/${activity.categoryId}`}>
                    Add to My Calendar
            </Button>
            </>
        }

{
       activity.category.name !== 'Academic Calendar' && activity.logicalDeleteInd &&
          <>
                <Button color='orange'
              
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
                  header='You are about to restore this event. Please note that this action will not restore any associated room reservations or EDU Team Events.'
                  content='This will restore the deleted event, but will not re-instate any room reservations or EDU Team Events that were associated with it. If new room reservations are needed, those will have to be made separately.'
                />
        </>
    }

   { activity.category.name !== 'Academic Calendar' && !activity.logicalDeleteInd &&
   <>
            {backToCalendarId &&
               <Button  color='orange'  as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}/false/${backToCalendarId}`}>
               Update Event
           </Button>
               }
                 {!backToCalendarId &&
               <Button  color='orange'  as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}`}>
               Update Event
           </Button>
               }
                
              
                <Button  color='teal'  as={Link} to={`${process.env.PUBLIC_URL}/addtomycalendar/${activity.id}/${activity.categoryId}`}>
                    Add to My Calendar
            </Button>
                <Button  color='violet'
                disabled={activity.cancelled}
                  onClick={() => setShowCopyConfirm(true)}                 
                  >
                     Copy Event
                </Button>
                <Confirm
                  open={showCopyConfirm}
                  onCancel={() => setShowCopyConfirm(false)}
                  confirmButton="Copy Event"
                  onConfirm={handleCopyEvent}
                  header='You are about to copy this event.'
                  content='This will copy the event and add a "Copied on date" to the title which you should change to your new title.
                  the system will not copy room reservations, you will need to reserve any rooms that you need for this event'
                />
                <Button  color='brown' 
                     disabled={activity.cancelled}
                      onClick={() =>
                      modalStore.openModal(
                        <CancelEventForm
                        activityId={activity.id}
                        title={activity.title}    
                        setReloadTrigger={setReloadTrigger}                 
                        />, 'small'
                      )
                    } >
                     Cancel Event
                </Button>
         
      </>
    }
    </ButtonGroup>      
 </Segment>
        {activity.report && activity.report === 'Hosting Report' && 
        <Segment>
            <Grid>
                 <Grid.Column width={1}>
                     <Icon name='file' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={5}>
                   {activity.report}
                  
                 </Grid.Column>
                 <Grid.Column width={10}>
                    <ButtonGroup size='tiny' floated='right' fluid  >
                <Button color = 'black' as={Link} to={`${process.env.PUBLIC_URL}/hostingReport/${activity.id}/${activity.categoryId}`}>
                       View  {activity.report}
                  </Button>  
                 <Button color = 'grey' as={Link} to={`${process.env.PUBLIC_URL}/itinerary/${activity.id}/${activity.categoryId}`}>
                       View  Itinerary
                  </Button>  
                  <Button color = 'blue' as={Link} to={`${process.env.PUBLIC_URL}/downloadBio/${activity.id}/${activity.categoryId}`}>
                       Download Bio
                  </Button> 
                  </ButtonGroup>              
                 </Grid.Column>
             </Grid>
         </Segment>
        }
    {activity.recurrenceInd && activity.recurrence && !activity.logicalDeleteInd &&
      <Segment>
         <Grid>
         <Grid.Column width={1}>
                     <Icon name='repeat' size='large' color='teal' />
        </Grid.Column>
        <Grid.Column width={5}>
           Repeating Event         
        </Grid.Column>
        <Grid.Column width={10}>
        <ButtonGroup size='tiny' floated='right' fluid  >
      <Button  icon color='pink' 
       onClick={() => modalStore.openModal(
        <RecurrenceMessageWrapper
         recurrence = {activity.recurrence!}
         title = {activity.title}
        />)}
      >
       Repeating Event Info
     </Button>
     {backToCalendarId && 
        <>
        <Button color='purple'  as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}/true/${backToCalendarId}`}>
            Update Entire Series
        </Button>
        <Button  color='orange'  as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}/false/${backToCalendarId}`}>
                    Update Just This Event
        </Button>
        </>
        }
        {!backToCalendarId && 
        <>
        <Button color='purple'  as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}/true`}>
            Update Entire Series
        </Button>
        <Button  color='orange'  as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}`}>
                    Update Just This Event
        </Button>
        </>
        }
        </ButtonGroup>
        </Grid.Column>
        </Grid>
    </Segment>
   
     }

     {(activity.teamLink || activity.armyTeamLink) &&
      <Segment>
        <Grid>
            <Grid.Column width={1}>
            <Icon name='microsoft' size='large' color='teal' />
            </Grid.Column>
            <Grid.Column width={5}>
           This Event has a Microsoft Teams Meeting       
        </Grid.Column>
        <Grid.Column width={10}>
        <ButtonGroup  floated='right' fluid >
        {activity.teamLink && 
        <>
        <Button color='black' 
        onClick = {() => {window.open(activity.teamLink, "_blank");}}
        >
            Join EDU Teams Meeting
        </Button>
        <Button color='brown' 
        onClick={() => {
            navigator.clipboard.writeText(activity.teamLink)
              .then(() => {
                toast.success('Team Link copied to clipboard', {
                  position: toast.POSITION.TOP_CENTER
                });
              })
              .catch(err => {
                toast.error('Failed to copy link: ' + err, {
                  position: toast.POSITION.TOP_CENTER
                });
              });
          }}>
            Copy EDU Teams Link
        </Button>
        </>
       }
        {activity.armyTeamLink && 
        <>
        <Button color='black' 
        onClick = {() => {window.open(activity.armyTeamLink, "_blank");}}
        >
            Join Army Teams Meeting
        </Button>
        <Button color='brown' 
        onClick={() => {
            navigator.clipboard.writeText(activity.armyTeamLink)
              .then(() => {
                toast.success('Team Link copied to clipboard', {
                  position: toast.POSITION.TOP_CENTER
                });
              })
              .catch(err => {
                toast.error('Failed to copy link: ' + err, {
                  position: toast.POSITION.TOP_CENTER
                });
              });
          }}>
            Copy Army Teams Link
        </Button>
        </>
       }
        </ButtonGroup>
        </Grid.Column>
        </Grid>
      </Segment>
     }

{activity.copiedTosymposiumAndConferences && activity.symposiumLinkInd && activity.symposiumLink &&
      <Segment> 
        <Grid>
            <Grid.Column width={1}>
            <Icon name='users' size='large' color='teal' />
            </Grid.Column>
            <Grid.Column width={5}>
           This Symposium / Conference has a Registration Site      
        </Grid.Column>
        <Grid.Column width={10}>
        <ButtonGroup  floated='right' fluid >
        <Button color='black' 
        onClick = {() => {window.open(activity.symposiumLink, "_blank");}}
        >
            Register for Symposium / Conference
        </Button>
        <Button color='brown' 
        onClick={() => {
            navigator.clipboard.writeText(activity.symposiumLink)
              .then(() => {
                toast.success('Registration Link copied to clipboard', {
                  position: toast.POSITION.TOP_CENTER
                });
              })
              .catch(err => {
                toast.error('Failed to copy link: ' + err, {
                  position: toast.POSITION.TOP_CENTER
                });
              });
          }}>
            Copy Registration Link
        </Button>
        </ButtonGroup>
        </Grid.Column>
        </Grid>
      </Segment>
     }

{activity.cancelled && activity.cancelledAt &&
                              <Segment>
                                <Message negative >
                                <Message.Header>
                                   <p>This Event was Canceled</p>
                                   <Divider/>
                                </Message.Header>  
                                  <p>  <strong>Cancelled At:</strong> {format(new Date(activity.cancelledAt), 'MMMM d, yyyy h:mm aa')}</p>
                                 <p> <strong>Cancelled By: </strong> {activity.cancelledBy}</p>
                                 <p> <strong>Canceled Reason: </strong> {activity.cancelledReason}</p>
                                </Message>    
                                </Segment>                       
                                }
                               
        </Segment.Group>

    )
})

