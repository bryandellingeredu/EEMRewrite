import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useEffect} from "react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form } from "formik";
import {Activity} from '../../../app/models/activity'
import { ActivityForm } from "../../../app/models/activityForm";
import * as Yup from 'yup';
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { SubCalendarOptions } from "../../../app/common/options/subCalendarOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";

export default observer(function ActivityForm(){

        const history = useHistory();
        const {activityStore} = useStore();
        const {createActivity, updateActivity, loading, loadActivity, loadingInitial} = activityStore
        const [activityForm, setActivityForm] = useState({
        id: '',
        subject: '',
        bodyPreview: '',
        category: '',
        start: new Date(),
        end: new Date()
      });

        const {id} = useParams<{id: string}>();

        const getActivityFormFromActivity = (activity: Activity): ActivityForm => {
          const activityForm = {...activity, start: new Date(activity.start.dateTime), end: new Date(activity.end.dateTime)}
          return activityForm;
        };

        const validationSchema = Yup.object({
          subject: Yup.string().required('The title is required'),
          category: Yup.string().required(),
          start: Yup.string().required(),
          end: Yup.string().required()

        })
      
      useEffect(() => {
        if(id) loadActivity(id,'undefined').then(activity => setActivityForm(getActivityFormFromActivity(activity)))      
      },[id, loadActivity ])

    function handleFormSubmit(activityForm: ActivityForm){
       if(activityForm.id.length === 0){
        createActivity(activityForm).then((newActivity) =>{
          if(newActivity){
           history.push(`/activities/${newActivity.id}/undefined`)
          }         
        });
       }else{
        updateActivity(activityForm).then(() =>history.push(`/activities/${activityForm.id}/undefined`));
       }
    }



    if(loadingInitial){
      return (
      <LoadingComponent content='Loading calendar event...'/>
      )
    } 

    return(
        <Segment clearing>
          <Header content = {activityForm.id ? 'Update ' : 'Create New '} Calendar Event sub color='teal' />
          <Formik enableReinitialize
          validationSchema={validationSchema}
           initialValues={activityForm}
           onSubmit={values => handleFormSubmit(values)}>

            {({ handleSubmit, isValid, isSubmitting, dirty }) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                <MyTextInput name='subject' placeholder='title' label='*Title' />              
                <MyTextArea rows={3} placeholder='Description' name='bodyPreview' label='Description'/>
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
                disabled={isSubmitting || !dirty || !isValid}
                 loading={loading} floated='right' positive type='submit' content='Submit'/>
                <Button as={Link} to='/activities' floated='right'  type='button' content='Cancel'
                />
            </Form>

            )}

          </Formik>
          
        </Segment>
    )
})