import { observer } from "mobx-react-lite";
import { useState, useEffect} from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { SubCalendarOptions } from "../../../app/common/options/subCalendarOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";
import { ActivityFormValues } from "../../../app/models/activity";

export default observer(function ActivityForm(){

        const history = useHistory();
        const {activityStore} = useStore();
        const {createGraphEvent, updateGraphEvent,
           loadActivity, loadingInitial, selectedActivity} = activityStore
        
        const {id} = useParams<{id: string}>();
        
        const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());

          const validationSchema = Yup.object({
          title: Yup.string().required('The title is required'),
          category: Yup.string().required(),
          start: Yup.string().required().nullable(),
          end: Yup.string().required().nullable(),
        })
      
        useEffect(() => {
          if (id) loadActivity(id).then(response => setActivity(new ActivityFormValues(response)))
      }, [id, loadActivity]);

    function handleFormSubmit(activity: ActivityFormValues) {
        if (!activity.id) {
            let newActivity = {
                ...activity,
                id: ''
            };
            createGraphEvent(newActivity).then(() => history.push(`/activities/${newActivity.id}`))
        } else {
          updateGraphEvent({...activity, id: activity!.id}).then(() => history.push(`/activities/${activity.id}`))
        }
    }

   if(loadingInitial){
      return (
      <LoadingComponent content='Loading calendar event...'/>
      )
    } 

    return(
        <Segment clearing>
          <Header content = {activity.id ? 'Update ' : 'Create New '} Calendar Event sub color='teal' />
          <Formik enableReinitialize
          validationSchema={validationSchema}
           initialValues={activity}
           onSubmit={values => handleFormSubmit(values)}>

            {({ handleSubmit, isValid, isSubmitting, dirty }) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                <MyTextInput name='title' placeholder='title' label='*Title' />              
                <MyTextArea rows={3} placeholder='Description' name='description' label='Description'/>
                <MySelectInput options={SubCalendarOptions} placeholder='Sub Calendar' name='category' label='*Sub Calendar'/>
                <MyDateInput
                        timeIntervals={15}
                        placeholderText='Start Date / Time'
                        name='start'
                        showTimeSelect
                        timeCaption='time'
                        dateFormat='MMMM d, yyyy h:mm aa'
                        title='*Start'  />
                <MyDateInput
                        timeIntervals={15}
                        placeholderText='Start Date / Time'
                        name='end'
                        showTimeSelect
                        timeCaption='time'
                        dateFormat='MMMM d, yyyy h:mm aa' 
                        title ='*End' />
                <Button
                disabled ={isSubmitting || !isValid || !dirty}
                 loading={isSubmitting} floated='right' positive type='submit' content='Submit'/>
                <Button as={Link} to='/activities' floated='right'  type='button' content='Cancel'
                />
            </Form>

            )}

          </Formik>
          
        </Segment>
    )
})