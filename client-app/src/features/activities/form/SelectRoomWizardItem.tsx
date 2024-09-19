import { Button, Card, Divider, Grid, Header, Icon, Image, Label, Message, Segment } from "semantic-ui-react";
import { GraphRoom } from "../../../app/models/graphRoom";
import { useStore } from "../../../app/stores/store";
import RoomPictureModal from "../../rooms/RoomPictureModal";
import  { useState } from 'react';
import RoomLocationModal from "../../locator/roomLocationModal";

interface Props{
    room: GraphRoom
    unavailable: boolean
    setRoomEmails: (emails: string[]) => void;
    roomEmails: string[];
}

export default function SelectRoomWizardItem({room, unavailable,setRoomEmails, roomEmails} : Props){
    const {modalStore} = useStore();
    const {openModal} = modalStore;
    const [isSelected, setIsSelected] = useState(roomEmails.includes(room.emailAddress));
    const handleSelectThisRoom = () => {
        const newSelected = !isSelected;
        setIsSelected(newSelected);
    
        if (newSelected) {
            setRoomEmails([...roomEmails, room.emailAddress]);
        } else {
            setRoomEmails(roomEmails.filter(email => email !== room.emailAddress));
        }
    }
    const cardStyle = isSelected ? { border: '2px solid blue', backgroundColor: '#D0E0F0' } : {};
    const unavailableStyle = unavailable ? { opacity: 0.5, filter: 'grayscale(100%)' } : {};
    return(
        <Card style={{...cardStyle, ...unavailableStyle}}>
        <Card.Content>
        {room.thumbURL &&
          <Image
          className="clickable-image"
            floated='right'
            size='tiny'
            src={room.thumbURL}
            onClick={() => openModal(<RoomPictureModal url={room.picURL}/>, 'large')}
          />
        }
          <Card.Header> {room.displayName}</Card.Header>
          <Card.Meta><strong>Capacity: {room.capacity}</strong></Card.Meta>
          {room.address &&
          <Card.Description>
           {room.address.street} {room.address.city} 
          </Card.Description>
         }

               {
                  (room.building === 'Bldg 651' || room.building === 'Collins Hall, Bldg 650' ) &&
                <Button basic color='olive' fluid type='button'
                content='Show Room Location'
                onClick={() => openModal(
                <RoomLocationModal
                 bldg={room.building}
                 floor={room.floorLabel}
                 displayName={room.displayName}
                 email={room.emailAddress}
                 />,
                 'large')}
                /> }
     
        <Divider horizontal>
        <Header as='h5'>
                Room Information
         </Header>
        </Divider>
        <Segment.Group>
        { room.phone && room.phone !== "N/A" &&
            <Segment >
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='phone' />
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <p>{room.phone}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
             }
         { room.isWheelChairAccessible &&
                 <Segment >
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='wheelchair' />
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <p>wheelchair accessible</p>
                    </Grid.Column>
                </Grid>
            </Segment>
          }
             { room.building &&
                 <Segment >
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='building' />
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <p>{room.building} 
                          {room.floorLabel &&  <span> floor {room.floorLabel}</span>} </p>
                    </Grid.Column>
                </Grid>
            </Segment>
          }
              { room.audioDeviceName &&
                 <Segment >
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='sound' />
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <p>audio:  {room.audioDeviceName}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
          }
            { room.videoDeviceName &&
                 <Segment >
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='video' />
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <p>video:  {room.videoDeviceName}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
          }
                { room.displayDeviceName &&
                 <Segment >
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='tv' />
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <p>display:  {room.displayDeviceName}</p>
                    </Grid.Column>
                </Grid>
            </Segment>
          }
        </Segment.Group>
        { room.tags.length > 0 &&
         <>
        <Divider horizontal>
      <Header as='h5'>
        Amenities
      </Header>
    </Divider>
    <Card.Description>
    {room.tags.map((tag) => (
         <Label color='teal' tag style={{margin: '6px'}} key={tag} size='small'>
         {tag}
       </Label>
    ))}
    </Card.Description>
     </>
    }
       </Card.Content>
        <Card.Content extra>
            {!unavailable && 
          <div className='ui two buttons'>
          <Button 
          type="button"
            basic 
            color='green' 
            onClick={handleSelectThisRoom}
            disabled={isSelected} // Disable when the room is selected
        >
            Select This Room
        </Button>
        <Button 
        type="button"
            basic 
            color='red'
            disabled={!isSelected} // Disable when the room is not selected
            onClick={handleSelectThisRoom}
        >
            Remove This Room
        </Button>
          </div>
         }
         {unavailable && (
                <div className="warningMessage">
                    <div className="warningMessageHeader">
                    {isSelected ?
                        'You already reserved this room'
                        : 'This Room Is Unavailable'
                        }
                
                        </div>
                    <div className="warningMessageContent">
                        {isSelected ?
                        'This room is already reserved for this meeting'
                        : 'This room is unavailable, it has already been reserved during the time requested.'
                        }

                    </div>
                </div>
            )}
            
        </Card.Content>
      </Card>
    )
}