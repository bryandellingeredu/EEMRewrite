import { observer } from "mobx-react-lite";
import { useState, useEffect, FormEvent } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Grid, Header, Icon, Segment, Form as SemanticForm, Popup, } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form, useFormikContext } from "formik";
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
import RecurrenceInformation from "./RecurrenceInformation";
import { Recurrence, RecurrenceFormValues } from "../../../app/models/recurrence";
import { format } from "date-fns";

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
  const { activityStore, categoryStore, organizationStore,
         locationStore, commonStore, graphUserStore, modalStore } = useStore();
  const { createGraphEvent, updateGraphEvent, createActivity, updateActivity,
    loadActivity, loadingInitial } = activityStore;
  const { categoryOptions, categories, loadCategories } = categoryStore;
  const { graphUser, loadUser} = graphUserStore;
  const { locationOptions, loadLocations } = locationStore;
  const { organizationOptions, organizations, loadOrganizations } = organizationStore;
  const { id } = useParams<{ id: string }>();
  const { manageSeries } = useParams<{ manageSeries: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());
  const [recurrence, setRecurrence] = useState<Recurrence>(new RecurrenceFormValues())
  const [recurrenceInd, setRecurrenceInd] = useState<boolean>(false);
  const [roomRequired, setRoomRequired] = useState<boolean>(false);
  const [roomEmails, setRoomEmails] = useState<string[]>([]);
  const [originalRoomEmails, setOriginalRoomEmails] = useState<string[]>([]);
  const handleSetRoomRequired = () => setRoomRequired(!roomRequired);

  const handleSetRoomEmails = (roomEmails: string[]) => {
    setRoomEmails(roomEmails);
  }

  const handleSetRecurrence = (recurrence: Recurrence) =>{
    setRecurrence(recurrence);
  }

  const handleSetRecurrenceInd = (recurrenceInd: boolean) => {
    setRecurrenceInd(recurrenceInd);
  }

 

  const validationSchema = Yup.object({
    title: Yup.string().required('The title is required'),
    categoryId: Yup.string().required('Category is required, choose other if you are just reserving a room'),
    start: Yup.string().required().nullable()
    .test('startBeforeEnd', 'Start must be before End', function(){
      return (this.parent.start < this.parent.end)
    }),
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
          setOriginalRoomEmails(response.activityRooms.map(x => x.email));
        } 
        if (response?.recurrenceInd && response?.recurrence){
          setRecurrence(response.recurrence);
          setRecurrenceInd(true);
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
  }, [isSignedIn]);

  function handleFormSubmit(activity: ActivityFormValues) {
    activity.recurrenceInd = recurrenceInd;
    activity.recurrence = recurrence;
    activity.roomEmails = roomRequired ? roomEmails : [];
    activity.startDateAsString = commonStore.convertDateToGraph(activity.start, activity.allDayEvent, false);
    activity.endDateAsString = commonStore.convertDateToGraph(activity.end, activity.allDayEvent, true);
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

  const FormObserver: React.FC = () => {
    const { values, setFieldValue } = useFormikContext();
    const v  = values as ActivityFormValues;
    useEffect(() => {
      if (v.end < v.start){
        setFieldValue('end', new Date(v.start.getTime() + 30 * 60000));
      }
    }, [values, setFieldValue]);
    return null;
  };

  return (
    <Segment clearing>
      <Header content={activity.id ? 'Update ' : 'Create New '} Calendar Event sub color='teal' />
      <Formik enableReinitialize
        validationSchema={validationSchema}
        initialValues={activity}
        onSubmit={values => handleFormSubmit(values)}>

        {({ handleSubmit, isValid, isSubmitting, dirty, values }) => (
         

          <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
          <FormObserver />
            <MyTextInput name='title' placeholder='Title' label='Title*' />
            <MyTextArea rows={3} placeholder='Description' name='description' label='Description' />
            <MySelectInput options={categoryOptions.filter((x: any) => x.text !== 'Academic Calendar')} placeholder='Sub Calendar' name='categoryId' label='*Sub Calendar' />
            <MyCheckBox name='allDayEvent' label='All Day Event'
             disabled = {id && originalRoomEmails && originalRoomEmails.length ? true : false}
             />
     
          { (id  && originalRoomEmails && originalRoomEmails.length > 0)  && 
          <>
            <Popup
    trigger={
  <SemanticForm.Field>
      <label>*Start</label>
      <input   name='start' 
        value= {values.allDayEvent ? format(values.start, 'MMMM d, yyyy') : format(values.start, 'MMMM d, yyyy h:mm aa')} 
        disabled/>
    </SemanticForm.Field>
     }>
        <Popup.Header>Why can't I change the start date?</Popup.Header>
    <Popup.Content>
      This event has a current room reservation.  To change the start date you must first cancel the room reservation. To do this 
      choose "no room required" and save your work.  you will then be able to change the start date and reserve a room.
    </Popup.Content>
     </Popup>

<Popup
trigger={
<SemanticForm.Field>
  <label>*End</label>
  <input   name='end' 
    value= {values.allDayEvent ? format(values.end, 'MMMM d, yyyy') : format(values.end, 'MMMM d, yyyy h:mm aa')} 
    disabled/>
</SemanticForm.Field>
 }>
    <Popup.Header>Why can't I change the end date?</Popup.Header>
<Popup.Content>
  This event has a current room reservation.  To change the end date you must first cancel the room reservation. To do this 
  choose "no room required" and save your work.  you will then be able to change the end date and reserve a room.
</Popup.Content>
 </Popup>
 </>
   }
            
            {!values.allDayEvent && !( id && originalRoomEmails && originalRoomEmails.length) && 
              <MyDateInput
                timeIntervals={15}
                placeholderText='Start Date / Time'
                name='start'
                showTimeSelect
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm aa'
                title='*Start'   />
            }
            {values.allDayEvent && !( id && originalRoomEmails && originalRoomEmails.length) &&
              <MyDateInput
                placeholderText='Start Date'
                name='start'
                dateFormat='MMMM d, yyyy'
                title='*Start'
                disabled = {id && originalRoomEmails && originalRoomEmails.length ? true : false} />
            }
            {!values.allDayEvent && !( id && originalRoomEmails && originalRoomEmails.length) &&
              <MyDateInput
                timeIntervals={15}
                placeholderText='End Date / Time'
                name='end'
                showTimeSelect
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm aa'
                title='*End'
                minDate={values.start}
                disabled = {id && originalRoomEmails && originalRoomEmails.length ? true : false} />
            }
            {values.allDayEvent && !( id && originalRoomEmails && originalRoomEmails.length) &&
              <MyDateInput
                placeholderText='End Date'
                name='end'
                dateFormat='MMMM d, yyyy'
                title='*End' 
                minDate={values.start}
                disabled = {id && originalRoomEmails && originalRoomEmails.length ? true : false} />
            }
            {(!id || (manageSeries && manageSeries === 'true')) && 
     <>
     { (id  && originalRoomEmails && originalRoomEmails.length > 0)  && 
<Popup
trigger={
  <SemanticForm.Field>
       <label>Does Event Repeat?</label>
       <Button icon labelPosition="left" disabled >
       Repeating Event
       {!recurrenceInd && <Icon name='square outline' />}
      {recurrenceInd && <Icon name = 'check square outline' />}
        </Button>   
  </SemanticForm.Field>
 }>
    <Popup.Header>Why can't I change how this series repeats?</Popup.Header>
<Popup.Content>
  This series has current room reservations.  To change the series you must first cancel the room reservation. To do this 
  choose "no room required" and save your work.  you will then be able to set the series and reserve a room.
</Popup.Content>
 </Popup>
}

{ !(id  && originalRoomEmails && originalRoomEmails.length > 0)  && 

            <SemanticForm.Field>
              <label>Does Event Repeat?</label>
            <Button icon labelPosition="left"            
              onClick={() => modalStore.openModal(
              <RecurrenceInformation
               recurrence = {recurrence}
               start = {values.start}
               setRecurrenceInd = {handleSetRecurrenceInd}
               setRecurrence = {handleSetRecurrence} />)}
               >
                Repeating Event
                {!recurrenceInd && <Icon name='square outline' />}
                {recurrenceInd && <Icon name = 'check square outline' />}
            </Button>
            </SemanticForm.Field>
          }
            </>
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
                    roomEmails={roomEmails}
                    recurrenceInd={recurrenceInd}
                    recurrence={recurrence} />
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
            <Button
              disabled={isSubmitting || !isValid }
              loading={isSubmitting} floated='right' positive type='submit' content='Submit' />
            <Button as={Link} to='/activities' floated='right' type='button' content='Cancel'
            />
          </Form>
        )}
      </Formik>
    </Segment>
  )
})