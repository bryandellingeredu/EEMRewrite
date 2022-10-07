import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Grid, Header, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import MyDateInput from "../../../app/common/form/MyDateInput";
import MyDataList from "../../../app/common/form/MyDataList";
import { ActivityFormValues } from "../../../app/models/activity";
import MyCheckBox from "../../../app/common/form/MyCheckBox";
import LocationRadioButtons from "./LocationRadioButtons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleRoof } from "@fortawesome/free-solid-svg-icons";
import RoomPicker from "./RoomPicker";
import MyTextInput from "../../../app/common/form/MyTextInput";
import { v4 as uuid } from 'uuid';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Login } from "@microsoft/mgt-react";

function useIsSignedIn(): [boolean] {
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    const updateState = () => {
      const provider = Providers.globalProvider;
      setIsSignedIn(provider && provider.state === ProviderState.SignedIn);
    };

    Providers.onProviderUpdated(updateState);
    updateState();

    return () => {
      Providers.removeProviderUpdatedListener(updateState);
    }
  }, []);
  return [isSignedIn];
}

export default observer(function ActivityForm() {
  const [isSignedIn] = useIsSignedIn();
  const history = useHistory();
  const { activityStore, categoryStore, organizationStore, locationStore, commonStore, graphUserStore } = useStore();
  const { createGraphEvent, updateGraphEvent, createActivity, updateActivity,
    loadActivity, loadingInitial } = activityStore;
  const { categoryOptions, categories, loadCategories } = categoryStore;
  const { graphUser, loadUser} = graphUserStore;
  const { locationOptions, loadLocations } = locationStore;
  const { organizationOptions, organizations, loadOrganizations } = organizationStore;
  const { id } = useParams<{ id: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());
  const [roomRequired, setRoomRequired] = useState<boolean>(false);
  const [roomEmails, setRoomEmails] = useState<string[]>([]);
  const handleSetRoomRequired = () => setRoomRequired(!roomRequired);

  const handleSetRoomEmails = (roomEmails: string[]) => {
    setRoomEmails(roomEmails);
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('The title is required'),
    categoryId: Yup.string().required('Category is required, choose other if you are just reserving a room'),
    start: Yup.string().required().nullable(),
    end: Yup.string().required().nullable(),
    actionOfficer: Yup.string().when("categoryId", {
      is: categories.find(x => x.name === "Academic Calendar")?.id,
      otherwise: Yup.string().required("Action Officer is Required") || categories.find(x => x.name === "Other")?.id
    }),
    actionOfficerPhone: Yup.string().when("categoryId", {
      is: categories.find(x => x.name === "Academic Calendar")?.id || categories.find(x => x.name === "Other")?.id ,
      otherwise: Yup.string().required("Action Officer is Required")
    })
  })

  useEffect(() => {
    if (id) {
      loadActivity(id, categoryId).then((response) => {
        setActivity(new ActivityFormValues(response));
        if (response?.activityRooms && response.activityRooms.length > 0){
          setRoomRequired(true);
          setRoomEmails(response.activityRooms.map(x => x.email));
        } 
      });
      loadOrganizations();
      loadLocations();
    } else {
      loadCategories();
      loadOrganizations();
      loadLocations();
    }
    if(isSignedIn){
      loadUser();
    }
  }, [id, categoryId,
    loadActivity, loadCategories, loadOrganizations, loadLocations, loadUser,
    categoryStore.loadingInitial, organizationStore.loadingInitial, locationStore.loadingInitial,
    loadingInitial,]);

  function handleFormSubmit(activity: ActivityFormValues) {
    activity.roomEmails = roomRequired ? roomEmails : [];
    activity.startDateAsString = commonStore.convertDateToGraph(activity.start, activity.allDayEvent);
    activity.endDateAsString = commonStore.convertDateToGraph(activity.end, activity.allDayEvent);
    activity.coordinatorEmail = isSignedIn &&  graphUser ? graphUser.mail : '';
    activity.coordinatorName = isSignedIn &&  graphUser ? graphUser.displayName : '';
    activity.coordinatorFirstName = isSignedIn &&  graphUser ? graphUser.givenName : '';
    activity.coordinatorLastName = isSignedIn &&  graphUser ? graphUser.surname : '';
    const category = categories.find(x => x.id === activity.categoryId)!
    const organization = activity.organizationId ? organizations.find(x => x.id === activity.organizationId) || null : null;
    activity.organizationId = activity.organizationId || null;
    activity.category = category;
    activity.organization = organization;
    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: category.name === 'Academic Calendar' ? '' : uuid(),
      };
      category.name === 'Academic Calendar'
        ? createGraphEvent(newActivity).then(() => history.push(`/activities/${newActivity.id}/${category.id}`))
        : createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}/${category.id}`))
    } else {
      category.name === 'Academic Calendar'
        ? updateGraphEvent({ ...activity, id: activity!.id }).then(() => history.push(`/activities/${activity.id}/${category.id}`))
        : updateActivity({ ...activity, id: activity!.id }).then(() => history.push(`/activities/${activity.id}/${category.id}`))
    }
  }


  if (loadingInitial
    || categoryStore.loadingInitial
    || organizationStore.loadingInitial
    || locationStore.loadingInitial
    || graphUserStore.loadingInitial) {
    return (
      <LoadingComponent content='Loading form...' />
    )
  }

  return (
    <Segment clearing>
      <Header content={activity.id ? 'Update ' : 'Create New '} Calendar Event sub color='teal' />
      <Formik enableReinitialize
        validationSchema={validationSchema}
        initialValues={activity}
        onSubmit={values => handleFormSubmit(values)}>

        {({ handleSubmit, isValid, isSubmitting, dirty, values, setFieldValue }) => (

          <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
            <MyTextInput name='title' placeholder='Title' label='Title*' />
            <MyTextArea rows={3} placeholder='Description' name='description' label='Description' />
            <MySelectInput options={categoryOptions} placeholder='Sub Calendar' name='categoryId' label='*Sub Calendar' />
            <MyCheckBox name='allDayEvent' label='All Day Event' />
            {!values.allDayEvent &&
              <MyDateInput
                timeIntervals={15}
                placeholderText='Start Date / Time'
                name='start'
                showTimeSelect
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm aa'
                title='*Start' />
            }
            {values.allDayEvent &&
              <MyDateInput
                placeholderText='Start Date'
                name='start'
                dateFormat='MMMM d, yyyy'
                title='*Start' />
            }
            {!values.allDayEvent &&
              <MyDateInput
                timeIntervals={15}
                placeholderText='End Date / Time'
                name='end'
                showTimeSelect
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm aa'
                title='*End' />
            }
            {values.allDayEvent &&
              <MyDateInput
                placeholderText='End Date'
                name='end'
                dateFormat='MMMM d, yyyy'
                title='*End' />
            }
            <LocationRadioButtons roomRequired={roomRequired} setRoomRequired={handleSetRoomRequired} />
            {!roomRequired &&
              <MyDataList name='primaryLocation'
                placeholder='Primary Location'
                label='Primary Location'
                dataListId="locations"
                options={locationOptions}
              />
            }

            {roomRequired &&
              <Segment color='purple'>
                <Header as='h5' textAlign="center">
                  <FontAwesomeIcon icon={faPeopleRoof} size='2x' style={{ marginRight: '10px' }} color='purple' />
                  <span style={{ color: 'purple' }}>Book a Room</span>
                </Header>
                {!isSignedIn &&
                  <Segment>
                    <Grid>
                      <Grid.Column width={5}>
                        <Login />
                      </Grid.Column>
                      <Grid.Column width={11}>
                        <div style={{ marginTop: '15px' }}>to your edu account to reserve this room</div>
                      </Grid.Column>
                    </Grid>
                  </Segment>
                }
                {isSignedIn &&
                  <RoomPicker
                    start={values.start}
                    end={values.end}
                    setRoomEmails={handleSetRoomEmails}
                    roomEmails={roomEmails} />
                }
              </Segment>
            }
            {values.categoryId && categories.find(x => x.id === values.categoryId)?.name !== 'Academic Calendar' &&
              <>
                <MySelectInput options={organizationOptions} placeholder='Lead Org' name='organizationId' label='*Lead Org' />
                <MyTextInput name='actionOfficer' placeholder='Action Officer' label='*Action Officer' />
                <MyTextInput name='actionOfficerPhone' placeholder='Action Officer Duty Phone' label='*Action Officer Duty Phone' />
              </>
            }
            <span>IsValid: {isValid ? 'true' : 'false'}</span>
            <Button
              disabled={isSubmitting || !isValid || !dirty}
              loading={isSubmitting} floated='right' positive type='submit' content='Submit' />
            <Button as={Link} to='/activities' floated='right' type='button' content='Cancel'
            />
          </Form>
        )}
      </Formik>
    </Segment>
  )
})