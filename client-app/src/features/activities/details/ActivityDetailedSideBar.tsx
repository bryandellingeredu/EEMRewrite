
import { Segment, List, Label, Item, Image, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Attendee } from '../../../app/models/attendee'

interface Props {
    attendees: Attendee[] | null 
}

export default observer(function ActivityDetailedSidebar ({attendees} : Props) {
    return (
        <>
            <Segment
                textAlign='center'
                style={{ border: 'none' }}
                attached='top'
                secondary
                inverted
                color='teal'
            >
                {attendees ?  attendees.length : 0 } Responses
            </Segment>
            <Segment attached>
                <List relaxed divided>
                {attendees && attendees.map((attendee) => (
                       <Item style={{ position: 'relative' }} key={attendee.emailAddress.address}>
                        {attendee.type === 'required' &&
                       <Label
                           style={{ position: 'absolute' }}
                           color='orange'
                           ribbon='right'
                       >
                           Required
                       </Label>
                      }
                       <Image size='tiny' src={'/assets/user.png'} />
                       <Item.Content verticalAlign='middle'>
                           <Item.Header as='h3'>
                               {attendee.emailAddress.name}
                           </Item.Header>
                           <Item.Extra>
                            <br/>
                           <Label as='a' href={`mailto: ${attendee.emailAddress.address}`}>
                           <Icon name='mail' /> {attendee.emailAddress.address}                           
                        </Label>
                        <h4>status: {attendee.status.response}</h4>
                           </Item.Extra>
                       </Item.Content>
                   </Item>      
                ))}
                </List>
            </Segment>
        </>

    )
})
