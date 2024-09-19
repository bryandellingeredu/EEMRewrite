import { observer } from "mobx-react-lite";
import { Button, Card, Divider, Grid, Header, Icon, Label, Segment, Image, ButtonGroup } from "semantic-ui-react";
import { GraphRoom } from "../../app/models/graphRoom";
import RoomAvailability from "./RoomAvailability";
import { useStore } from "../../app/stores/store";
import { useEffect } from 'react';
import LoadingComponent from "../../app/layout/LoadingComponent";
import RoomPictureModal from "./RoomPictureModal";
import { NavLink } from "react-router-dom";
import { Link } from 'react-router-dom';
import RoomLocationModal from "../locator/roomLocationModal";

interface Props{
    room: GraphRoom
    showAvailabilityIndicatorList: string[]
    addIdToShowAvailabilityIndicatorList: (id: string) => void
    showRoomLocation: boolean
}

export default observer (function RoomListItem(
  {room, showAvailabilityIndicatorList, addIdToShowAvailabilityIndicatorList, showRoomLocation} : Props) {

    const {graphRoomStore, modalStore, userStore} = useStore();
    const{ roomDelegates, loadingInitial, loadRoomDelegates} = graphRoomStore;
    const {openModal} = modalStore;
    const{user} = userStore;

    useEffect(() => {
      if(!roomDelegates || roomDelegates.length < 1) loadRoomDelegates(); 
    }, [roomDelegates]);


    return (
            <Card fluid>
            <Card.Content>
            {user && !loadingInitial && roomDelegates && roomDelegates.length > 0 &&
            roomDelegates.filter(x => x.roomEmail === room.emailAddress)
            .some(
              (delegate) => delegate.delegateEmail === user.userName
            ) && 
            <Button color="orange" basic
      style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }} 
      content="Approve Room Reservations" 
      as={Link} to={`${process.env.PUBLIC_URL}/approveroomreservations/${room.id}`}
    />
            }
            <Label as='a' color='green' ribbon='right'>
              Capacity: {room.capacity}
            </Label>
              <Card.Header style={{marginTop: '5px'}}>
              {room.thumbURL && <Image  style={{paddingBottom: '10px'}} floated='left' size='small' src={room.thumbURL} className="clickable-image"
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
           <ButtonGroup fluid>
                <Button basic color='orange'
                 content = 'Check Availability and Reserve Room'
                 onClick={() => addIdToShowAvailabilityIndicatorList(room.id)}/>
                 {showRoomLocation &&
                  (room.building === 'Bldg 651' || room.building === 'Collins Hall, Bldg 650' ) &&
                <Button basic color='olive' type='button'
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
            </ButtonGroup>
          
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