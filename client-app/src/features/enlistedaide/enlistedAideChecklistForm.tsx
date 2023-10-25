import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import agent from "../../app/api/agent";
import { Button, Divider, Grid, Header, Message, Segment, SegmentGroup, Form as SemanticForm, } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { EnlistedAideChecklist, EnlistedAideChecklistFormValues } from "../../app/models/enlistedAideChecklist";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { format } from 'date-fns';
import { Formik, Form } from "formik";
import MySemanticCheckBox from "../../app/common/form/MySemanticCheckbox";

export default observer(function EnlistedAideChecklistForm(){
    const{activityStore} = useStore();
    const {selectedActivity: activity, loadActivity, loadingInitial} = activityStore
    const {id} = useParams<{id: string}>();
    const {categoryId} = useParams<{categoryId: string}>();
    const [enlistedAideChecklist, setEnlistedAideChecklist] = useState<EnlistedAideChecklistFormValues>(new EnlistedAideChecklistFormValues());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const history = useHistory();

    useEffect(() => {
        if(id) activityStore.loadActivity(id, categoryId);
        },[id, categoryId, loadActivity, activityStore])

        useEffect(() => {
            (async () => {
                await loadData();
              })();
        }, []);
        
        async function loadData(){
            setLoading(true);
            try{
                
                    const response  = await agent.EnlistedAide.details(id);
                    setEnlistedAideChecklist(new EnlistedAideChecklistFormValues(response));
                    setLoading(false);
               
            } catch(error){
              console.log(error);
              setLoading(false);
              toast.error('an error occured loading checklist');
            }
        }

        async function handleFormSubmit(values: EnlistedAideChecklistFormValues) {
          try {
            setSaving(true);
            if(!values.id) values.id = enlistedAideChecklist.id;
            if(!values.activityId) values.activityId = enlistedAideChecklist.activityId;
            await agent.EnlistedAide.update(values);
            history.push(`${process.env.PUBLIC_URL}/enlistedAideCalendarWrapper`);
          } catch (error: any) {
            if(error && error.message){
              toast.error('An error occurred: ' + error.message);
            }else{
              toast.error('An error occurred: ');
            }
     
          } finally {
            setSaving(false);
          }
      }

    return(
        <>
          <Header as='h2'  textAlign="center">
            Enlisted Aide Checklist
        <Header.Subheader>Please Check the Tasks that you would like to appear on your calendar</Header.Subheader>
       </Header>
       <Divider />

       {(loadingInitial || !activity || loading || !enlistedAideChecklist || !enlistedAideChecklist.id ) && <LoadingComponent />}
       {!loadingInitial && activity && !loading && enlistedAideChecklist && enlistedAideChecklist.id &&
         <Formik initialValues={enlistedAideChecklist} onSubmit={(values) => handleFormSubmit(values)}  >
         {({handleSubmit}) => (
             <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
        <SegmentGroup>
          <Segment>
          <Grid columns={3} divided stackable>
            <Grid.Row>
                <Grid.Column>
                     <strong>Title:</strong> {activity.title}
               </Grid.Column>
              <Grid.Column>
                 <strong>Event Time: </strong> 
                 {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
                   <span> {format(activity.start, 'MMMM d, yyyy h:mm aa')} - {format(activity.end, 'MMMM d, yyyy h:mm aa')}</span>}

                 {!activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
                   <span>{format(activity.start, 'MMMM d, yyyy h:mm aa')} - {format(activity.end, 'h:mm aa')}</span> }

                {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') === format(activity.end, 'MMMM d, yyyy') &&
                                    <span>{format(activity.start, 'MMMM d, yyyy')}</span> }

                {activity.allDayEvent && format(activity.start, 'MMMM d, yyyy') !== format(activity.end, 'MMMM d, yyyy') &&
                                  <span>{format(activity.start, 'MMMM d, yyyy')} - {format(activity.end, 'MMMM d, yyyy')}</span> }
             </Grid.Column>
             <Grid.Column>
                <strong>Action Officer:</strong> {activity.actionOfficer}
            </Grid.Column>
        </Grid.Row>
        {!activity.enlistedAideEvent && 
                <Grid.Row columns={1}>
                    <Grid.Column>
                        <Message negative>
                            <Message.Header>This event is not an Enlisted Aide Event</Message.Header>
                            <p>This event has not been assigned as an Enlisted Aide Event. If it should be, please contact Executive Services.</p>
                        </Message>
                    </Grid.Column>
                </Grid.Row>
            }
           {activity.enlistedAideEvent && 
           <>
            <Grid.Row>
              <Grid.Column>
                   <strong>Venue: </strong> {activity.enlistedAideVenue || 'N/A'}
             </Grid.Column>
             <Grid.Column>
                   <strong>Guest Count: </strong> {activity.enlistedAideGuestCount|| 'N/A'}
             </Grid.Column>
             <Grid.Column>
                   <strong>Cooking: </strong> {activity.enlistedAideCooking || 'N/A'}
             </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column>
                    <strong>Dietary Restrictions: </strong> {activity.enlistedAideDietaryRestrictions || 'N/A'}
                </Grid.Column>
                <Grid.Column>
                <strong>Alcohol: </strong> {activity.enlistedAideAlcohol || 'N/A'}
                </Grid.Column>
                <Grid.Column>
                   <strong>Setup: </strong> {activity.enlistedAideSetup ? 'Set Up for this event is required' : 'Set Up for this event is NOT required'}
                </Grid.Column>
           </Grid.Row>
          
           {!activity.enlistedAideAcknowledged && 
                <Grid.Row columns={1}>
                    <Grid.Column>
                        <Message negative>
                            <Message.Header>This event has not been acknowledged by the Enlisted Aide</Message.Header>
                            <p>This event must first be acknowledged by the Enlisted Aide before the checklist can be populated.</p>
                        </Message>
                    </Grid.Column>
                </Grid.Row>
            }

           {activity.enlistedAideAcknowledged && 
               <Grid.Row>
                <Grid.Column>
                    <strong>Number of Bartenders: </strong> {activity.enlistedAideNumOfBartenders || 'N/A'}
                </Grid.Column>
                <Grid.Column>
                    <strong>Number of Servers: </strong> {activity.enlistedAideNumOfServers || 'N/A'}
                </Grid.Column>
                <Grid.Column>
                    <strong>Additional Support Needed: </strong> {activity.enlistedAideSupportNeeded || 'N/A'}
                </Grid.Column>
               </Grid.Row>
           }

               
           </>
            
           }
        </Grid>
          </Segment>
          
            {activity.enlistedAideAcknowledged && 
            <>
             <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>4 Weeks Out:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                        <MySemanticCheckBox
                          name="alcoholEstimate"
                          label="Alcohol Estimate"
                        />
                        <MySemanticCheckBox
                          name="prepareLegalReview"
                          label="Prepare Legal Review"
                        />
                        <MySemanticCheckBox
                          name="preparePRAForm"
                          label="Prepare PR&A Form With Legal Review"
                        />
                        <MySemanticCheckBox
                          name="prepareGuestList"
                          label="Prepare Guest List With Legal Review"
                        />
                        <MySemanticCheckBox
                          name="prepare4843GuestList"
                          label="Prepare 4843 Guest List With Legal Review"
                        />

                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
               </Segment>

     

              <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>3 Weeks Out:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                        <MySemanticCheckBox
                          name="prepareMenu"
                          label="Menu Preparation"
                        />
                        <MySemanticCheckBox
                          name="sendToLegalForApproval"
                          label="Submit Legal Review For Approval"
                        />
                     

                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>

            <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>2 Weeks Out:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                      <MySemanticCheckBox
                          name="menuReviewedByPrincipal"
                          label="Menu Reviewed By Principal"
                        />
                        <MySemanticCheckBox
                          name="orderAlcohol"
                          label="Order Alcohol"
                        />
                        <MySemanticCheckBox
                          name="gfebs"
                          label="GFEBS (upon Legal Review document approval)"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>

            <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>1 Week Out:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                      <MySemanticCheckBox
                          name="gatherIce"
                          label="Gather ICE"
                        />
                         <MySemanticCheckBox
                          name="highTopsAndTables"
                          label="High Tops and Tables"
                        />
                        <MySemanticCheckBox
                          name="sweepAndMop"
                          label="Sweep and Mop"
                        />
                        <MySemanticCheckBox
                          name="polishSilver"
                          label="Polish Silver"
                        />
                       <MySemanticCheckBox
                          name="cleanCutlery"
                          label="Clean Cutlery"
                        />
                         <MySemanticCheckBox
                          name="cleanPlates"
                          label="Clean Plates"
                        />
                        <MySemanticCheckBox
                          name="cleanServiceItems"
                          label="Clean Service Items"
                        />
                        <MySemanticCheckBox
                          name="napkinsPressed"
                          label="Napkins Pressed"
                        />
                         <MySemanticCheckBox
                          name="napkinsRolled"
                          label="Napkins Rolled"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>2 Days Out:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                      <MySemanticCheckBox
                          name="foodShopping"
                          label="Food Shopping"
                        />
                         <MySemanticCheckBox
                          name="foodPrep"
                          label="Food Prep"
                        />
                        <MySemanticCheckBox
                          name="tentSetUp"
                          label="Tent Set Up"
                        />                 
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>1 Day Out:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                      <MySemanticCheckBox
                          name="dust"
                          label="Dust"
                        />        
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>Day Of Event:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                      <MySemanticCheckBox
                          name="cook"
                          label="Cook"
                        />                   
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>1 Hour Before Event:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                      <MySemanticCheckBox
                          name="coffee"
                          label="Coffee"
                        />
                       <MySemanticCheckBox
                          name="iceBeverages"
                          label="Ice Beverages"
                        />                      
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                    <Grid stackable>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>Half Hour Before Event:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline className="stackable-checkbox-group">
                      <MySemanticCheckBox
                          name="sterno"
                          label="Sterno"
                        />                   
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
            <Button  color='orange'  as={Link} to={`${process.env.PUBLIC_URL}/enlistedAideCalendarWrapper`}>
                    Go To Calendar
                </Button>
                <Button  color='teal'  as={Link} to={`${process.env.PUBLIC_URL}/managefromenlistedaide/${activity.id}/${activity.categoryId}/${id}`}>
                    Update Event
                </Button>
            <Button
              positive
              type="submit"
              content="Submit"
              loading={saving}
              disabled={saving}
            />
            </Segment>
            </>
           
            }

          
        </SegmentGroup>
        </Form>
                )}
           </Formik>
       }

        </>
       
    )
})
