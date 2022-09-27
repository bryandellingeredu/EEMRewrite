import { observer } from "mobx-react-lite";
import { Button, Card, Divider, Grid, Header, Icon, Label, Segment } from "semantic-ui-react";
import { GraphRoom } from "../../app/models/graphRoom";


interface Props{
    room: GraphRoom
}

export default observer (function RoomListItem({room} : Props) {
    return (
            <Card key={room.id}>
            <Card.Content>
            <Label as='a' color='green' ribbon='right'>
              Capacity: {room.capacity}
            </Label>
              <Card.Header style={{marginTop: '5px'}}>{room.displayName}</Card.Header>
              <Card.Meta>
                {room.address.street} {room.address.city} 
              </Card.Meta>
              <Card.Description>
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
                          {room.floorNumber &&  <span> room {room.floorNumber}</span>} </p>
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
      <Header as='h3'>
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
            <Card.Content extra>
              <div className='ui two buttons'>
                <Button basic color='orange'>
                  Check Availability
                </Button>
                <Button basic color='green'>
                  Reserve
                </Button>
              </div>
            </Card.Content>
     
          </Card>         

     )})