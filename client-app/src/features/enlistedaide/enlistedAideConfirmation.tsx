import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Formik, Form, useFormikContext } from "formik";
import { ActivityFormValues } from "../../app/models/activity";
import { Button, Divider, Header, Icon, Segment, SegmentGroup } from "semantic-ui-react";
import { format } from 'date-fns';
import { Grid,   Form as SemanticForm } from 'semantic-ui-react'
import MyDataList from "../../app/common/form/MyDataList";
import MyTextInput from "../../app/common/form/MyTextInput";
import MyTextArea from "../../app/common/form/MyTextArea";
import MySemanticRadioButton from "../../app/common/form/MySemanticRadioButton";
import * as Yup from "yup";
import { ValidationError } from 'yup';
import agent from "../../app/api/agent";
import { toast } from 'react-toastify';

interface FormData{
    id: string
    enlistedAideAcknowledged : string
    enlistedAideNumOfBartenders : string
    enlistedAideNumOfServers : string
    enlistedAideSupportNeeded : string  
  }

export default observer(function EnlistedAideConfirmation(){
    const history = useHistory();
    const {
        activityStore,
        userStore
      } = useStore();
      const {user} = userStore
      const [enlistedAidAdmin, setEnlistedAidAdmin] = useState(false);
      const { loadActivity, loadingInitial} = activityStore;

      const { id } = useParams<{ id: string }>();
      const { categoryId } = useParams<{ categoryId: string }>();
      const [activity, setActivity] = useState<ActivityFormValues>(
        new ActivityFormValues()
      );

      const [enlistedAideFormData, setEnlistedAideFormData] = useState<FormData>
      ({id: id, enlistedAideAcknowledged: '', enlistedAideNumOfBartenders: '', enlistedAideNumOfServers: '', enlistedAideSupportNeeded: '' });

      const [saving, setSaving] = useState(false);

      useEffect(() => {
        if (id && categoryId) {
            loadActivity(id, categoryId).then((response) => {
                setActivity(new ActivityFormValues(response));
                if(response){
                    const data : FormData = {
                        id: response.id,
                        enlistedAideAcknowledged: response.enlistedAideAcknowledged ? 'true' : '',
                        enlistedAideNumOfBartenders: response.enlistedAideNumOfBartenders,
                        enlistedAideNumOfServers: response.enlistedAideNumOfServers,
                        enlistedAideSupportNeeded: response.enlistedAideSupportNeeded
                    }
                    setEnlistedAideFormData(data);
                }
            });
        }
    }, []);

    useEffect(() => {
        setEnlistedAidAdmin((user && user.roles && user.roles.includes("EnlistedAidAdmin")) || false);
    }, [user]);

    async function handleFormSubmit(values: FormData) {
        try {
          // Create a copy of values of type any
          const newValues: any = {...values};
    
          // Convert enlistedAideAcknowledged to boolean
          newValues.enlistedAideAcknowledged = newValues.enlistedAideAcknowledged === 'true';
    
          setSaving(true);
          await agent.EnlistedAide.confirm(newValues);
          console.log(newValues);
        } catch (error: any) {
          toast.error('An error occurred: ' + error.message);
        } finally {
          setSaving(false);
        }
    }

      const validationSchema = Yup.object({
        enlistedAideAcknowledged: Yup.string()
          .required('Please choose if you will be available or not')
      });


      return(
       <>
        {loadingInitial && <LoadingComponent content="Loading form..." />}
        {!loadingInitial && enlistedAidAdmin &&
        <>
    <Divider horizontal>
     <Header as='h2'>
     <Icon name='info'  />
        Enlisted Aide Info
     </Header>
    </Divider>
           <Header as='h5' attached>
                  Title
              </Header>
              <Segment attached color='teal'>{activity.title}</Segment>
              <Header as='h5' attached>
                  Description
              </Header>
              <Segment attached color='teal'>{activity.description}</Segment>
               <Header as='h5' attached>
                  Time
              </Header>
                <Segment attached color='teal'>
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
                </Segment>
                <Header as='h5' attached>
                  Action Officer
              </Header>
              <Segment attached color='teal'>{activity.actionOfficer}</Segment>
              {activity.enlistedAideVenue &&
              <> 
              <Header as='h5' attached>
                  Venue
              </Header>
              <Segment attached color='teal'>{activity.enlistedAideVenue}</Segment>
              </>
              }
            {activity.enlistedAideGuestCount &&
              <> 
              <Header as='h5' attached>
                  Guest Count
              </Header>
              <Segment attached color='teal'>{activity.enlistedAideGuestCount}</Segment>
              </>
              }
            {activity.enlistedAideCooking &&
              <> 
              <Header as='h5' attached>
                  Cooking
              </Header>
              <Segment attached color='teal'>{activity.enlistedAideCooking}</Segment>
              </>
              }

           {activity.enlistedAideDietaryRestrictions &&
              <> 
              <Header as='h5' attached>
                  Dietary Restrictions
              </Header>
              <Segment attached color='teal'>{activity.enlistedAideDietaryRestrictions}</Segment>
              </>
              }

            {activity.enlistedAideAlcohol &&
              <> 
              <Header as='h5' attached>
                  Alcohol
              </Header>
              <Segment attached color='teal'>{activity.enlistedAideAlcohol}</Segment>
              </>
              }

<Divider horizontal>
     <Header as='h2'>
     <Icon name='wpforms'  />
        Confirmation Form
     </Header>
</Divider>
           <Formik initialValues={enlistedAideFormData} onSubmit={(values) => handleFormSubmit(values)} validationSchema={validationSchema} >
                {({handleSubmit}) => (
                    <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                  <Segment style={{ backgroundColor: "#D7EFEF" }} >
                    <MyDataList
                      name="enlistedAideNumOfBartenders"
                      placeholder="If you need bartenders enter the number needed"
                      label="Number of Bartenders Needed: "
                      dataListId="enlistedAideNumOfBartenders"
                      options={[ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                    />
                   <MyDataList
                      name="enlistedAideNumOfServers"
                      placeholder="If you need servers enter the number needed"
                      label="Number of Servers Needed:"
                      dataListId="enlistedAideNumOfServers"
                      options={[ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"]}
                    />
                    <MyTextArea rows={3} name="enlistedAideSupportNeeded" placeholder="Additional Support Needed" label = "Enter any support you will need for this event"/>
                    <Divider />
                     
                    <Grid>
                  <Grid.Row>
                    <Grid.Column width={3}>
                      <strong>Available?</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline>
                        <MySemanticRadioButton
                          label="Yes, I am available for this event"
                          value="true"
                          name="enlistedAideAcknowledged"
                        />
                        <MySemanticRadioButton
                          label="No, I am not available for this event"
                          value="false"
                          name="enlistedAideAcknowledged"
                        />
                   
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                 <Divider/>
                 <Button
              positive
              type="submit"
              content="Submit"
            />


                    </Segment>
                    </Form>
                )}
           </Formik>
            

        </>
        }
        </>
      )
})