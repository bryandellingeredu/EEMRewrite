import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import {Button, Header, Item, Segment, Image} from 'semantic-ui-react'
import {Activity} from "../../../app/models/activity";

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

export default observer (function ActivityDetailedHeader({activity}: Props) {
    return (
        <Segment.Group>
            <Segment basic attached='top' style={{padding: '0'}}>
                <Image src={`/assets/categoryImages/${activity.category}.jpg`} fluid style={activityImageStyle}/>
                <Segment style={activityImageTextStyle} basic>
                    <Item.Group>
                        <Item>
                            <Item.Content>
                                <Header
                                    size='huge'
                                    content={activity.subject}
                                    style={{color: 'white'}}
                                />
                                <p>
                         
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
          
                                </p>
                                <p>
                                    Category <strong>{activity.category}</strong>
                                </p>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
            </Segment>
            <Segment clearing attached='bottom'>
                <Button color='teal'>Join Activity</Button>
                <Button>Cancel attendance</Button>
                <Button color='orange' floated='right'  as={Link} to={`/manage/${activity.id}`}>
                    Manage Event
                </Button>
            </Segment>
        </Segment.Group>
    )
})

