import { observer } from "mobx-react-lite";
import { useState, useEffect} from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Header,
  Icon,
  Segment,
  Form as SemanticForm,
  Popup,
  Message,
  Grid,
  Divider,
} from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
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
import { v4 as uuid } from "uuid";
import { Providers, ProviderState } from "@microsoft/mgt";
import RecurrenceInformation from "./RecurrenceInformation";
import {
  Recurrence,
  RecurrenceFormValues,
} from "../../../app/models/recurrence";
import { format } from "date-fns";
import MySemanticCheckBox from "../../../app/common/form/MySemanticCheckbox";
import MySemanticRadioButton from "../../../app/common/form/MySemanticRadioButton";
import ScrollToFieldError from "../../../app/common/form/ScrollToFieldError";

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
    };
  }, []);
  return [isSignedIn];
}

export default observer(function ActivityForm() {
  const [isSignedIn] = useIsSignedIn();
  const history = useHistory();
  const {
    activityStore,
    categoryStore,
    organizationStore,
    locationStore,
    commonStore,
    graphUserStore,
    modalStore,
  } = useStore();
  const {
    createGraphEvent,
    updateGraphEvent,
    createActivity,
    updateActivity,
    loadActivity,
    loadingInitial,
  } = activityStore;
  const { categoryOptions, categories, loadCategories } = categoryStore;
  const { graphUser, loadUser } = graphUserStore;
  const { locationOptions, loadLocations } = locationStore;
  const { organizationOptions, organizations, loadOrganizations } =
    organizationStore;
  const { id } = useParams<{ id: string }>();
  const { manageSeries } = useParams<{ manageSeries: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(
    new ActivityFormValues()
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    new RecurrenceFormValues()
  );
  const [recurrenceInd, setRecurrenceInd] = useState<boolean>(false);
  const [roomRequired, setRoomRequired] = useState<boolean>(false);
  const [roomEmails, setRoomEmails] = useState<string[]>([]);
  const [originalRoomEmails, setOriginalRoomEmails] = useState<string[]>([]);
  const handleSetRoomRequired = () => setRoomRequired(!roomRequired);

  const handleSetRoomEmails = (roomEmails: string[]) => {
    setRoomEmails(roomEmails);
  };

  const handleSetRecurrence = (recurrence: Recurrence) => {
    setRecurrence(recurrence);
  };

  const handleSetRecurrenceInd = (recurrenceInd: boolean) => {
    setRecurrenceInd(recurrenceInd);
  };

  const validationSchema = Yup.object({
    communityEvent: Yup.boolean(),
    checkedForOpsec: Yup.boolean()
                        .when("communityEvent",
                         {is: true,
                          then: Yup.boolean().isTrue("Review event details for pii and opsec and check the box ")
                         }),
    title: Yup.string().required("The title is required"),
    categoryId: Yup.string().required(
      "Category is required, choose other if you are just reserving a room"
    ),
    start: Yup.string()
      .required()
      .nullable()
      .test("startBeforeEnd", "Start must be before End", function () {
        return this.parent.start < this.parent.end;
      }),
    end: Yup.string().required().nullable(),
    actionOfficer: Yup.string().when("categoryId", {
      is: categories.find((x) => x.name === "Academic Calendar")?.id,
      otherwise:
        Yup.string().required("Action Officer is Required") ||
        categories.find((x) => x.name === "Other")?.id,
    }),
    actionOfficerPhone: Yup.string().when("categoryId", {
      is:
        categories.find((x) => x.name === "Academic Calendar")?.id ||
        categories.find((x) => x.name === "Other")?.id,
      otherwise: Yup.string().required("Action Officer is Required"),
    }),
  });

  useEffect(() => {
    if (id) {
      loadActivity(id, categoryId).then((response) => {
        setActivity(new ActivityFormValues(response));
        if (response?.activityRooms && response.activityRooms.length > 0) {
          setRoomRequired(true);
          setRoomEmails(response.activityRooms.map((x) => x.email));
          setOriginalRoomEmails(response.activityRooms.map((x) => x.email));
        }
        if (response?.recurrenceInd && response?.recurrence) {
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
    if (isSignedIn) {
      loadUser();
    }
  }, [isSignedIn]);

  function handleFormSubmit(activity: ActivityFormValues) {
    activity.recurrenceInd = recurrenceInd;
    activity.recurrence = recurrence;
    activity.roomEmails = roomRequired ? roomEmails : [];
    activity.startDateAsString = commonStore.convertDateToGraph(
      activity.start,
      activity.allDayEvent,
      false
    );
    activity.endDateAsString = commonStore.convertDateToGraph(
      activity.end,
      activity.allDayEvent,
      true
    );
    activity.coordinatorEmail = isSignedIn && graphUser ? graphUser.mail : "";
    activity.coordinatorName =
      isSignedIn && graphUser ? graphUser.displayName : "";
    activity.coordinatorFirstName =
      isSignedIn && graphUser ? graphUser.givenName : "";
    activity.coordinatorLastName =
      isSignedIn && graphUser ? graphUser.surname : "";
    const category = categories.find((x) => x.id === activity.categoryId)!;
    const organization = activity.organizationId
      ? organizations.find((x) => x.id === activity.organizationId) || null
      : null;
    activity.organizationId = activity.organizationId || null;
    activity.category = category;
    activity.organization = organization;
    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: category.name === "Academic Calendar" ? "" : uuid(),
      };
      category.name === "Academic Calendar"
        ? createGraphEvent(newActivity).then(() =>
            history.push(`${process.env.PUBLIC_URL}/activities/${newActivity.id}/${category.id}`)
          )
        : createActivity(newActivity).then(() =>
            history.push(`${process.env.PUBLIC_URL}/activities/${newActivity.id}/${category.id}`)
          );
    } else {
      category.name === "Academic Calendar"
        ? updateGraphEvent({ ...activity, id: activity!.id }).then(() =>
            history.push(`${process.env.PUBLIC_URL}/activities/${activity.id}/${category.id}`)
          )
        : updateActivity({ ...activity, id: activity!.id }, manageSeries).then(() =>
            history.push(`${process.env.PUBLIC_URL}/activities/${activity.id}/${category.id}`)
          );
    }
  }

  if (
    loadingInitial ||
    categoryStore.loadingInitial ||
    organizationStore.loadingInitial ||
    locationStore.loadingInitial ||
    graphUserStore.loadingInitial
  ) {
    return <LoadingComponent content="Loading form..." />;
  }

  const FormObserver: React.FC = () => {
    const { values, setFieldValue, submitCount } = useFormikContext();
    const v = values as ActivityFormValues;
    useEffect(() => {
      if (v.end < v.start) {
        setFieldValue("end", new Date(v.start.getTime() + 30 * 60000));
      }
    }, [values, setFieldValue]);
    return null;
  };

  

  return (
    <Segment clearing>
      <Header
        content={activity.id ? `Update ${activity.title}` : "Add Event"}
        Calendar
        Event
        sub
        color="teal"
      />
      <Formik
        enableReinitialize
        validationSchema={validationSchema}
        initialValues={activity}
        onSubmit={(values) => handleFormSubmit(values)}
      >
        {({ handleSubmit, isValid, isSubmitting, dirty, values }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
            <FormObserver />
            <ScrollToFieldError />
            <MyTextInput name="title" placeholder="Title" label="*Title:" />
            <MyTextArea
              rows={3}
              placeholder="Description"
              name="description"
              label="Event Details:"
            />

<Grid>
            <Grid.Row>
            <Grid.Column width={3}>
                      <strong>
                      Community Event:
                      </strong>
            </Grid.Column>
            <Grid.Column width={13}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="communityEvent" label="Check if the event is public and should show on the Community Calendar"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
   <Divider/>

          { values.communityEvent &&
           <Segment inverted color='red'>
           <MyCheckBox
              name="checkedForOpsec"
              label="You selected Community Event so you must review the event details for OPSEC and PII. check this box when complete"/>
           </Segment>
          }

<Grid>
            <Grid.Row>
            <Grid.Column width={3}>
                      <strong>
                      All Day Event:
                      </strong>
            </Grid.Column>
            <Grid.Column width={13}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="allDayEvent"
               label="Check if the event occurs for the entire work day"
               disabled={
                id && originalRoomEmails && originalRoomEmails.length
                  ? true
                  : false
              }/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

            {id && originalRoomEmails && originalRoomEmails.length > 0 && (
              <>
                <Popup
                  trigger={
                    <SemanticForm.Field>
                      <label>*Start:</label>
                      <input
                        name="start"
                        value={
                          values.allDayEvent
                            ? format(values.start, "MMMM d, yyyy")
                            : format(values.start, "MMMM d, yyyy h:mm aa")
                        }
                        disabled
                      />
                    </SemanticForm.Field>
                  }
                >
                  <Popup.Header>
                    Why can't I change the start date?
                  </Popup.Header>
                  <Popup.Content>
                    This event has a current room reservation. To change the
                    start date you must first cancel the room reservation. To do
                    this choose "no room required" and save your work. you will
                    then be able to change the start date and reserve a room.
                  </Popup.Content>
                </Popup>

                <Popup
                  trigger={
                    <SemanticForm.Field>
                      <label>*End:</label>
                      <input
                        name="end"
                        value={
                          values.allDayEvent
                            ? format(values.end, "MMMM d, yyyy")
                            : format(values.end, "MMMM d, yyyy h:mm aa")
                        }
                        disabled
                      />
                    </SemanticForm.Field>
                  }
                >
                  <Popup.Header>Why can't I change the end date?</Popup.Header>
                  <Popup.Content>
                    This event has a current room reservation. To change the end
                    date you must first cancel the room reservation. To do this
                    choose "no room required" and save your work. you will then
                    be able to change the end date and reserve a room.
                  </Popup.Content>
                </Popup>
              </>
            )}

            {!values.allDayEvent &&
              !(id && originalRoomEmails && originalRoomEmails.length) && (
                <MyDateInput
                  timeIntervals={15}
                  placeholderText="Start Date / Time"
                  name="start"
                  showTimeSelect
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  title="*Start:"
                  minDate= {new Date()}
                />
              )}
            {values.allDayEvent &&
              !(id && originalRoomEmails && originalRoomEmails.length) && (
                <MyDateInput
                  placeholderText="Start Date"
                  name="start"
                  dateFormat="MMMM d, yyyy"
                  title="*Start:"
                  minDate= {new Date()}
                  disabled={
                    id && originalRoomEmails && originalRoomEmails.length
                      ? true
                      : false
                  }
                />
              )}
            {!values.allDayEvent &&
              !(id && originalRoomEmails && originalRoomEmails.length) && (
                <MyDateInput
                  timeIntervals={15}
                  placeholderText="End Date / Time"
                  name="end"
                  showTimeSelect
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  title="*End:"
                  minDate={values.start}
                  disabled={
                    id && originalRoomEmails && originalRoomEmails.length
                      ? true
                      : false
                  }
                />
              )}
            {values.allDayEvent &&
              !(id && originalRoomEmails && originalRoomEmails.length) && (
                <MyDateInput
                  placeholderText="End Date"
                  name="end"
                  dateFormat="MMMM d, yyyy"
                  title="*End:"
                  minDate={values.start}
                  disabled={
                    id && originalRoomEmails && originalRoomEmails.length
                      ? true
                      : false
                  }
                />
              )}
            {(!id || (manageSeries && manageSeries === "true")) && (
              <>
                {id && originalRoomEmails && originalRoomEmails.length > 0 && (
                  <Popup
                    trigger={
                      <SemanticForm.Field>
                        <label>Does Event Repeat?</label>
                        <Button icon labelPosition="left" disabled>
                          Repeating Event
                          {!recurrenceInd && <Icon name="square outline" />}
                          {recurrenceInd && (
                            <Icon name="check square outline" />
                          )}
                        </Button>
                      </SemanticForm.Field>
                    }
                  >
                    <Popup.Header>
                      Why can't I change how this series repeats?
                    </Popup.Header>
                    <Popup.Content>
                      This series has current room reservations. To change the
                      series you must first cancel the room reservation. To do
                      this choose "no room required" and save your work. you
                      will then be able to set the series and reserve a room.
                    </Popup.Content>
                  </Popup>
                )}

                {!(
                  id &&
                  originalRoomEmails &&
                  originalRoomEmails.length > 0
                ) && (
                  <SemanticForm.Field>
                    <label>Does Event Repeat?</label>
                    <Button
                     type="button"
                      icon
                      labelPosition="left"
                      onClick={() =>
                        modalStore.openModal(
                          <RecurrenceInformation
                            recurrence={recurrence}
                            start={values.start}
                            setRecurrenceInd={handleSetRecurrenceInd}
                            setRecurrence={handleSetRecurrence}
                          />, 'large'
                        )
                      }
                    >
                      Repeating Event
                      {!recurrenceInd && <Icon name="square outline" />}
                      {recurrenceInd && <Icon name="check square outline" />}
                    </Button>
                  </SemanticForm.Field>
                )}
              </>
            )}
       
              <MySelectInput
                    options={organizationOptions}
                    placeholder="Lead Org"
                    name="organizationId"
                    label="*Lead Org:"
                  />
                  <MyTextInput
                    name="actionOfficer"
                    placeholder="Action Officer"
                    label="*Action Officer:"
                  />
                  <MyTextInput
                    name="actionOfficerPhone"
                    placeholder="Action Officer Duty Phone"
                    label="*Action Officer Duty Phone:"
                  />
            <LocationRadioButtons
              roomRequired={roomRequired}
              setRoomRequired={handleSetRoomRequired}
            />
          
            
          {!roomRequired && (  
            <>
              <MyDataList
                name="primaryLocation"
                placeholder="Primary Location"
                label="Primary Location: (Pick from the list or type your own)"
                dataListId="locations"
                options={locationOptions}
              />
<div className= "ui yellow message">
        <div className="header">
            Primary Location does not Reserve a Room
        </div>
        Primary Location is for the general location of your event only. This field does NOT reserve a room. To reserve a room choose the room required option above.
    </div> 
    </>
          )}
       
      <Grid>
            <Grid.Row>
            <Grid.Column width={3}>
                      <strong>
                      G5 Calendar:
                      </strong>
            </Grid.Column>
            <Grid.Column width={13}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="g5Calendar"
               label="Check to add the G5 Long Range Calendar"
               disabled={
                id && originalRoomEmails && originalRoomEmails.length
                  ? true
                  : false
              }/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>
        
           
            {values.g5Calendar && 
                  <MySelectInput
                  options={[
                    {text: '', value: ''},
                    {text: 'OSD', value: 'OSD' },
                    {text: 'JS', value: 'JS' },
                    {text: 'ARMY', value: 'ARMY' },
                    {text: 'FORSCOM', value: 'FORSCOM' },
                    {text: 'TRADOC', value: 'TRADOC' },
                    {text: 'USAWC HQ', value: 'USAWC HQ' },
                    {text: 'SSL', value: 'SSL' },
                    {text: 'CSL', value: 'CSL' },
                    {text: 'SSI', value: 'SSI' },
                    {text: 'PKSOI', value: 'PKSOI' },
                    {text: 'AHEC', value: 'AHEC' },
                    {text: 'ASEP', value: 'ASEP' },
                  ]}
                  placeholder="Select an Organization"
                  name="g5Organization"
                  label="Organization: (Select the organization that best describes how this event ties into USAWC long range planning)"
                />
            }
  
            {roomRequired && (
              <>
              <Segment color ="purple">
                <Header as="h5" textAlign="center">
                  <FontAwesomeIcon
                    icon={faPeopleRoof}
                    size="2x"
                    style={{ marginRight: "10px" }}
                    color="purple"
                  />
                  <span style={{ color: "purple" }}>Book a Room</span>
                </Header>          
                  <RoomPicker
                    start={values.start}
                    end={values.end}
                    setRoomEmails={handleSetRoomEmails}
                    roomEmails={roomEmails}
                    recurrenceInd={recurrenceInd}
                    recurrence={recurrence}
                  />
                     <MyTextInput
                name="numberAttending"
                placeholder="Number Attending"
                label="Number Attending:"
              />
              <MyTextInput
                name="phoneNumberForRoom"
                placeholder="Phone # of person requesting room"
                label="Phone Number of Person Requesting Room:"
              />
              <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'Full Room Config (CCR Only)', value: 'Full Room Config (CCR Only)' },
                {text: 'Small Circle Config (CCR Only)', value: 'Small Circle Config (CCR Only)' },
                {text: 'Large U Config (CCR Only)', value: 'Large U Config (CCR Only)' },
                {text: 'Small U Config (CCR Only)', value: 'Small U Config (CCR Only)' }
              ]}
              placeholder="Room Setup"
              name="roomSetUp"
              label="Room Setup: (For CCR)"
            />
            <MyTextArea
              rows={3}
              placeholder="Special Instructions"
              name="roomSetUpInstructions"
              label="Special Room Setup Instructions:"
            />
            <MyCheckBox
              name="vtc"
              label="VTC: (allow 30 minute set up time)"/>

              <hr color='purple'/>
              </Segment>
             
              </>
            )}
                     
           <MySelectInput
              options={categoryOptions.filter(
                (x: any) => x.text !== "Academic Calendar"
              )}
              placeholder="Sub Calendar"
              name="categoryId"
              label="*Sub Calendar:"
            />
            {['ASEP Calendar']
            .includes(categories
                      .find((x) => x.id === values.categoryId)?.name || '')
                       && 
        <>
         <Divider/>
         <Grid>
            <Grid.Row>
            <Grid.Column width={1}>
                      <strong>
                        IMC:
                      </strong>
            </Grid.Column>
            <Grid.Column width={15}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="imc" label="Add to Integrated Master Calendar"/>
            </SemanticForm.Group>
            <i>For Directorates only (e.g. CSL, PKSOI, SSI, USAG) Copies event from 
                directorate calendar to IMC. Add event to give CMD Gro up Situational Awareness (SI). External coordination needed.
              </i>
            </Grid.Column>
            </Grid.Row>
           
           </Grid>
           <Divider/>
           </>
          }

             <MyTextInput
                name="hyperlink"
                placeholder="https://"
                label="Public Hyperlink: (CBKS online links are not available to the public)"
              />

             <MyTextInput
                name="hyperlinkDescription"
                placeholder="desciption for the link"
                label="Public Hyperlink Description:"
              />
            <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'Undetermined', value: 'Undetermined' },
                {text: 'Unclassified', value: 'Unclassified' },
                {text: 'Secret', value: 'Secret' },
                {text: 'Top Secret', value: 'Top Secret' },
                {text: 'TS-SCI', value: 'TS-SCI' },
              ]}
              placeholder="Event Clearance Level"
              name="eventClearanceLevel"
              label="Event Clearance Level:"
            />

          <Divider/>
           <Grid>
            <Grid.Row>
            <Grid.Column width={3}>
                      <strong>
                      MFP:
                      </strong>
            </Grid.Column>
            <Grid.Column width={13}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="mfp" label="Only for Military Family Program 'MFP' Personnel"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>


             <Divider/>
            <Grid>
            <Grid.Row>
            <Grid.Column width={3}>
                      <strong>
                        Request Presence:
                      </strong>
                    </Grid.Column>
            <Grid.Column width={13}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="commandantRequested" label="Commandant"/>
              <MySemanticCheckBox name="dptCmdtRequested" label="Dept Cmdt"/>
              <MySemanticCheckBox name="provostRequested" label="Provost"/>
              <MySemanticCheckBox name="cofsRequested" label="Cofs"/>
              <MySemanticCheckBox name="deanRequested" label="Dean"/>
              <MySemanticCheckBox name="ambassadorRequested" label="Ambassador"/>
              <MySemanticCheckBox name="cSMRequested" label="CSM"/>
            </SemanticForm.Group>
            <i>Request the presence of the leader. (Sends an e-mail invite to the leader's admin assistant.)</i>
            </Grid.Column>
            </Grid.Row>
           </Grid>
           <Divider/>

           <Grid>
           <Grid.Row>
            <Grid.Column width={3}>
                      <strong>
                       Reports:
                      </strong>
            </Grid.Column>
            <Grid.Column width={13}>
            <MySemanticRadioButton
                        label="None"
                        value="none"
                        name="report"
                      />
              <MySemanticRadioButton
                        label="Hosting Report - BG / Flag Officer or above or Civilian Equiv"
                        value="Hosting Report"
                        name="report"
                      />
              <MySemanticRadioButton
                        label="Outsiders Report - Important Visitors, COL or Below, that are meeting with students, staff, or faculty"
                        value="Outsiders Report"
                        name="report"
                      />
            </Grid.Column>
           </Grid.Row>
          </Grid>  
          <Divider />
            <Button
              disabled={isSubmitting}
              loading={isSubmitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              as={Link}
              to={`${process.env.PUBLIC_URL}/activities`}
              floated="right"
              type="button"
              content="Cancel"
            />
          </Form>
        )}
      </Formik>
    </Segment>
  );
});
