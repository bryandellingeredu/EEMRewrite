import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Button, Header, Item, Segment, Image } from 'semantic-ui-react'
import { Activity } from '../../../app/models/activity';
import RecurrenceMessageWrapper from '../recurrenceMessage/RecurrenceMessageWrapper';
import { useStore } from "../../../app/stores/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";

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
}

export default observer(function ActivityDetailedHeader({ activity }: Props) {
    const {modalStore} = useStore();
    return (
        <Segment.Group>
            <Segment basic attached='top' style={{ padding: '0' }}>
                
                <Image src={`${process.env.PUBLIC_URL}/assets/categoryImages/${activity.category.name}.jpg`} fluid style={activityImageStyle} />
                
                <Segment style={activityImageTextStyle} basic>
                    
             
                    <Item.Group>
  
                        <Item>
                            <Item.Content>
                                <>
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
                                <p>
                                    <strong>{activity.category.name}</strong>
                                </p>
                                </>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
            </Segment>
            <Segment clearing attached='bottom'>
            {activity.recurrenceInd && activity.recurrence &&
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
   { activity.category.name !== 'Academic Calendar' && 
                <Button color='orange' floated='right' as={Link} to={`${process.env.PUBLIC_URL}/manage/${activity.id}/${activity.categoryId}`}>
                    Update Event
                </Button>
    }
            </Segment>
        </Segment.Group>
    )
})

