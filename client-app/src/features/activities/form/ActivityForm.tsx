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
  Label,
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
import { faBookOpenReader, faFileLines, faPeopleRoof, faPersonRifle } from "@fortawesome/free-solid-svg-icons";
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
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { convertToHTML } from "draft-convert";
import DocumentUploadWidget from "../../../app/common/documentUpload/documentUploadWidget";


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
    uploadDocument,
    uploading
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
  const [submitting, setSubmitting] = useState(false);
  const [attachBioError, setAttachBioError] = useState(false);
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

  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );

  const [bioUrl, setBioUrl] = useState<string>('');

  function handleDocumentUpload(file: any){
    uploadDocument(file).then((url) => {
       setBioUrl(url);
    })
  }

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

        if (response?.hostingReport?.guestItinerary) {
          setEditorState(EditorState.createWithContent(
            convertFromRaw(
            JSON.parse(response!.hostingReport!.guestItinerary))))
        } else {
          setEditorState(EditorState.createEmpty());
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
    let hostingReportError = false;
    setAttachBioError(false);
    if(activity.report === 'Hosting Report'){
      if(!activity.hostingReport?.bioAttachedOrPending){
        setAttachBioError(true);
        hostingReportError = true;
        const currentBioAnchor = document.getElementById('currentBioAnchor');
        if(currentBioAnchor){
          currentBioAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }      
      }
    }
    if(!hostingReportError){
    setSubmitting(true);
    if(activity.report === 'Hosting Report'){
      activity.hostingReport!.guestItinerary = 
         JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    }
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
        {({ handleSubmit, isSubmitting,  values }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
            <FormObserver />
            <ScrollToFieldError />
            <MyTextInput name="title" placeholder="Title" label="*Title:" />
            <MyTextArea
              rows={3}
              placeholder="Description"
              name="description"
              label="Event Details / Description:"
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
                    label="Lead Org:"
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

             {
                values.vtc && 
                <Segment inverted color='brown'>

            <MySelectInput
                options={[
                  {text: 'N/A', value: ''},
                  {text: 'UNCLASS ISDN', value: 'UNCLASS ISDN' },
                  {text: 'UNCLASS IP', value: 'UNCLASS IP' },
                  {text: 'SECRET IP', value: 'SECRET IP' },
                  {text: 'Audio Call Only', value: 'Audio Call Only' }
                ]}
                placeholder="N/A"
                name="vtcClassification"
                label="VTC Classification: (If you don't know the VTC type leave this field blank)"
              />

                <MyTextInput
                name="distantTechPhoneNumber"
                placeholder="Distant Tech Phone Number"
                label="Distant Tech Phone Number:"
              />              
                      
                <MyTextInput
                name="requestorPOCContactInfo"
                placeholder="Enter Name, Phone #"
                label="Requestor POC Contact Info:"
              />              


                <MyTextInput
                name="dialInNumber"
                placeholder="Dial-In Number"
                label="Dial-In Number: (to be entered by VTC Tech if applicable, DO NOT ENTER SIPRNET IP)"
              />              


                <MyTextInput
                name="siteIDDistantEnd"
                placeholder="Site-ID Distant End"
                label="Site-ID Distant End: (to be entered by VTC Tech if applicable, DO NOT ENTER SIPRNET IP)"
              />              



                <Grid>
                <Grid.Row>
                <Grid.Column width={4}>
                          <strong>
                          GO/SES In Attendance:
                          </strong>
                </Grid.Column>
                <Grid.Column width={12}>
                <SemanticForm.Group inline>
                  <MySemanticCheckBox name="gosesInAttendance"/>
                </SemanticForm.Group>
                <i>Check if a  General Officer(GO) / Senior Executive (SES) is in attendance her or at the distant end</i>
                </Grid.Column>
                </Grid.Row>           
               </Grid>
               <Divider/> 


                <MyTextInput
                name="seniorAttendeeNameRank"
                placeholder="Senior Attendee Name/Rank"
                label="Senior Attendee Name/Rank: (General Officers receive priority)"
              />              
              

          <MyTextArea
              rows={3}
              placeholder="Additional VTC Info"
              name="additionalVTCInfo"
              label="Additional VTC Info: (Display presentation across vtc - MUST attach presentation (e.g. Powerpoint, Word, PDF)"
            />

           <MySelectInput
                options={[
                  {text: '', value: ''},
                  {text: 'Tentative', value: 'Tentative' },
                  {text: 'Confirmed', value: 'Confirmed' },
                  {text: 'Cancelled', value: 'Cancelled' },
                ]}
                placeholder="VTC Status"
                name="vtcStatus"
                label="VTC Status: (for VTC Coordinators ONLY)"
              />
               </Segment>
             }

              <hr color='purple'/>
              </Segment>
             
              </>


            )}
            <Segment color='purple' inverted>
           <MySelectInput
              options={categoryOptions.filter(
                (x: any) => x.text !== "Academic Calendar"
              )}
              placeholder="Sub Calendar"
              name="categoryId"
              label="*Sub Calendar:"
            />
            </Segment>   

{ categories.find((x) => x.id === values.categoryId)?.name === 'Weekly Pocket Calendar' &&
  <Segment color ="teal">
      <Header as="h5" icon textAlign="center" color="teal">
      <Icon name='calendar'  />
      <Header.Content>Weekly Pocket Calendar Information</Header.Content>
      </Header>

      <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Pocket Cal Non Academic Event:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="pocketCalNonAcademicEvent"/>
            </SemanticForm.Group>
            <i>For Teresa McGuirk Only</i>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

      <MySelectInput
              options={[
                {text: 'Pre 0', value: 'Pre 0'},
                {text: '0', value: '0' },
                {text: '1', value: '1' },
                {text: '2', value: '2' },
                {text: '3', value: '3' },
                {text: '4', value: '4' },
                {text: '5', value: '5' },
                {text: '6', value: '6' },
                {text: '7', value: '7' },
                {text: '8', value: '8' },
                {text: '9', value: '9' },
                {text: '10', value: '10' },
                {text: '11', value: '11' },
                {text: '12', value: '12' },
                {text: '13', value: '13' },
                {text: '14', value: '14' },
                {text: '15', value: '15' },
                {text: '16', value: '16' },
                {text: '17', value: '17' },
                {text: '18', value: '18' },
                {text: '19', value: '19' },
                {text: '20', value: '20' },
                {text: '21', value: '21' },
                {text: '22', value: '22' },
                {text: '23', value: '23' },
                {text: '24', value: '24' },
                {text: '25', value: '25' },
                {text: '26', value: '26' },
                {text: '27', value: '27' },
                {text: '28', value: '28' },
                {text: '29', value: '29' },
                {text: '30', value: '30' },
                {text: '31', value: '31' },
                {text: '32', value: '32' },
                {text: '33', value: '33' },
                {text: '34', value: '34' },
                {text: '35', value: '35' },
                {text: '36', value: '36' },
                {text: '37', value: '37' },
                {text: '38', value: '38' },
                {text: '39', value: '39' },
                {text: '40', value: '40' },
                {text: '41', value: '41' },
                {text: '42', value: '42' },
                {text: '43', value: '43' },
                {text: '44', value: '44' },
                {text: '45', value: '45' },
                {text: '46', value: '46' },
                {text: '47', value: '47' },
                {text: '48', value: '48' },
                {text: '49', value: '49' },
                {text: '50', value: '50' },
              ]}
              placeholder="Week"
              name="pocketCalWeek"
              label="Week:"
            />

            <MyTextInput
                name="pocketCalLessonNumber"
                placeholder="Lesson Number"
                label="Lesson Number:"
              />

           <MyTextInput
                name="pocketCalPresenter"
                placeholder="Presenter"
                label="Presenter:"
              />

             <MyTextInput
                name="pocketCalPresenterOrg"
                placeholder="Presenter Org"
                label="Presenter Org:"
              />

<MyTextArea
              rows={3}
              placeholder="Notes"
              name="pocketCalNotes"
              label="Notes:"
            />


      <hr color='#00b5ad'/>   
  </Segment>
}


{ categories.find((x) => x.id === values.categoryId)?.name === 'Garrison Calendar' &&
  <Segment color ="orange">
      <Header as="h5" icon textAlign="center" color="orange">
      <Icon name='building'  />
      <Header.Content>Garrison Information</Header.Content>
      </Header>

      <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'ACS', value: 'ACS' },
                {text: 'Chapel', value: 'Chapel' },
                {text: 'Command', value: 'Command' },
                {text: 'CYC', value: 'CYC' },
                {text: 'DES', value: 'DES' },
                {text: 'DHR', value: 'DHR' },
                {text: 'DPTMS', value: 'DPTMS' },
                {text: 'Emergency Management (EM)', value: 'Emergency Management (EM)' },
                {text: 'Holiday', value: 'Holiday' },
                {text: 'MWR', value: 'MWR' },
              ]}
              placeholder="Garrison Category"
              name="garrisonCategory"
              label="Garrison Category:"
            />

<Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Marketing Request:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="marketingRequest"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

      <hr color='#f2711c'/>   
  </Segment>
}


{ categories.find((x) => x.id === values.categoryId)?.name === 'SSL Calendar' &&
  <Segment color ="green">
      <Header as="h5" icon textAlign="center" color="green">
      <FontAwesomeIcon icon={faPersonRifle} size='2x' style={{marginRight: '10px'}} />
      <Header.Content>SSL Information</Header.Content>
      </Header>

      <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'SSL', value: 'SSL' },
                {text: 'DPMSO', value: 'DPMSO' },
                {text: 'DCLM', value: 'DCLM' },
                {text: 'DNSS', value: 'DNSS' },
                {text: 'DDE', value: 'DDE' },
              ]}
              placeholder="SSL"
              name="sslCategories"
              label="SSL Categories:"
            />
      <hr color='#21ba45'/>   
  </Segment>
}

{ categories.find((x) => x.id === values.categoryId)?.name === 'USAHEC Facilities Usage Calendar' &&
  <Segment color ="pink">
      <Header as="h5" icon textAlign="center" color="pink">
      <FontAwesomeIcon icon={faBookOpenReader} size='2x' style={{marginRight: '10px'}} />
      <Header.Content>USAHEC Facilities Usage Information</Header.Content>
      </Header>

      <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'Army Heritage Center Foundation', value: 'Army Heritage Center Foundation' },
                {text: 'Education', value: 'Education' },
                {text: 'Government', value: 'Government' },
                {text: 'Holiday', value: 'Holiday' },
                {text: 'Maintenance', value: 'Maintenance' },
                {text: 'MHINAF', value: 'MHINAF' },
                {text: 'Non/Profit', value: 'Non/Profit' },
                {text: 'Public Event', value: 'Public Event' },
                {text: 'Scouts', value: 'Scouts' },
                {text: 'Training', value: 'Training' },
                {text: 'U.S. Army', value: 'U.S. Army' },
                {text: 'U.S. Army War College', value: 'U.S. Army College' },
                {text: 'USAHEC Meeting', value: 'USAHEC Meeting' },
                {text: 'Veteran', value: 'Veteran' },
              ]}
              placeholder="Reservation Type"
              name="usahecFacilityReservationType"
              label="Reservation Type:"
            />
   
   <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Copy to USAHEC Calendar:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="copyToUSAHECCalendar"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>
            
      <hr color='#e03997'/>   
  </Segment>
}

