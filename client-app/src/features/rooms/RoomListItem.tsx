import { observer } from "mobx-react-lite";
import { Button, Card, Divider, Grid, Header, Icon, Label, Segment, Image } from "semantic-ui-react";
import { GraphRoom } from "../../app/models/graphRoom";
import RoomAvailability from "./RoomAvailability";
import { useStore } from "../../app/stores/store";
import { useEffect } from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";
import RoomPictureModal from "./RoomPictureModal";
import { NavLink } from "react-router-dom";

interface Props{
    room: GraphRoom
    showAvailabilityIndicatorList: string[]
    addIdToShowAvailabilityIndicatorList: (id: string) => void
}

export default observer (function RoomListItem(
  {room, showAvailabilityIndicatorList, addIdToShowAvailabilityIndicatorList } : Props) {

    const {graphRoomStore, modalStore} = useStore();
    const{ roomDelegates, loadingInitial, loadRoomDelegates} = graphRoomStore;
    const {openModal} = modalStore;

    useEffect(() => {
      if(!roomDelegates || roomDelegates.length < 1) loadRoomDelegates(); 
    }, [roomDelegates]);


    return (
            <Card>
            <Card.Content>
            <Label as='a' color='green' ribbon='right'>
              Capacity: {room.capacity}
            </Label>
              <Card.Header style={{marginTop: '5px'}}>
              {room.thumbURL && <Image floated='left' size='small' src={room.thumbURL}
               onClick={() => openModal(<RoomPictureModal url={room.picURL}/>, 'large')}
              />}    
              {room.displayName}
              </Card.Header>
              {room.address &&
              <Card.Meta>
                {room.address.street} {room.address.city} 
              </Card.Meta>
              }
              <Card.Description>
              <Card.Content extra>
        
                <Button basic color='orange'
                fluid
                 content = 'Check Availability and Reserve Room'
                 onClick={() => addIdToShowAvailabilityIndicatorList(room.id)}/>
          
            </Card.Content>
            { showAvailabilityIndicatorList.includes(room.id) && 
              <Card.Content extra>
                 <RoomAvailability room={room}/>
              </Card.Content>
           }
               <Divider horizontal>
              <Header as='h5'>
                Room Information
              </Header>
            </Divider>
              <Segment.Group>
            {loadingInitial && 
                  <Segment >
                  <Grid>
                      <Grid.Column width={15}>
                          <LoadingComponent content='loading room delegates'/>
                      </Grid.Column>
                  </Grid>
              </Segment>
            }
            {!loadingInitial && roomDelegates && roomDelegates.length > 0 &&
                  <Segment >
                    <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='user' />
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <p>room delegate/s: {roomDelegates.filter(x => x.roomEmail === room.emailAddress).map(x => x.delegateDisplayName).join(', ') || 'N/A'}</p>
                        <Button
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/requestRoomDelegateChanges/${room.id}`}
                icon
                labelPosition="left"
                basic
                color="teal"
                size="mini"
              >
                <Icon name="configure" />
                Request Room Delegate Changes
              </Button>
                    </Grid.Column>
                </Grid>
              </Segment>
            }
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
    {room.tags.map((tag) => (
         <Label color='teal' tag style={{margin: '6px'}} key={tag} size='small'>
         {tag}
       </Label>
    ))}
     </>
    }
        </Card.Description>
            </Card.Content>
           
          </Card>         

     )})