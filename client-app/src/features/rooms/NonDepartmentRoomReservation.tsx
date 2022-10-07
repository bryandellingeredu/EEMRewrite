import { observer } from "mobx-react-lite";
import { Button, Divider, Header, Icon } from "semantic-ui-react";
import { faPeopleRoof } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  Link, useLocation, } from "react-router-dom";
import { useEffect, useState } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import * as Yup from 'yup';
import { Formik, Form} from "formik";
import MyRequiredTextInput from "../../app/common/form/MyRequiredTextInput";
import MyTextArea from "../../app/common/form/MyTextArea";

export default observer (function NonDepartmentRoomReservation() {

    interface state {
        startDate : Date,
        endDate : Date,
        displayName: string,
        roomEmail: string
      }

      interface FormValues{
        title: string
        description: string
      }

      const validationSchema = Yup.object({
        title: Yup.string().required('The title is required'),
      });
     
     
    const {startDate, endDate, displayName, roomEmail} = useLocation<state>().state;
    const {graphUserStore, commonStore} = useStore();
    const {loadUser, loadingInitial, graphUser} = graphUserStore;
    const [formValues, setFormValues] = useState<FormValues>({title: '', description: ''});

    useEffect(() => {
      window.scrollTo({top: 0, left: 0, behavior: 'smooth' });
        if(!graphUser) loadUser()
      }, [graphUser, loadUser, loadingInitial])

     function handleFormSubmit(formValues: FormValues) {
         console.log(formValues);
      }

    return (
        <>
        {loadingInitial
        && <LoadingComponent content='Loading Form' />
      }
      {!loadingInitial &&
      <>
        <Header as='h2' textAlign='center'>
        <FontAwesomeIcon icon={faPeopleRoof} size='2x' style={{marginRight: '10px'}} />
          Non Department Room Reservation
          <Header.Subheader>
           Reserving {displayName} For {commonStore.formatDate(
                commonStore.convertDateToGraph(startDate, false, false),
                commonStore.convertDateToGraph(endDate, false, true))}
        </Header.Subheader>
        </Header>
        <Formik enableReinitialize
        validationSchema={validationSchema}
        initialValues={formValues}
        onSubmit={values => handleFormSubmit(values)}>
           {({ handleSubmit, isValid, isSubmitting, dirty, values }) => (
          <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
             <MyRequiredTextInput name='title' placeholder='Event Title' label='Event Title' />
             <MyTextArea rows={3} placeholder='Event Description' name='description' label='Event Description' />
             <Button
              disabled={isSubmitting || !isValid || !dirty}
              loading={isSubmitting} floated='right' positive type='submit' content='Submit' />
            <Button as={Link} to='/rooms' floated='right' type='button' content='Cancel'/>
          </Form>
          )}
        </Formik>
        </>
      }
      </>
    )
})