{ categories.find((x) => x.id === values.categoryId)?.name === 'USAHEC Calendar' &&
  <Segment color ="purple">
      <Header as="h5" icon textAlign="center" color="purple">
      <Icon name='book'  />
      <Header.Content>USAHEC Information</Header.Content>
      </Header>

      <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'AHM', value: 'AHM' },
                {text: 'EDU', value: 'EDU' },
                {text: 'HSD', value: 'HSD' },
                {text: 'LIB', value: 'LIB' },
                {text: 'MHI', value: 'MHI' },
                {text: 'OPS', value: 'OPS' },
                {text: 'VES', value: 'VES' },
              ]}
              placeholder="USAHEC Directorate"
              name="usahecDirectorate"
              label="USAHEC Directorate:"
            />

<MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'Army Heritage Center Foundation', value: 'Army Heritage Center Foundation' },
                {text: 'Budget', value: 'Budget' },
                {text: 'Digitization Project', value: 'Digitization Project' },
                {text: 'Event/Tour', value: 'Event/Tour' },
                {text: 'Holiday', value: 'Holiday' },
                {text: 'Maintenance', value: 'Maintenance' },
                {text: 'Personnel', value: 'Personnel' },
                {text: 'Training', value: 'Training' },
                {text: 'U.S. Army War College', value: 'U.S. Army War College' },
                {text: 'USAHEC Meeting', value: 'USAHEC Meeting' },
              ]}
              placeholder="USAHEC Calendar Category"
              name="usahecCalendarCategory"
              label="USAHEC Calendar Category:"
            />

      <hr color='#a33c8'/>   
  </Segment>
}


           
           { categories.find((x) => x.id === values.categoryId)?.name === 'CSL Calendar' &&

            <Segment color ="blue">
            <Header as="h5" icon textAlign="center" color="blue">
            <Icon name='copyright'  />
            <Header.Content>CSL Information</Header.Content>
            </Header> 

            <MySelectInput
              options={[
                {text: 'Info', value: 'Info'},
                {text: 'Event On-Site', value: 'Event On-Site' },
                {text: 'Event Off-Site', value: 'Event Off-Site' },
                {text: 'Set Up', value: 'Set Up' },
                {text: 'Leave', value: 'Leave' },
                {text: 'TDY', value: 'TDY' },
                {text: 'Holiday', value: 'Holiday' },
                {text: 'VTC', value: 'VTC' },
                {text: 'Task', value: 'Task' },
                {text: 'Farewell', value: 'Farewell' },
                {text: 'Highlight', value: 'Highlight' },
              ]}
              placeholder="Type of Event"
              name="type"
              label="Type of Event:"
            />

          <MySelectInput
              options={[
                {text: 'Blue', value: 'Blue'},
                {text: 'Red', value: 'Red' },
                {text: 'Green', value: 'Green' },
                {text: 'Purple', value: 'Purple' },
                {text: 'Orange', value: 'Orange' },
                {text: 'Brown', value: 'Brown' },
              ]}
              placeholder="Color for Event"
              name="color"
              label="Event Color:"
            />

          <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      DTI Supported Exercise:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="dti"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Supports Education and/or Simulation:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="education"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      CSL Directorate:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="cslDirectorateCSL" label="CSL"/>
              <MySemanticCheckBox name="cslDirectorateDSW" label="DSW"/>
              <MySemanticCheckBox name="cslDirectorateDTI" label="DTI"/>
              <MySemanticCheckBox name="cslDirectorateOPS" label="OPS"/>
              <MySemanticCheckBox name="cslDirectorateSLFG" label="SLFG"/>
              <MySemanticCheckBox name="cslDirectorateFellows" label="Fellows"/>
            </SemanticForm.Group>
            <i>Note: Selecting DSW will copy with the event to the DSW Calendar</i>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <MyTextInput
                name="pax"
                placeholder="PAX"
                label="PAX:"
              />

          
           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Room Requirements:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="roomRequirementBasement" label="Basement"/>
              <MySemanticCheckBox name="roomRequirement1" label="1st Floor"/>
              <MySemanticCheckBox name="roomRequirement2" label="2nd Floor"/>
              <MySemanticCheckBox name="roomRequirement3" label="3rd Floor"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>
          
           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Participation:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="participationCmdt" label="Cmdt Participation"/>
              <MySemanticCheckBox name="participationGO" label="GO Participation"/>
              <MySemanticCheckBox name="participationDir" label="Dir, CSL Participation"/>
              <MySemanticCheckBox name="participationForeign" label="Foreign National Participation"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Automation/VI Support:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="automationProjection" label="Projection"/>
              <MySemanticCheckBox name="automationCopiers" label="Copiers"/>
              <MySemanticCheckBox name="automationPC" label="PC Rqmts"/>
              <MySemanticCheckBox name="automationVTC" label="VTC (3 day notice)"/>
              <MySemanticCheckBox name="automationTaping" label="Taping Rqmts"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <MyTextArea
              rows={3}
              placeholder="Automation Comments / VI Comments"
              name="automationComments"
              label="Automation Comments / VI Comments:"
            />

          <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'Phone Rqmts', value: 'Phone Rqmts' },
                {text: 'Fax Rqmts', value: 'Fax Rqmts' },
              ]}
              placeholder="Communication Support"
              name="communicationSupport"
              label="Communication Support:"
            />

<MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'Unclass', value: 'Unclass' },
                {text: 'Classified', value: 'Classified' },
                {text: 'Both (SECRET and Unclass)', value: 'Both (SECRET and Unclass)' },
              ]}
              placeholder="Fax Classification"
              name="faxClassification"
              label="FAX Classification:"
            />

       <MyTextArea
              rows={3}
              placeholder="Communication Comments"
              name="communicationComments"
              label="Communication Comments:"
            />

        <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Catering Requirements:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="catering"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Catering Area(s):
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="cateringAreaArdennes" label="Ardennes"/>
              <MySemanticCheckBox name="cateringArea18" label="18th Break Area"/>
              <MySemanticCheckBox name="cateringArea22" label="22nd Break Area"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Catering Break Area(s):
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="cateringBreakArea18" label="18th Side Break Area"/>
              <MySemanticCheckBox name="cateringBreakArea22" label="22nd Side Break Area"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>
           
           <MyTextArea
              rows={3}
              placeholder="Catering Comments"
              name="cateringComments"
              label="Catering Comments:"
            />

<MySelectInput
              options={[
                {text: 'None', value: ''},
                {text: 'POV', value: 'POV' },
                {text: 'Rental Car', value: 'Rental Car' },
                {text: 'TMP Van', value: 'TMP Van' },
                {text: 'Buses', value: 'Buses' },
                {text: 'Aviation', value: 'Aviation' },
              ]}
              placeholder="None"
              name="transportation"
              label="Transportation:"
            />

<Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Parking Passes:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="parkingPasses" />
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <MyTextInput
                name="parkingSpaces"
                placeholder="0"
                label="Parking Spaces: (Enter the number of parking spaces)"
              />
            
            <MyTextArea
              rows={3}
              placeholder="Transportation Comments"
              name="transportationComments"
              label="Transportation Comments:"
            />
            
            <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Security:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
            <MySemanticCheckBox name="securityBadgeIssue" label="Badge Issue"/>
            <MySemanticCheckBox name="securityAfterDutyAccess" label="After Duty Access"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <MyTextArea
              rows={3}
              placeholder="Security Comments"
              name="securityComments"
              label="Security Comments:"
            />

<Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Registration:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="registration"/>
            </SemanticForm.Group>
            </Grid.Column>
            </Grid.Row>           
           </Grid>
           <Divider/>

           <MyTextArea
              rows={3}
              placeholder="Registration Location"
              name="registrationLocation"
              label="Registration Location:"
            />

          <MyTextArea
              rows={3}
              placeholder="Supplies Comments"
              name="suppliesComments"
              label="Supplies Comments:"
            />

         <MyTextArea
              rows={3}
              placeholder="Other Comments"
              name="otherComments"
              label="Other Comments:"
            />

<MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'Pending', value: 'Pending' },
                {text: 'Approved', value: 'Approved' },
              ]}
              placeholder="Pending"
              name="approvedByOPS"
              label="Approved by OPS:"
            />

            <hr color='#9ca4fb'/>         
            </Segment>
         }


            {['ASEP Calendar', 'Garrison Calendar', 'PKSOI Calendar', 
            'SSI And USAWC Press Calendar', 'SSL Calendar', 'USAHEC Calendar',
          'USAHEC Facilities Usage Calendar', 'Weekly Pocket Calendar', 'CSL Calendar']
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

          { values.mfp && <MySelectInput
              options={[
                {text: 'No Color', value: ''},
                {text: 'Leadership & Readiness', value: 'Leadership & Readiness' },
                {text: 'Personal Finance Management', value: 'Personal Finance Management' },
                {text: 'Personal Growth and Fitness', value: 'Personal Growth and Fitness' },
                {text: 'Family Growth & Resiliency', value: 'Family Growth & Resiliency' },
                {text: 'TS-SCI', value: 'TS-SCI' },
              ]}
              placeholder="No Color"
              name="educationalCategory"
              label="Educational Category:"
            /> }

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
              <MySemanticCheckBox name="dptCmdtRequested" label="DCOM"/>
              <MySemanticCheckBox name="provostRequested" label="Provost"/>
              <MySemanticCheckBox name="cofsRequested" label="COS"/>
              <MySemanticCheckBox name="deanRequested" label="Dean"/>
              <MySemanticCheckBox name="ambassadorRequested" label="AMB"/>
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
                       Hosting / Visitor Report:
                      </strong>
            </Grid.Column>
            <Grid.Column width={13}>
            <MySemanticRadioButton
                        label="None"
                        value="none"
                        name="report"
                      />
              <MySemanticRadioButton
                        label="Hosting Report (BG (O7) and Above or Civilian SES Equivalent"
                        value="Hosting Report"
                        name="report"
                      />
              <MySemanticRadioButton
                        label="Outsiders Report - Important Visitors, O6 or Below"
                        value="Outsiders Report"
                        name="report"
                      />
            </Grid.Column>
           </Grid.Row>
          </Grid>  

          {
                values.report === 'Hosting Report' && 
                <Segment inverted color='teal'>
                    <Header as="h5" icon textAlign="center" >
      <FontAwesomeIcon icon={faFileLines} size='2x' style={{marginRight: '10px'}} />
      <Header.Content>Hosting Report Information</Header.Content>
      </Header>
            <MyTextArea
              rows={3}
              placeholder="Description"
              name="hostingReport.purposeOfVisit"
              label="Purpose of Visit / Visit Objectives:"
            />

           <Divider color='black'/>
           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Office Call With Commandant:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="hostingReport.officeCallWithCommandant" label="Only for Military Family Program 'MFP' Personnel"/>
            </SemanticForm.Group>
            <i>If yes please coordinate with Ashley </i>
            </Grid.Column>
            </Grid.Row>           
           </Grid>

           <Divider color='black'/>
           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      Primary Location:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
              <MySemanticCheckBox name="hostingReport.hostedLocationRootHall" label="Root Hall"/>
              <MySemanticCheckBox name="hostingReport.hostedLocationCollinsHall" label="Collins Hall"/>
              <MySemanticCheckBox name="hostingReport.hostedLocationAHEC" label="AHEC"/>
              <MySemanticCheckBox name="hostingReport.hostedLocationCCR" label="CCR"/>
              <MySemanticCheckBox name="hostingReport.hostedLocationWWA" label="WWA"/>
            </SemanticForm.Group>
            <i>Please contact the front office</i>
            </Grid.Column>
            </Grid.Row>           
           </Grid>

           <MyTextInput
                name="hostingReport.escortOfficer"
                placeholder="full name of the escort officer"
                label="Escort Officer:"
              />
            
            <MyTextInput
                name="hostingReport.escortOfficerPhone"
                placeholder="phone number to contact the escort officer"
                label="Escort Officer Phone:"
              />

<MyTextInput
                name="hostingReport.guestName"
                placeholder="Guest Full Name"
                label="Guest Name:"
              />

           <MySelectInput
              options={[
                {text: '', value: ''},
                {text: 'GEN', value: 'GEN' },
                {text: 'Gen', value: 'Gen' },
                {text: 'ADM', value: 'ADM' },
                {text: 'LTG', value: 'LTG' },
                {text: 'LT Gen', value: 'LT Gen' },
                {text: 'LTGen', value: 'LTGen' },
                {text: 'SES', value: 'SES' },
                {text: 'VADM', value: 'VADM' },
                {text: 'MG', value: 'MG' },
                {text: 'Maj Gen', value: 'Maj Gen' },
                {text: 'MajGen', value: 'MajGen' },
                {text: 'RADM', value: 'RADM' },
                {text: 'BG', value: 'BG' },
                {text: 'Brig Gen', value: 'Brig Gen' },
                {text: 'BGen', value: 'BGen' },
                {text: 'RDML', value: 'RDML' },
                {text: 'COL', value: 'COL' },
                {text: 'CAPT', value: 'CAPT' },
                {text: 'LTC', value: 'LTC' },
                {text: 'Lt Col', value: 'Lt Col' },
                {text: 'LtCol', value: 'LtCol' },
                {text: 'CDR', value: 'CDR' },
                {text: 'MAJ', value: 'MAJ' },
                {text: 'Maj', value: 'Maj' },
                {text: 'LCDR', value: 'LCDR' },
                {text: 'SMA', value: 'SMA' },
                {text: 'CSM', value: 'CSM' },
                {text: 'Mr.', value: 'Mr.' },
                {text: 'Mrs.', value: 'Mrs.' },
                {text: 'Ms.', value: 'Ms.' },
                {text: 'Dr.', value: 'Dr.' },
                {text: 'Prof.', value: 'Prof.' },
                {text: 'HON', value: 'HON' },
              ]}
              placeholder="Guest Rank / Honorific"
              name="hostingReport.guestRank"
              label="Guest Rank / Honorific:"
            />

             <MyTextInput
                name="hostingReport.guestTitle"
                placeholder="Guest Title / Org"
                label="Guest Title / Org:"
              />

              <MyTextInput
                name="hostingReport.guestOfficePhone"
                placeholder="Guest Phone"
                label="Guest Phone:"
              />

             <MyTextInput
                name="hostingReport.uniformOfGuest"
                placeholder="Unifrom of Guest"
                label="Uniform of Guest:"
              />

<Divider color='black'/>
           <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                      <strong>
                      * Current Bio Attached:
                      </strong>
            </Grid.Column>
            <Grid.Column width={12}>
            <SemanticForm.Group inline>
            <MySemanticRadioButton
                        label="Current Bio is Attached"
                        value="attached"
                        name="hostingReport.bioAttachedOrPending"
                      />
              <MySemanticRadioButton
                        label="Current Bio is Pending"
                        value="pending"
                        name="hostingReport.bioAttachedOrPending"
                      />
            </SemanticForm.Group>
            <i id='currentBioAnchor'>attach current bio</i>
            { attachBioError &&
            <p>
            <Label basic color='red' >
                Choose either Attached Or Pending
            </Label>
            </p>
            }
            </Grid.Column>
            </Grid.Row>           
            </Grid> 
            <Divider color='black'/>
            <Grid>
              <Grid.Row>
              <Grid.Column width={4}>
                      <strong>
                      Upload Bio:
                      </strong>
            </Grid.Column>
                <Grid.Column width={12}>
                   <DocumentUploadWidget
                    uploadDocument = {handleDocumentUpload}
                    loading = {uploading}
                     />
                </Grid.Column>
              </Grid.Row> 
            </Grid>
            <Divider color='black'/>


            <MyTextArea
              rows={3}
              placeholder="Travel Party / Accombied by"
              name="hostingReport.travelPartyAccomaniedBy"
              label="Travel Party / Accombied by:"
            />
             Guest Itenerary:
             <Editor
                 editorState={editorState}
                 onEditorStateChange={setEditorState}
                 wrapperClassName="wrapper-class"
                 editorClassName="editor-class"
                 toolbarClassName="toolbar-class"
              />
   
                </Segment> }


          <Divider />

       

            <Button
              disabled={submitting}
              loading={submitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              as={Link}
              to={`${process.env.PUBLIC_URL}/activityTable`}
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
