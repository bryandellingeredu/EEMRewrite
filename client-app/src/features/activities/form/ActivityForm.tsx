import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, FormField, Label, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useEffect} from "react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form, ErrorMessage } from "formik";
import {Activity} from '../../../app/models/activity'
import { ActivityForm } from "../../../app/models/activityForm";
import * as Yup from 'yup';
import { buildSegCompareObj } from "@fullcalendar/react";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { SubCalendarOptions } from "../../../app/common/form/options/subCalendarOptions";

export default observer(function ActivityForm(){

        const history = useHistory();
        const {activityStore} = useStore();
        const {createActivity, updateActivity, loading, loadActivity, loadingInitial} = activityStore
        const [activityForm, setActivityForm] = useState({
        id: '',
        subject: '',
        bodyPreview: '',
        category: '',
        start: '',
        end: ''
      });

        const {id} = useParams<{id: string}>();

        const getActivityFormFromActivity = (activity: Activity): ActivityForm => {
          const activityForm = {...activity, start: activity.start.dateTime, end: activity.end.dateTime}
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

  /*  function handleSubmit(){
       if(activity.id.length === 0){
        createActivity(activity).then((newActivity) =>{
          if(newActivity){
           history.push(`/activities/${newActivity.id}`)
          }         
        });
       }else{
        updateActivity(activity).then(() =>history.push(`/activities/${activity.id}`));
       }
    }

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
      const{name, value} = event.target
      if(name === 'start.dateTime'){
        setActivity({...activity, 'start': {'dateTime': value, 'timeZone': 'UTC'}});
      } else if (name === 'end.dateTime'){
        setActivity({...activity, 'end': {'dateTime': value, 'timeZone': 'UTC'}});
      } else{
      setActivity({...activity, [name]: value})
      }
    } */

    if(loadingInitial){
      return (
      <LoadingComponent content='Loading calendar event...'/>
      )
    } 

    return(
        <Segment clearing>
          <Formik enableReinitialize
          validationSchema={validationSchema}
           initialValues={activityForm}
           onSubmit={values => console.log(values)}>

            {({ handleSubmit}) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                <MyTextInput name='subject' placeholder='title' label='*Title' />              
                <MyTextArea rows={3} placeholder='Description' name='bodyPreview' label='Description'/>
                <MySelectInput options={SubCalendarOptions} placeholder='Sub Calendar' name='category' label='*Sub Calendar'/>
                <MyTextInput placeholder='Start'name='start' label='*Start Date/Time' />
                <MyTextInput placeholder='End'name='end' label='*End Date/Time' />
                <Button loading={loading} floated='right' positive type='submit' content='Submit'/>
                <Button as={Link} to='/activities' floated='right'  type='button' content='Cancel'
                />
            </Form>

            )}

          </Formik>
          
        </Segment>
    )
})