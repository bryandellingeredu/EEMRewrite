import { Card, Image, Header, Grid, Segment } from "semantic-ui-react";
import { Activity, ActivityFormValues } from "../../app/models/activity";
import { format } from 'date-fns';
import {  useEffect, useState } from "react";
import { EditorState, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";

interface Props {
    activity: Activity | ActivityFormValues
  }

  export default function HostingReportPDF({activity} : Props){

    const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

    useEffect(() => {
        if (activity.hostingReport?.guestItinerary) {
            setEditorState(
            EditorState.createWithContent(
                convertFromRaw(
                  JSON.parse(activity.hostingReport!.guestItinerary)
                )
              )
            );
          } else {
            setEditorState(EditorState.createEmpty());
          }
      }, []);

    return(
        <Card color='black' style={{ fontFamily: 'sans-serif' }}>
            <Card.Header>
                <Header size='huge' textAlign="center" color={"brown"}>
                <Image  src={`${process.env.PUBLIC_URL}/assets/armylogo.png`} size='medium'/>
                    THE UNITED STATES ARMY WAR COLLEGE
                </Header>
                
            </Card.Header>
            <Card.Content >
            <Grid columns={3} divided>
                <Grid.Row stretched>
                <Grid.Column>
                <Segment.Group>
                <Segment inverted color='green'>
                    <strong>Event: </strong>
                    {activity.title}
                </Segment>
                <Segment>
                <strong>Senior Engager: </strong>
                    {activity.hostingReport?.escortOfficer}
                </Segment>
                <Segment>
                <strong>Phone: </strong>
                    {activity.hostingReport?.escortOfficerPhone}
                </Segment>
                </Segment.Group>
            </Grid.Column>
            <Grid.Column>
            <Segment.Group>
                <Segment><strong>Opr: </strong> {activity.organization?.name}</Segment>
                <Segment><strong>POC: </strong> {activity.actionOfficer}</Segment>
                <Segment><strong>Phone: </strong> {activity.actionOfficerPhone}</Segment>
            </Segment.Group>
            </Grid.Column>
            <Grid.Column>
            <Segment.Group>
            <Segment><strong>VISIT DATE:</strong></Segment>
            <Segment>{format(new Date(activity.start), 'MMMM d, yyyy')}</Segment>
            </Segment.Group>
           
            </Grid.Column>
            </Grid.Row>
            <Grid.Row stretched>
                 <Grid.Column>
                 <Segment.Group>
                    <Segment>
                     <strong>Visit Objectives:</strong>
                    </Segment>
                    <Segment>
                        {activity.hostingReport?.purposeOfVisit}
                    </Segment>
                    <Segment>
                        <strong>Travel Party:</strong>
                    </Segment>
                    <Segment>
                        {activity.hostingReport?.travelPartyAccomaniedBy || 'N/A'}
                    </Segment>
                 </Segment.Group>
                </Grid.Column>
                <Grid.Column>
                <Segment>
                <Header as={'h3'} textAlign='center' content='Agenda'/>
                <Editor editorState={editorState}  toolbarClassName='hide-toolbar'/>
                 </Segment>
                </Grid.Column>
                <Grid.Column>
                   <Segment.Group>
                
                     <Segment inverted color='yellow' textAlign="center">
                        <strong>Event Location</strong>
                     </Segment>
                     { (!activity.activityRooms || activity.activityRooms.length <= 0) && activity.primaryLocation &&
                     <Segment>
                        {activity.primaryLocation}
                     </Segment>
                    }  
                    { activity.activityRooms  && 
                         activity.activityRooms.map(room => (
                            <Segment key={room.id}>
                             {room.name}
                            </Segment>
                     ))
                    } 
                    <Segment inverted color='yellow' textAlign="center">
                        <strong>Resources Required</strong>
                     </Segment>
                     <Segment>
                        <strong>Lodging:</strong> {activity.hostingReport?.lodgingLocation || 'N/A'}
                    </Segment> 
                    <Segment>
                        <strong>Transportation:</strong> {activity.hostingReport?.travelArrangementDetails || 'N/A'}
                    </Segment>
                    {activity.hostingReport?.mealRequestLunch && activity.hostingReport?.mealRequestDinner &&
                     <Segment>
                        <strong>Meals:</strong> Lunch and Dinner
                    </Segment>
                    }
                     {activity.hostingReport?.mealRequestLunch && !activity.hostingReport?.mealRequestDinner &&
                     <Segment>
                        <strong>Meals:</strong> Lunch
                    </Segment>
                    }
                    {!activity.hostingReport?.mealRequestLunch && activity.hostingReport?.mealRequestDinner &&
                     <Segment>
                        <strong>Meals:</strong> Dinner
                    </Segment>
                    } 
                    {!activity.hostingReport?.mealRequestLunch && !activity.hostingReport?.mealRequestDinner &&
                     <Segment>
                        <strong>Meals:</strong> N/A
                    </Segment>
                    }  
                     <Segment>
                        <strong>Memento:</strong> {activity.hostingReport?.gift || 'N/A'}
                    </Segment>        
                   </Segment.Group>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row stretched>
                <Grid.Column>
                <Segment textAlign="center">
                    <strong>STRENGTH AND WISDOM</strong>
                </Segment>
                </Grid.Column>
                <Grid.Column>
                <Segment textAlign="center">
                    <strong>CUI</strong>
                </Segment>
                </Grid.Column>
                <Grid.Column>
                <Segment textAlign="center">
                    <strong>As of Date: {format(new Date(), 'MMMM d, yyyy')}</strong>
                </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>
            </Card.Content>
        </Card>
    )
  }