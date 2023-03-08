import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Header,
  Icon,
  Segment,
  Form as SemanticForm,
  Popup,
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
import {
  faBookOpenReader,
  faFileLines,
  faPeopleRoof,
  faPersonRifle,
} from "@fortawesome/free-solid-svg-icons";
import RoomPicker from "./RoomPicker";
import MyTextInput from "../../../app/common/form/MyTextInput";
import { v4 as uuid } from "uuid";
import { Providers, ProviderState } from "@microsoft/mgt";
import {
  Recurrence,
  RecurrenceFormValues,
} from "../../../app/models/recurrence";
import { format } from "date-fns";
import MySemanticCheckBox from "../../../app/common/form/MySemanticCheckbox";
import MySemanticRadioButton from "../../../app/common/form/MySemanticRadioButton";
import ScrollToFieldError from "../../../app/common/form/ScrollToFieldError";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import DocumentUploadWidget from "../../../app/common/documentUpload/documentUploadWidget";
import { Attachment } from "../../../app/models/attachment";
import { toast } from "react-toastify";
import { Countries } from "../../../app/models/countryList";
import agent from "../../../app/api/agent";
import RepeatingEventButton from "./RepeatingEventButton";

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
    graphRoomStore,
  } = useStore();
  const {
    createGraphEvent,
    updateGraphEvent,
    createActivity,
    updateActivity,
    loadActivity,
    loadingInitial,
    uploadDocument,
    uploading,
    calendarEventParameters
  } = activityStore;
  const { categoryOptions, categories, loadCategories } = categoryStore;
  const { eduGraphUser, loadEDUGraphUser, armyProfile } = graphUserStore;
  const { locationOptions, loadLocations } = locationStore;
  const { organizationOptions, organizations, loadOrganizations } =
    organizationStore;
  const { graphRooms, loadGraphRooms, graphReservationParameters } =
    graphRoomStore;
  const { id } = useParams<{ id: string }>();
  const { roomid } = useParams<{ roomid: string }>();
  const { calendarid } = useParams<{ calendarid: string }>();
  const { manageSeries } = useParams<{ manageSeries: string }>();
  const { copy } = useParams<{ copy: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(
    new ActivityFormValues()
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    new RecurrenceFormValues()
  );
  const [submitting, setSubmitting] = useState(false);
  const [attachBioError, setAttachBioError] = useState(false);
  const [attachNoAttachmentError, setAttachNoAttachmentError] = useState(false);
  const [recurrenceInd, setRecurrenceInd] = useState<boolean>(false);
  const [recurrenceDisabled, setRecurrenceDisabled] = useState<boolean>(false);
  const [roomRequired, setRoomRequired] = useState<boolean>(false);
  const [roomEmails, setRoomEmails] = useState<string[]>([]);
  const [originalRoomEmails, setOriginalRoomEmails] = useState<string[]>([]);
  const [uploadDifferentBioIndicator, setUploadDifferentBioIndicator] =
    useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(categoryId);

  const handleSetRoomRequired = () => setRoomRequired(!roomRequired);
  const handleUploadDifferentBioClick = () =>
    setUploadDifferentBioIndicator(true);

  const handleSetRoomEmails = (roomEmails: string[]) => {
    setRoomEmails(roomEmails);
  };

  const handleSetRecurrence = (recurrence: Recurrence) => {
    setRecurrence(recurrence);
  };

  const handleSetRecurrenceInd = (recurrenceInd: boolean) => {
    setRecurrenceInd(recurrenceInd);
  };

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const [attachment, setAttachment] = useState<Attachment>({
    id: 0,
    fileName: "",
    fileType: "",
  });

  function handleDocumentUpload(file: any) {
    uploadDocument(file).then((response) => {
      setUploadDifferentBioIndicator(false);
      setAttachment(response);
      toast.success(`${response.fileName} successfully uploaded`);
    });
  }

  const handleDownloadAttachment = async () => {
    try {
      const token = commonStore.token;

      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: headers,
      };

      const metaData: Attachment = await agent.Attachments.details(
        attachment.id
      );
      const url = `${process.env.REACT_APP_API_URL}/upload/${id}`;
      const response = await fetch(url, requestOptions);
      const data = await response.arrayBuffer();
      var file = new Blob([data], { type: metaData.fileType });
      var fileUrl = window.URL.createObjectURL(file);
      var a = document.createElement("a");
      a.href = fileUrl;
      a.download = metaData.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error(err);
    }
  };



  const validationSchema = Yup.object({
    communityEvent: Yup.boolean(),
    categoryId: Yup.string(),

    checkedForOpsec: Yup.boolean()
      .when("communityEvent", {
        is: true,
        then: Yup.boolean().isTrue(
          "Review event details for pii and opsec and check the box "
        ),
      })
       .when("copiedTocommunity", {
        is: true,
        then: Yup.boolean().isTrue(
          "Review event details for pii and opsec and check the box "
        ),
      })   
      .when("mfp", {
        is: true,
        then: Yup.boolean().isTrue(
          "Review event details for pii and opsec and check the box "
        ),
      }),
    title: Yup.string().required("The title is required"),
    description: Yup.string().required("Event Details are required"),
    start: Yup.string()
      .required()
      .nullable()
      .test("startBeforeEnd", "Start must be before End", function () {
        return new Date(this.parent.start) < new Date(this.parent.end);
      }),
    end: Yup.string().required().nullable(),
    actionOfficer: Yup.string().required(),
    actionOfficerPhone: Yup.string().required(),
  });

  useEffect(() => {
    if (!graphRooms || graphRooms.length < 1) loadGraphRooms();
    if (roomid) {
      const parameters = graphReservationParameters.find(
        (x) => x.id === roomid
      );
      if (!!parameters && graphRooms && graphRooms.length > 0) {
        const startDatePart = parameters.start.split("-")[0];
        const endDatePart = parameters.end.split("-")[0];
        const startTimePart = parameters.start.split("-")[1];
        const endTimePart = parameters.end.split("-")[1];
        const startoffset = startTimePart.split(":")[2].includes("PM") ? 12 : 0;
        const endoffset = endTimePart.split(":")[2].includes("PM") ? 12 : 0;
        const startMonth = parseInt(startDatePart.split("/")[0]) - 1;
        const endMonth = parseInt(endDatePart.split("/")[0]) - 1;
        const startDay = parseInt(startDatePart.split("/")[1]);
        const endDay = parseInt(endDatePart.split("/")[1]);
        const startYear = parseInt(startDatePart.split("/")[2]);
        const endYear = parseInt(endDatePart.split("/")[2]);
        const startHour = parseInt(startTimePart.split(":")[0]) + startoffset;
        const endHour = parseInt(endTimePart.split(":")[0]) + endoffset;
        const startMinute = parseInt(startTimePart.split(":")[1]);
        const endMinute = parseInt(endTimePart.split(":")[1]);
        const start = new Date(
          startYear,
          startMonth,
          startDay,
          startHour,
          startMinute
        );
        const end = new Date(endYear, endMonth, endDay, endHour, endMinute);
        let activityFormValue = new ActivityFormValues();
        activityFormValue.start = start;
        activityFormValue.end = end;
        setActivity(activityFormValue);
        setRoomRequired(true);
        const graphRoom = graphRooms.filter((x) => x.id === parameters.roomId);
        if (graphRoom && graphRooms.length > 0) {
          setRoomEmails(graphRoom.map((x) => x.emailAddress));
        }
      }
    }
    if (calendarid) {
      const calendarParameters = calendarEventParameters.find(
        (x) => x.id === calendarid
      )
      if (!!calendarParameters){
        let activityFormValue = new ActivityFormValues();
        activityFormValue.allDayEvent = calendarParameters.allDay
        activityFormValue.start = calendarParameters.date
        if(calendarParameters.categoryId){
          activityFormValue.categoryId = calendarParameters.categoryId
        }  
        setActivity(activityFormValue);
        if(calendarParameters.needRoom)  setRoomRequired(true);
      }
    }
    if (id) {
      loadActivity(id, categoryId).then((response) => {
        if(copy && copy === 'true' && response && response.hostingReport) response.hostingReport = null;
        if(copy && copy === 'true' && response && response.title) response.title = response.title + ' Copied on - ' + format(new Date(), 'MMMM d, yyyy h:mm aa')
        if(copy && copy === 'true' && response && response.report) response.report = 'none';
        if(copy && copy === 'true' && response && response.activityRooms) response.activityRooms = [];
        if(copy && copy === 'true' && response && response.recurrenceInd) response.recurrenceInd = false;
        if(copy && copy === 'true' && response && response.eventLookup) response.eventLookup = '';
        setActivity(new ActivityFormValues(response));
        if (response?.attachmentLookup && response?.attachmentLookup > 0 && (!copy || copy === 'false')) {
          setAttachment({
            id: response?.attachmentLookup,
            fileName: "",
            fileType: "",
          });
        }
        if (response?.activityRooms && response.activityRooms.length > 0 && (!copy || copy === 'false')) {
          setRoomRequired(true);
          setRoomEmails(response.activityRooms.map((x) => x.email));
          setOriginalRoomEmails(response.activityRooms.map((x) => x.email));
        }
        if (response?.recurrenceInd && response?.recurrence  && (!copy || copy === 'false')) {
          setRecurrence(response.recurrence);
          setRecurrenceInd(true);
        }

        if (response?.hostingReport?.guestItinerary  && (!copy || copy === 'false')) {
          setEditorState(
            EditorState.createWithContent(
              convertFromRaw(
                JSON.parse(response!.hostingReport!.guestItinerary)
              )
            )
          );
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
      loadEDUGraphUser();
    }
  }, [isSignedIn, graphRooms]);

  function handleFormSubmit(activity: ActivityFormValues) {
    let hostingReportError = false;
    setAttachBioError(false);
    setAttachNoAttachmentError(false);
    if (
      activity.report === "Hosting Report" &&
      armyProfile &&
      armyProfile?.mail
    ) {
      if (!activity.hostingReport?.bioAttachedOrPending && !attachment?.id) {
        setAttachBioError(true);
        hostingReportError = true;
        const currentBioAnchor = document.getElementById("currentBioAnchor");
        if (currentBioAnchor) {
          currentBioAnchor.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }

      if (
        activity.hostingReport?.bioAttachedOrPending === "attached" &&
        (!attachment || attachment.id < 1)
      ) {
        setAttachNoAttachmentError(true);
        hostingReportError = true;
        const currentBioAnchor = document.getElementById("currentBioAnchor");
        if (currentBioAnchor) {
          currentBioAnchor.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
    if (!hostingReportError) {
      setSubmitting(true);
      if (!activity.categoryId)
        activity.categoryId = categories.find((x) => x.name === "Other")!.id;
      if (
        (activity.report === "Hosting Report" ||
          activity.report === "Outsiders Report") &&
        armyProfile &&
        armyProfile?.mail
      ) {
        activity.hostingReport!.reportType = activity.report;
        activity.hostingReport!.guestItinerary = JSON.stringify(
          convertToRaw(editorState.getCurrentContent())
        );
        if (
          attachment &&
          attachment.id &&
          attachment.id > 0 &&
          activity.report === "Hosting Report"
        ) {
          activity.attachmentLookup = attachment.id;
          activity.hostingReport!.bioAttachedOrPending =
            "Current Bio is Attached";
        }
      }
      if (!armyProfile || !armyProfile?.mail) {
        activity.hostingReport = null;
      }
      activity.createdAt = new Date();
      activity.lastUpdatedAt = new Date();
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
      activity.coordinatorEmail =
        isSignedIn && eduGraphUser ? eduGraphUser.mail : "";
      activity.coordinatorName =
        isSignedIn && eduGraphUser ? eduGraphUser.displayName : "";
      activity.coordinatorFirstName =
        isSignedIn && eduGraphUser ? eduGraphUser.givenName : "";
      activity.coordinatorLastName =
        isSignedIn && eduGraphUser ? eduGraphUser.surname : "";
      const category = categories.find((x) => x.id === activity.categoryId)!;
      const organization = activity.organizationId
        ? organizations.find((x) => x.id === activity.organizationId) || null
        : null;
      activity.organizationId = activity.organizationId || null;
      activity.category = category;
      activity.organization = organization;
      debugger;
      if (!activity.id || (copy && copy === 'true' )) {
        let newActivity = {
          ...activity,
          id: category.name === "Academic Calendar" ? "" : uuid(),
        };
        category.name === "Academic Calendar"
          ? createGraphEvent(newActivity).then(() =>
              history.push(
                `${process.env.PUBLIC_URL}/activities/${newActivity.id}/${category.id}`
              )
            )
          : createActivity(newActivity).then(() =>
              history.push(
                `${process.env.PUBLIC_URL}/activities/${newActivity.id}/${category.id}`
              )
            );
      } else {
        category.name === "Academic Calendar"
          ? updateGraphEvent({ ...activity, id: activity!.id }).then(() =>
              history.push(
                `${process.env.PUBLIC_URL}/activities/${activity.id}/${category.id}`
              )
            )
          : updateActivity(
              { ...activity, id: activity!.id },
              manageSeries
            ).then(() =>
              history.push(
                `${process.env.PUBLIC_URL}/activities/${activity.id}/${category.id}`
              )
            );
      }
    }
  }

  if (
    loadingInitial ||
    categoryStore.loadingInitial ||
    organizationStore.loadingInitial ||
    locationStore.loadingInitial ||
    graphUserStore.loadingInitial ||
    graphRoomStore.loadingInitial
  ) {
    return <LoadingComponent content="Loading form..." />;
  }

  const FormObserver: React.FC = () => {
    const { values, setFieldValue } = useFormikContext();
    const v = values as ActivityFormValues;
    useEffect(() => {

      if (v.end.getDate() !== v.start.getDate()) {
        setRecurrenceDisabled(true);
        setRecurrenceInd(false);
      } else {
        setRecurrenceDisabled(false);
      }
      if (v.end < v.start) {
        setFieldValue("end", new Date(v.start.getTime() + 30 * 60000));
      }

      if (currentCategoryId !== v.categoryId) {
        const isIncludedInIMC = categories
          .filter((x) => x.includeInIMC)
          .map((x) => x.id)
          .includes(v.categoryId);
        if (v.imc !== isIncludedInIMC) {
          setFieldValue("imc", isIncludedInIMC);
        }

        const routeNames = [
          { routeName: "battlerhythm", copiedTo: "copiedTobattlerhythm" },
          { routeName: "staff", copiedTo: "copiedTostaff" },
          { routeName: "commandGroup", copiedTo: "copiedTocommandGroup" },
          { routeName: "academic", copiedTo: "copiedToacademic" },
          { routeName: "asep", copiedTo: "copiedToasep" },
          { routeName: "community", copiedTo: "copiedTocommunity" },
          { routeName: "csl", copiedTo: "copiedTocsl" },
          { routeName: "garrison", copiedTo: "copiedTogarrison" },
          { routeName: "generalInterest", copiedTo: "copiedTogeneralInterest" },
          { routeName: "holiday", copiedTo: "copiedToholiday" },
          { routeName: "pksoi", copiedTo: "copiedTopksoi" },
          {
            routeName: "socialEventsAndCeremonies",
            copiedTo: "copiedTosocialEventsAndCeremonies",
          },
          {
            routeName: "ssiAndUsawcPress",
            copiedTo: "copiedTossiAndUsawcPress",
          },
          { routeName: "ssl", copiedTo: "copiedTossl" },
          {
            routeName: "trainingAndMiscEvents",
            copiedTo: "copiedTotrainingAndMiscEvents",
          },
          { routeName: "usahec", copiedTo: "copiedTousahec" },
          {
            routeName: "usahecFacilitiesUsage",
            copiedTo: "copiedTousahecFacilitiesUsage",
          },
          { routeName: "visitsAndTours", copiedTo: "copiedTovisitsAndTours" },
          {
            routeName: "symposiumAndConferences",
            copiedTo: "copiedTosymposiumAndConferences",
          },
          { routeName: "militaryFamilyAndSpouseProgram", copiedTo: "mfp" },
        ];
        routeNames.forEach((route) => {
          const isCategory = categories
            .filter((x) => x.routeName === route.routeName)
            .map((x) => x.id)
            .includes(v.categoryId);
          if (
            (v as any)[route.copiedTo] !== isCategory &&
            (isCategory || !id || id.length < 1)
          ) {
            setFieldValue(route.copiedTo, isCategory);
          }
        });
      }

      if (currentCategoryId !== v.categoryId)
        setCurrentCategoryId(v.categoryId);
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
      {(!armyProfile || !armyProfile?.mail) && (
        <div className="ui yellow message">
          <div className="header">
            You are not authorized to work with Hosting or Outsider Reports.
          <span style={{ paddingRight: "10px" }}>
            if you would like to work with reports you must first sign into your
            army 365 account. Please save all pending work before doing this.{" "}
          </span>

          <Link
            to={`${process.env.PUBLIC_URL}/authenticatetoarmy`}
            className="ui primary button tiny"
          >
            Log Into Army 365
          </Link>
          </div>
        </div>
      )}
      <Formik
        enableReinitialize
        validationSchema={validationSchema}
        initialValues={activity}
        onSubmit={(values) => handleFormSubmit(values)}
      >
        {({ handleSubmit, isSubmitting, values }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
            <FormObserver />
            <ScrollToFieldError />

            <MyTextInput
              name="title"
              placeholder="*Event Title (required field)"
            />

            <MyTextArea
              rows={3}
              placeholder="*Event Details / Description (required field)"
              name="description"
            />

            {id && originalRoomEmails && originalRoomEmails.length > 0 && (
              <Grid columns={4}>
                <Grid.Column>
                  <Grid>
                    <Grid.Row>
                      <Grid.Column>
                        <strong>All Day Event:</strong>
                        <br />
                        <br />
                        <SemanticForm.Group inline>
                          <MySemanticCheckBox
                            name="allDayEvent"
                            label="event occurs for the entire work day"
                            disabled={
                              id &&
                              originalRoomEmails &&
                              originalRoomEmails.length
                                ? true
                                : false
                            }
                          />
                        </SemanticForm.Group>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Grid.Column>

                <Grid.Column>
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
                      start date you must first cancel the room reservation. To
                      do this choose "no room required" and save your work. you
                      will then be able to change the start date and reserve a
                      room.
                    </Popup.Content>
                  </Popup>
                </Grid.Column>
                <Grid.Column>
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
                    <Popup.Header>
                      Why can't I change the end date?
                    </Popup.Header>
                    <Popup.Content>
                      This event has a current room reservation. To change the
                      end date you must first cancel the room reservation. To do
                      this choose "no room required" and save your work. you
                      will then be able to change the end date and reserve a
                      room.
                    </Popup.Content>
                  </Popup>
                </Grid.Column>
                <Grid.Column>
                  <RepeatingEventButton
                    id={id}
                    manageSeries={manageSeries}
                    originalRoomEmails={originalRoomEmails}
                    recurrenceInd={recurrenceInd}
                    recurrenceDisabled={recurrenceDisabled}
                    recurrence={recurrence}
                    start={values.start}
                    setRecurrence={handleSetRecurrence}
                    setRecurrenceInd={handleSetRecurrenceInd}
                  />
                </Grid.Column>
              </Grid>
            )}

            {(!id || id.length < 1) &&
              roomRequired &&
              roomEmails &&
              roomEmails.length > 0 && (
                <Grid columns={4}>
                  <Grid.Column>
                    <Grid>
                      <Grid.Row>
                        <Grid.Column>
                          <strong>All Day Event:</strong>
                          <br />
                          <br />
                          <SemanticForm.Group inline>
                            <MySemanticCheckBox
                              name="allDayEvent"
                              label="event occurs for the entire work day"
                              disabled={
                                id &&
                                originalRoomEmails &&
                                originalRoomEmails.length
                                  ? true
                                  : false
                              }
                            />
                          </SemanticForm.Group>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Grid.Column>

                  <Grid.Column>
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
                      <Popup.Header>Room Registration Notice</Popup.Header>
                      <Popup.Content>
                        Please remove all selected rooms before making changes
                        to the dates or times to ensure that your changes are
                        reflected accurately.
                      </Popup.Content>
                    </Popup>
                  </Grid.Column>
                  <Grid.Column>
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
                      <Popup.Header>Room Registration Notice</Popup.Header>
                      <Popup.Content>
                        Please remove all selected rooms before making changes
                        to the dates or times to ensure that your changes are
                        reflected accurately.
                      </Popup.Content>
                    </Popup>
                  </Grid.Column>
                  <Grid.Column>
                    <Grid.Column>
                      <RepeatingEventButton
                        id={id}
                        manageSeries={manageSeries}
                        originalRoomEmails={originalRoomEmails}
                        recurrenceInd={recurrenceInd}
                        recurrenceDisabled={recurrenceDisabled}
                        recurrence={recurrence}
                        start={values.start}
                        setRecurrence={handleSetRecurrence}
                        setRecurrenceInd={handleSetRecurrenceInd}
                      />
                    </Grid.Column>
                  </Grid.Column>
                </Grid>
              )}

            {!(
              (!id || id.length < 1) &&
              roomRequired &&
              roomEmails &&
              roomEmails.length > 0
            ) &&
              !(id && originalRoomEmails && originalRoomEmails.length) && (
                <>
                  <SemanticForm.Group widths="equal">
                    <SemanticForm.Field>
                      <Grid.Column>
                        <Grid>
                          <Grid.Row>
                            <Grid.Column>
                              <strong>All Day Event:</strong>
                              <br />
                              <br />
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox
                                  name="allDayEvent"
                                  label="event occurs for the entire work day"
                                  disabled={
                                    id &&
                                    originalRoomEmails &&
                                    originalRoomEmails.length
                                      ? true
                                      : false
                                  }
                                />
                              </SemanticForm.Group>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                      </Grid.Column>
                    </SemanticForm.Field>
                    <SemanticForm.Field>
                      <MyDateInput
                        placeholderText={
                          values.allDayEvent
                            ? "Start Date"
                            : "Start Date / Time"
                        }
                        name="start"
                        dateFormat={
                          values.allDayEvent
                            ? "MMMM d, yyyy"
                            : "MMMM d, yyyy h:mm aa"
                        }
                        title="*Start:"
                        minDate={new Date()}
                        showTimeSelect={!values.allDayEvent}
                        timeIntervals={!values.allDayEvent ? 15 : undefined}
                        timeCaption="time"
                        disabled={
                          id && originalRoomEmails && originalRoomEmails.length
                            ? true
                            : false
                        }
                      />
                    </SemanticForm.Field>
                    <SemanticForm.Field>
                      <MyDateInput
                        placeholderText={
                          values.allDayEvent ? "End Date" : "End Date / Time"
                        }
                        name="end"
                        dateFormat={
                          values.allDayEvent
                            ? "MMMM d, yyyy"
                            : "MMMM d, yyyy h:mm aa"
                        }
                        title="*End:"
                        minDate={values.start}
                        showTimeSelect={!values.allDayEvent}
                        timeIntervals={!values.allDayEvent ? 15 : undefined}
                        timeCaption="time"
                        disabled={
                          id && originalRoomEmails && originalRoomEmails.length
                            ? true
                            : false
                        }
                      />
                    </SemanticForm.Field>
                    <SemanticForm.Field>
                      <Grid.Column>
                        <RepeatingEventButton
                          id={id}
                          manageSeries={manageSeries}
                          originalRoomEmails={originalRoomEmails}
                          recurrenceInd={recurrenceInd}
                          recurrenceDisabled={recurrenceDisabled}
                          recurrence={recurrence}
                          start={values.start}
                          setRecurrence={handleSetRecurrence}
                          setRecurrenceInd={handleSetRecurrenceInd}
                        />
                      </Grid.Column>
                    </SemanticForm.Field>
                  </SemanticForm.Group>
                  <Divider />
                </>
              )}

            <SemanticForm.Group widths="equal">
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
            </SemanticForm.Group>
            <LocationRadioButtons
              roomRequired={roomRequired}
              setRoomRequired={handleSetRoomRequired}
            />


            {!roomRequired && (
              <Grid>
                <Grid.Row>
                  <Grid.Column width={6}>
                    <MyDataList
                      name="primaryLocation"
                      placeholder="Primary Location"
                      label="Primary Location: (Pick from the list or type your own)"
                      dataListId="locations"
                      options={locationOptions}
                    />
                  </Grid.Column>
                  <Grid.Column width={10}>
                    <div className="ui yellow message">
                      <div className="header">
                        Primary Location is for the general location of your
                        event only
                      </div>
                      This does NOT reserve a room. To reserve a room choose the
                      Need a Room option above.
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            )}

            {roomRequired && (
              <>
                <Segment color="purple">
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
                  {graphRooms
                    .filter((obj) => roomEmails.includes(obj.emailAddress))
                    .map((x) => x.displayName)
                    .join(",")
                    .includes("Command") && (
                    <>
                      <MySelectInput
                        options={[
                          { text: "", value: "" },
                          {
                            text: "Full Room Config (CCR Only)",
                            value: "Full Room Config (CCR Only)",
                          },
                          {
                            text: "Small Circle Config (CCR Only)",
                            value: "Small Circle Config (CCR Only)",
                          },
                          {
                            text: "Large U Config (CCR Only)",
                            value: "Large U Config (CCR Only)",
                          },
                          {
                            text: "Small U Config (CCR Only)",
                            value: "Small U Config (CCR Only)",
                          },
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
                    </>
                  )}
                  {graphRooms
                    .filter((obj) => roomEmails.includes(obj.emailAddress))
                    .map((x) => x.displayName)
                    .join(",")
                    .includes("Bliss Hall") && (
                    <>
                      <Grid>
                        <Grid.Row>
                          <Grid.Column width={3}>
                            <strong>Bliss Hall Support:</strong>
                          </Grid.Column>
                          <Grid.Column width={13}>
                            <SemanticForm.Group inline>
                              <MySemanticCheckBox name="blissHallSupport" />
                            </SemanticForm.Group>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                      <Divider />

                      <MyTextArea
                        rows={3}
                        placeholder="You have selected the Bliss Hall Auditorium and you "
                        name="blissHallAVSptRequired"
                        label="Bliss Hall A/V Spt Required:"
                      />
                    </>
                  )}
                  {graphRooms
                    .filter((obj) => roomEmails.includes(obj.emailAddress))
                    .map((x) => x.displayName)
                    .join(",")
                    .includes("VTC") && (
                    <MyCheckBox
                      name="vtc"
                      label="VTC: (allow 30 minute set up time)"
                    />
                  )}

                  {graphRooms
                    .filter((obj) => roomEmails.includes(obj.emailAddress))
                    .map((x) => x.displayName)
                    .join(",")
                    .includes("VTC") &&
                    values.vtc && (
                      <Segment inverted color="brown">
                        <MySelectInput
                          options={[
                            { text: "N/A", value: "" },
                            { text: "UNCLASS ISDN", value: "UNCLASS ISDN" },
                            { text: "UNCLASS IP", value: "UNCLASS IP" },
                            { text: "SECRET IP", value: "SECRET IP" },
                            {
                              text: "Audio Call Only",
                              value: "Audio Call Only",
                            },
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
                              <strong>GO/SES In Attendance:</strong>
                            </Grid.Column>
                            <Grid.Column width={12}>
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox name="gosesInAttendance" />
                              </SemanticForm.Group>
                              <i>
                                Check if a General Officer(GO) / Senior
                                Executive (SES) is in attendance here or at the
                                distant end
                              </i>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                        <Divider />

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
                        {id && id.length > 0 && (
                          <MySelectInput
                            options={[
                              { text: "", value: "" },
                              { text: "Tentative", value: "Tentative" },
                              { text: "Confirmed", value: "Confirmed" },
                              { text: "Cancelled", value: "Cancelled" },
                            ]}
                            placeholder="VTC Status"
                            name="vtcStatus"
                            label="VTC Status: (for VTC Coordinators ONLY)"
                          />
                        )}
                      </Segment>
                    )}

                  <hr color="purple" />
                </Segment>
              </>
            )}
            <Segment color="violet" inverted>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={2}>
                    <div style={{ paddingTop: "15px" }} />
                    Sub Calendar:
                  </Grid.Column>
                  <Grid.Column width={14}>
                    <MySelectInput
                      options={categoryOptions
                        .filter((x: any) => x.text !== "Student Calendar")
                        .sort((a: any, b: any) => {
                          if (a.text === "") {
                            return -1;
                          } else if (b.text === "") {
                            return 1;
                          } else {
                            return a.text.localeCompare(b.text);
                          }
                        })}
                      placeholder="Sub Calendar"
                      name="categoryId"
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>

      

            {categories.find((x) => x.id === values.categoryId)?.name ===
              "Garrison Calendar" && (
              <Segment color="orange">
                <Header as="h5" icon textAlign="center" color="orange">
                  <Icon name="building" />
                  <Header.Content>Garrison Information</Header.Content>
                </Header>

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "ACS", value: "ACS" },
                    { text: "Command", value: "Command" },
                    { text: "CYC", value: "CYC" },
                    { text: "DES", value: "DES" },
                    { text: "DHR", value: "DHR" },
                    { text: "DPTMS", value: "DPTMS" },
                    {
                      text: "Emergency Management (EM)",
                      value: "Emergency Management (EM)",
                    },
                    { text: "Holiday", value: "Holiday" },
                    { text: "MWR", value: "MWR" },
                  ]}
                  placeholder="Garrison Category"
                  name="garrisonCategory"
                  label="Garrison Category:"
                />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Marketing Request:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox name="marketingRequest" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />
        
              {values.marketingRequest &&
              <>
                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "Special Event", value: "Special Event" },
                    { text: "Sale", value: "Sale" },
                    { text: "Promotion", value: "Promotion" },
                    { text: "Observance", value: "Observance" },
                    { text: "Trip", value: "Trip" },
                    { text: "Service", value: "Service" },
                    {
                      text: "Tournament",
                      value: "Tournament",
                    },
                    { text: "League", value: "League" },
                    { text: "Class", value: "Class" },
                  ]}
                  placeholder="Campaign Category"
                  name="marketingCampaignCategory"
                  label="Campaign Category:"
                />

                <MySelectInput
                options={[
                  { text: "", value: "" },
                  { text: "ACS", value: "ACS" },
                  { text: "Army Catering", value: "Army Catering" },
                  { text: "BOSS", value: "BOSS" },
                  { text: "Cafe Cumberland", value: "Cafe Cumberland" },
                  { text: "CDC", value: "CDC" },
                  { text: "FTIG Community Club", value: "FTIG Community Club" },
                  {
                    text: "FTIG Pool",
                    value: "FTIG Pool",
                  },
                  { text: "FTIG Rec Center", value: "FTIG Rec Center" },
                  { text: "Golf", value: "Golf" },
                  { text: "Lodging", value: "Lodging" },
                  { text: "LTS", value: "LTS" },
                  { text: "LVCC", value: "LVCC" },
                  { text: "Outdoor Rec", value: "Outdoor Rec" },
                  { text: "SKIES", value: "SKIES" },
                  { text: "Special Events", value: "Special Events" },
                  { text: "Sports", value: "Sports" },
                  { text: "Support Services", value: "Support Services" },
                  { text: "YS", value: "YS" },
                ]}
                placeholder="Program"
                name="marketingProgram"
                label="Program:"
              />
              </>
             }

                <hr color="#f2711c" />
              </Segment>
            )}

            {categories.find((x) => x.id === values.categoryId)?.name ===
              "SSL Calendar" && (
              <Segment color="green">
                <Header as="h5" icon textAlign="center" color="green">
                  <FontAwesomeIcon
                    icon={faPersonRifle}
                    size="2x"
                    style={{ marginRight: "10px" }}
                  />
                  <Header.Content>SSL Information</Header.Content>
                </Header>

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "SSL", value: "SSL" },
                    { text: "DPMSO", value: "DPMSO" },
                    { text: "DCLM", value: "DCLM" },
                    { text: "DNSS", value: "DNSS" },
                    { text: "DDE", value: "DDE" },
                  ]}
                  placeholder="SSL"
                  name="sslCategories"
                  label="SSL Categories:"
                />
                <hr color="#21ba45" />
              </Segment>
            )}

            {categories.find((x) => x.id === values.categoryId)?.name ===
              "USAHEC Facilities Usage Calendar" && (
              <Segment color="pink">
                <Header as="h5" icon textAlign="center" color="pink">
                  <FontAwesomeIcon
                    icon={faBookOpenReader}
                    size="2x"
                    style={{ marginRight: "10px" }}
                  />
                  <Header.Content>
                    USAHEC Facilities Usage Information
                  </Header.Content>
                </Header>

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    {
                      text: "Army Heritage Center Foundation",
                      value: "Army Heritage Center Foundation",
                    },
                    { text: "Education", value: "Education" },
                    { text: "Government", value: "Government" },
                    { text: "Holiday", value: "Holiday" },
                    { text: "Maintenance", value: "Maintenance" },
                    { text: "MHINAF", value: "MHINAF" },
                    { text: "Non/Profit", value: "Non/Profit" },
                    { text: "Public Event", value: "Public Event" },
                    { text: "Scouts", value: "Scouts" },
                    { text: "Training", value: "Training" },
                    { text: "U.S. Army", value: "U.S. Army" },
                    {
                      text: "U.S. Army War College",
                      value: "U.S. Army College",
                    },
                    { text: "USAHEC Meeting", value: "USAHEC Meeting" },
                    { text: "Veteran", value: "Veteran" },
                  ]}
                  placeholder="Reservation Type"
                  name="usahecFacilityReservationType"
                  label="Reservation Type:"
                />

                <hr color="#e03997" />
              </Segment>
            )}

            {categories.find((x) => x.id === values.categoryId)?.name ===
              "USAHEC Calendar" && (
              <Segment color="purple">
                <Header as="h5" icon textAlign="center" color="purple">
                  <Icon name="book" />
                  <Header.Content>USAHEC Information</Header.Content>
                </Header>

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "AHM", value: "AHM" },
                    { text: "EDU", value: "EDU" },
                    { text: "HSD", value: "HSD" },
                    { text: "LIB", value: "LIB" },
                    { text: "MHI", value: "MHI" },
                    { text: "OPS", value: "OPS" },
                    { text: "VES", value: "VES" },
                  ]}
                  placeholder="USAHEC Directorate"
                  name="usahecDirectorate"
                  label="USAHEC Directorate:"
                />

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    {
                      text: "Army Heritage Center Foundation",
                      value: "Army Heritage Center Foundation",
                    },
                    { text: "Budget", value: "Budget" },
                    {
                      text: "Digitization Project",
                      value: "Digitization Project",
                    },
                    { text: "Event/Tour", value: "Event/Tour" },
                    { text: "Holiday", value: "Holiday" },
                    { text: "Maintenance", value: "Maintenance" },
                    { text: "Personnel", value: "Personnel" },
                    { text: "Training", value: "Training" },
                    {
                      text: "U.S. Army War College",
                      value: "U.S. Army War College",
                    },
                    { text: "USAHEC Meeting", value: "USAHEC Meeting" },
                  ]}
                  placeholder="USAHEC Calendar Category"
                  name="usahecCalendarCategory"
                  label="USAHEC Calendar Category:"
                />

                <hr color="#a33c8" />
              </Segment>
            )}

            {categories.find((x) => x.id === values.categoryId)?.name ===
              "CSL Calendar" && (
              <Segment color="blue">
                <Header as="h5" icon textAlign="center" color="blue">
                  <Icon name="copyright" />
                  <Header.Content>CSL Information</Header.Content>
                </Header>

                <MySelectInput
                  options={[
                    { text: "Info", value: "Info" },
                    { text: "Event On-Site", value: "Event On-Site" },
                    { text: "Event Off-Site", value: "Event Off-Site" },
                    { text: "Set Up", value: "Set Up" },
                    { text: "Leave", value: "Leave" },
                    { text: "TDY", value: "TDY" },
                    { text: "Holiday", value: "Holiday" },
                    { text: "VTC", value: "VTC" },
                    { text: "Task", value: "Task" },
                    { text: "Farewell", value: "Farewell" },
                    { text: "Highlight", value: "Highlight" },
                  ]}
                  placeholder="Type of Event"
                  name="type"
                  label="Type of Event:"
                />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>DTI Supported Exercise:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox name="dti" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Supports Education and/or Simulation:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox name="education" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>CSL Directorate:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="cslDirectorateCSL"
                          label="CSL"
                        />
                        <MySemanticCheckBox
                          name="cslDirectorateDSW"
                          label="DSW"
                        />
                        <MySemanticCheckBox
                          name="cslDirectorateDTI"
                          label="DTI"
                        />
                        <MySemanticCheckBox
                          name="cslDirectorateOPS"
                          label="OPS"
                        />
                        <MySemanticCheckBox
                          name="cslDirectorateSLFG"
                          label="SLFG"
                        />
                        <MySemanticCheckBox
                          name="cslDirectorateFellows"
                          label="Fellows"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <MyTextInput name="pax" placeholder="PAX" label="PAX:" />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Room Requirements:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="roomRequirementBasement"
                          label="Basement"
                        />
                        <MySemanticCheckBox
                          name="roomRequirement1"
                          label="1st Floor"
                        />
                        <MySemanticCheckBox
                          name="roomRequirement2"
                          label="2nd Floor"
                        />
                        <MySemanticCheckBox
                          name="roomRequirement3"
                          label="3rd Floor"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Participation:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="participationCmdt"
                          label="Cmdt Participation"
                        />
                        <MySemanticCheckBox
                          name="participationGO"
                          label="GO Participation"
                        />
                        <MySemanticCheckBox
                          name="participationDir"
                          label="Dir, CSL Participation"
                        />
                        <MySemanticCheckBox
                          name="participationForeign"
                          label="Foreign National Participation"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Automation/VI Support:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="automationProjection"
                          label="Projection"
                        />
                        <MySemanticCheckBox
                          name="automationCopiers"
                          label="Copiers"
                        />
                        <MySemanticCheckBox
                          name="automationPC"
                          label="PC Rqmts"
                        />
                        <MySemanticCheckBox
                          name="automationVTC"
                          label="VTC (3 day notice)"
                        />
                        <MySemanticCheckBox
                          name="automationTaping"
                          label="Taping Rqmts"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <MyTextArea
                  rows={3}
                  placeholder="Automation Comments / VI Comments"
                  name="automationComments"
                  label="Automation Comments / VI Comments:"
                />

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "Phone Rqmts", value: "Phone Rqmts" },
                    { text: "Fax Rqmts", value: "Fax Rqmts" },
                  ]}
                  placeholder="Communication Support"
                  name="communicationSupport"
                  label="Communication Support:"
                />

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "Unclass", value: "Unclass" },
                    { text: "Classified", value: "Classified" },
                    {
                      text: "Both (SECRET and Unclass)",
                      value: "Both (SECRET and Unclass)",
                    },
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
                      <strong>Catering Requirements:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox name="catering" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Catering Area(s):</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="cateringAreaArdennes"
                          label="Ardennes"
                        />
                        <MySemanticCheckBox
                          name="cateringArea18"
                          label="18th Break Area"
                        />
                        <MySemanticCheckBox
                          name="cateringArea22"
                          label="22nd Break Area"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Catering Break Area(s):</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="cateringBreakArea18"
                          label="18th Side Break Area"
                        />
                        <MySemanticCheckBox
                          name="cateringBreakArea22"
                          label="22nd Side Break Area"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <MyTextArea
                  rows={3}
                  placeholder="Catering Comments"
                  name="cateringComments"
                  label="Catering Comments:"
                />

                <MySelectInput
                  options={[
                    { text: "None", value: "" },
                    { text: "POV", value: "POV" },
                    { text: "Rental Car", value: "Rental Car" },
                    { text: "TMP Van", value: "TMP Van" },
                    { text: "Buses", value: "Buses" },
                    { text: "Aviation", value: "Aviation" },
                  ]}
                  placeholder="None"
                  name="transportation"
                  label="Transportation:"
                />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Parking Passes:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox name="parkingPasses" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

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
                      <strong>Security:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="securityBadgeIssue"
                          label="Badge Issue"
                        />
                        <MySemanticCheckBox
                          name="securityAfterDutyAccess"
                          label="After Duty Access"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <MyTextArea
                  rows={3}
                  placeholder="Security Comments"
                  name="securityComments"
                  label="Security Comments:"
                />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <strong>Registration:</strong>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox name="registration" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

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
                    { text: "", value: "" },
                    { text: "Pending", value: "Pending" },
                    { text: "Approved", value: "Approved" },
                  ]}
                  placeholder="Pending"
                  name="approvedByOPS"
                  label="Approved by OPS:"
                />

                <hr color="#9ca4fb" />
              </Segment>
            )}

            {[
              "ASEP Calendar",
              "Garrison Calendar",
              "PKSOI Calendar",
              "SSI And USAWC Press Calendar",
              "SSL Calendar",
              "USAHEC Calendar",
              "USAHEC Facilities Usage Calendar",
              "CSL Calendar",
            ].includes(
              categories.find((x) => x.id === values.categoryId)?.name || ""
            ) && <></>}

            {values.categoryId &&
              !["Other"].includes(
                categories.find((x) => x.id === values.categoryId)?.name || ""
              ) && (
                <>
                  <Divider />
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={4}>
                        <strong>Post Event to the Following Calendars:</strong>
                      </Grid.Column>
                      <Grid.Column width={12}>
                        <SemanticForm.Group inline>
                          <MySemanticCheckBox
                            name="imc"
                            label="Integrated Master Calendar (IMC)"
                          />
                        </SemanticForm.Group>
                      </Grid.Column>
                      <Grid.Column width={4} />
                      <Grid.Column width={12}>
                        <SemanticForm.Group inline>
                        <MySemanticCheckBox
                            name="copiedTobattlerhythm"
                            label="Battle Rhythm"
                            disabled={categories
                              .filter((x) => x.routeName === "battlerhythm")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedToacademic"
                            label="Academic Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "academic")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedToasep"
                            label="ASEP Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "asep")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
              
                          <MySemanticCheckBox
                            name="copiedTocommandGroup"
                            label="Command Group Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "commandGroup")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                

                          <MySemanticCheckBox
                            name="copiedTocommunity"
                            label="Community Event (External)"
                            disabled={categories
                              .filter((x) => x.routeName === "community")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />

                          <MySemanticCheckBox
                            name="copiedTocsl"
                            label="CSL Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "csl")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                        </SemanticForm.Group>
                      </Grid.Column>
                      <Grid.Column width={4} />
                      <Grid.Column width={12}>
                        <SemanticForm.Group inline>
                          <MySemanticCheckBox
                            name="copiedTogarrison"
                            label="Garrison Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "garrison")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTogeneralInterest"
                            label="General Interest"
                            disabled={categories
                              .filter((x) => x.routeName === "generalInterest")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedToholiday"
                            label="Holiday Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "holiday")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="mfp"
                            label="Military Family and Spouse Program"
                            disabled={categories
                              .filter(
                                (x) =>
                                  x.routeName ===
                                  "militaryFamilyAndSpouseProgram"
                              )
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
               
           
                          <MySemanticCheckBox
                            name="copiedTopksoi"
                            label="PKSOI Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "pksoi")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTosocialEventsAndCeremonies"
                            label="Social Events And Ceremonies"
                            disabled={categories
                              .filter(
                                (x) =>
                                  x.routeName === "socialEventsAndCeremonies"
                              )
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTossiAndUsawcPress"
                            label="SSI And USAWC Press Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "ssiAndUsawcPress")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                        </SemanticForm.Group>
                      </Grid.Column>
                      <Grid.Column width={4} />
                      <Grid.Column width={12}>
                        <SemanticForm.Group inline>
                          <MySemanticCheckBox
                            name="copiedTosymposiumAndConferences"
                            label="Symposium and Conferences"
                            disabled={categories
                              .filter(
                                (x) => x.routeName === "symposiumAndConferences"
                              )
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTossl"
                            label="SSL Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "ssl")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                              <MySemanticCheckBox
                            name="copiedTostaff"
                            label="Staff Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "staff")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTotrainingAndMiscEvents"
                            label="Training"
                            disabled={categories
                              .filter(
                                (x) => x.routeName === "trainingAndMiscEvents"
                              )
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTousahec"
                            label="USAHEC Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "usahec")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTousahecFacilitiesUsage"
                            label="USAHEC Facilities Usage Calendar"
                            disabled={categories
                              .filter(
                                (x) => x.routeName === "usahecFacilitiesUsage"
                              )
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                          <MySemanticCheckBox
                            name="copiedTovisitsAndTours"
                            label="Visits And Tours"
                            disabled={categories
                              .filter((x) => x.routeName === "visitsAndTours")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />
                  
                        </SemanticForm.Group>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                  <Divider />
                </>
              )}

            {(values.communityEvent || values.mfp || values.copiedTocommunity ||  ["Community Event (External)"].includes(
                categories.find((x) => x.id === values.categoryId)?.name || ""
              )) && (
              <Segment inverted color="red">
                <Header as={'h2'} content='You have selected Community Event and / or Military Spouse and Family Program so you must review the event details for OPSEC and PII. check box below when complete'/>
                <MyCheckBox
                  name="checkedForOpsec"
                />
              </Segment>
            )}

            {(values.mfp ||
              ["ASEP Calendar"].includes(
                categories.find((x) => x.id === values.categoryId)?.name || ""
              )) && (
              <MySelectInput
                options={[
                  { text: "No Color", value: "" },
                  {
                    text: "Leadership & Readiness",
                    value: "Leadership & Readiness",
                  },
                  {
                    text: "Personal Finance Management",
                    value: "Personal Finance Management",
                  },
                  {
                    text: "Personal Growth and Fitness",
                    value: "Personal Growth and Fitness",
                  },
                  {
                    text: "Family Growth & Resiliency",
                    value: "Family Growth & Resiliency",
                  },
                  { text: "TS-SCI", value: "TS-SCI" },
                ]}
                placeholder="No Color"
                name="educationalCategory"
                label="Educational Category for MFSP:"
              />
            )}

            <SemanticForm.Group widths="equal">
              <MyTextInput
                name="hyperlink"
                placeholder="https://"
                label="Public Hyperlink: (CBKS links not available to public)"
              />
              <MyTextInput
                name="hyperlinkDescription"
                placeholder="desciption for the link"
                label="Public Hyperlink Description:"
              />
              <MySelectInput
                options={[
                  { text: "", value: "" },
                  { text: "Undetermined", value: "Undetermined" },
                  { text: "Unclassified", value: "Unclassified" },
                  { text: "Secret", value: "Secret" },
                  { text: "Top Secret", value: "Top Secret" },
                  { text: "TS-SCI", value: "TS-SCI" },
                ]}
                placeholder="Event Clearance Level"
                name="eventClearanceLevel"
                label="Event Clearance Level:"
              />
            </SemanticForm.Group>

            <Divider />
            <Grid>
              <Grid.Row>
                <Grid.Column width={3}>
                  <strong>Request Presence:</strong>
                </Grid.Column>
                <Grid.Column width={13}>
                  <SemanticForm.Group inline>
                    <MySemanticCheckBox
                      name="commandantRequested"
                      label="Commandant"
                    />
                    <MySemanticCheckBox name="dptCmdtRequested" label="DCOM" />
                    <MySemanticCheckBox
                      name="provostRequested"
                      label="Provost"
                    />
                    <MySemanticCheckBox name="cofsRequested" label="COS" />
                    <MySemanticCheckBox name="deanRequested" label="Dean" />
                    <MySemanticCheckBox
                      name="ambassadorRequested"
                      label="AMB"
                    />
                    <MySemanticCheckBox name="csmRequested" label="CSM" />
                  </SemanticForm.Group>
                  <i>
                    Request the presence of the leader. (Sends an e-mail invite
                    to the leader's admin assistant.)
                  </i>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <Divider />

            {armyProfile && armyProfile?.mail && (
              <>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={3}>
                      <strong>Hosting / Outsider Report:</strong>
                    </Grid.Column>
                    <Grid.Column width={13}>
                      <SemanticForm.Group inline>
                        <MySemanticRadioButton
                          label="None"
                          value="none"
                          name="report"
                        />
                        <MySemanticRadioButton
                          label="Hosting Report - (BG (O7) and Above or Civilian SES Equivalent"
                          value="Hosting Report"
                          name="report"
                        />
                        <MySemanticRadioButton
                          label="Outsiders Report"
                          value="Outsiders Report"
                          name="report"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>

                {values.report !== "none" && (
                  <Segment inverted color="teal">
                    <Header as="h5" icon textAlign="center">
                      <FontAwesomeIcon
                        icon={faFileLines}
                        size="2x"
                        style={{ marginRight: "10px" }}
                      />
                      <Header.Content>
                        {values.report}
                      </Header.Content>
                    </Header>
                    <MyTextArea
                      rows={3}
                      placeholder="Description"
                      name="hostingReport.purposeOfVisit"
                      label="Purpose of Visit / Visit Objectives:"
                    />
                    {values.report === "Hosting Report" && (
                      <>
                        <Divider color="black" />
                        <Grid>
                          <Grid.Row>
                            <Grid.Column width={4}>
                              <strong>Office Call With Commandant:</strong>
                            </Grid.Column>
                            <Grid.Column width={12}>
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox name="hostingReport.officeCallWithCommandant" />
                              </SemanticForm.Group>
                              <i>If yes please coordinate with Commandant's Executive assistant </i>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextInput
                        name="hostingReport.escortOfficer"
                        placeholder="full name of the escort officer"
                        label="Escort Officer:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextInput
                        name="hostingReport.escortOfficerPhone"
                        placeholder="phone number to contact the escort officer"
                        label="Escort Officer Phone:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextInput
                        name="hostingReport.guestName"
                        placeholder="Visitor Full Name"
                        label="Visitor Name:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <MySelectInput
                        options={[
                          { text: "", value: "" },
                          { text: "GEN", value: "GEN" },
                          { text: "Gen", value: "Gen" },
                          { text: "ADM", value: "ADM" },
                          { text: "LTG", value: "LTG" },
                          { text: "LT Gen", value: "LT Gen" },
                          { text: "LTGen", value: "LTGen" },
                          { text: "SES", value: "SES" },
                          { text: "VADM", value: "VADM" },
                          { text: "MG", value: "MG" },
                          { text: "Maj Gen", value: "Maj Gen" },
                          { text: "MajGen", value: "MajGen" },
                          { text: "RADM", value: "RADM" },
                          { text: "BG", value: "BG" },
                          { text: "Brig Gen", value: "Brig Gen" },
                          { text: "BGen", value: "BGen" },
                          { text: "RDML", value: "RDML" },
                          { text: "COL", value: "COL" },
                          { text: "CAPT", value: "CAPT" },
                          { text: "LTC", value: "LTC" },
                          { text: "Lt Col", value: "Lt Col" },
                          { text: "LtCol", value: "LtCol" },
                          { text: "CDR", value: "CDR" },
                          { text: "MAJ", value: "MAJ" },
                          { text: "Maj", value: "Maj" },
                          { text: "LCDR", value: "LCDR" },
                          { text: "SMA", value: "SMA" },
                          { text: "CSM", value: "CSM" },
                          { text: "Mr.", value: "Mr." },
                          { text: "Mrs.", value: "Mrs." },
                          { text: "Ms.", value: "Ms." },
                          { text: "Dr.", value: "Dr." },
                          { text: "Prof.", value: "Prof." },
                          { text: "HON", value: "HON" },
                        ]}
                        placeholder="Visitor Rank / Honorific"
                        name="hostingReport.guestRank"
                        label="Visitor Rank / Honorific:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextInput
                        name="hostingReport.guestTitle"
                        placeholder="Visitor Title / Org"
                        label="Visitor Title / Org:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextInput
                        name="hostingReport.guestOfficePhone"
                        placeholder="Visitor Phone"
                        label="Visitor Phone:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextInput
                        name="hostingReport.uniformOfGuest"
                        placeholder="Unifrom of Visitor"
                        label="Uniform of Visitor:"
                      />
                    )}
                    {(!attachment || attachment.id < 1) &&
                      values.report === "Hosting Report" && (
                        <>
                          <Divider color="black" />
                          <Grid>
                            <Grid.Row>
                              <Grid.Column width={4}>
                                <strong>* Current Bio Attached:</strong>
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
                                <i id="currentBioAnchor">attach current bio</i>
                                {attachBioError && (
                                  <p>
                                    <Label basic color="red">
                                      Choose either Attached Or Pending
                                    </Label>
                                  </p>
                                )}
                                {attachNoAttachmentError && (
                                  <p>
                                    <Label basic color="red">
                                      If you choose attach you must upload the
                                      Bio Attachment
                                    </Label>
                                  </p>
                                )}
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>
                        </>
                      )}
                    {attachment &&
                      attachment.id > 0 &&
                      values.report === "Hosting Report" && (
                        <>
                          <Divider color="black" />
                          <Grid>
                            <Grid.Row>
                              <Grid.Column width={4}>
                                <strong>* Current Bio Attached:</strong>
                              </Grid.Column>
                              <Grid.Column width={12}>
                                <SemanticForm.Group inline>
                                  <SemanticForm.Radio
                                    label="Current Bio is Attached"
                                    checked
                                  />
                                </SemanticForm.Group>
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>
                        </>
                      )}
                    {attachment &&
                      attachment.id > 0 &&
                      !uploadDifferentBioIndicator &&
                      values.report === "Hosting Report" && (
                        <>
                          <Divider color="black" />
                          <Grid>
                            <Grid.Row>
                              <Grid.Column width={4}>
                                <strong>
                                  * Current Bio has been uploaded:
                                </strong>
                              </Grid.Column>
                              <Grid.Column width={4} textAlign="center">
                                <Button
                                  icon
                                  labelPosition="left"
                                  color="orange"
                                  onClick={handleDownloadAttachment}
                                  type="button"
                                >
                                  <Icon name="download" />
                                  Download Current Bio
                                </Button>
                              </Grid.Column>
                              <Grid.Column
                                width={4}
                                textAlign="center"
                                type="button"
                              >
                                <Button
                                  icon
                                  labelPosition="left"
                                  color="olive"
                                  onClick={handleUploadDifferentBioClick}
                                >
                                  <Icon name="upload" />
                                  Upload a different Bio
                                </Button>
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>
                          <Divider color="black" />
                        </>
                      )}
                    {(uploadDifferentBioIndicator ||
                      !(attachment && attachment.id && attachment.id > 0)) &&
                      values.report === "Hosting Report" && (
                        <>
                          <Divider color="black" />
                          <Grid>
                            <Grid.Row>
                              <Grid.Column width={4}>
                                <strong>Upload Bio:</strong>
                              </Grid.Column>
                              <Grid.Column width={12}>
                                <DocumentUploadWidget
                                  uploadDocument={handleDocumentUpload}
                                  loading={uploading}
                                />
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>
                          <Divider color="black" />
                        </>
                      )}
                    {values.report === "Hosting Report" && (
                      <MyTextArea
                        rows={3}
                        placeholder="Travel Party / Accompanied by"
                        name="hostingReport.travelPartyAccomaniedBy"
                        label="Travel Party / Accompanied by:"
                      />
                    )}
                    Visitor Itinerary:
                    <Editor
                      editorState={editorState}
                      onEditorStateChange={setEditorState}
                      wrapperClassName="wrapper-class"
                      editorClassName="editor-class"
                      toolbarClassName="toolbar-class"
                    />
                    {values.report === "Hosting Report" && (
                      <>
                        <Divider color="black" />
                        <Grid>
                          <Grid.Row>
                            <Grid.Column width={4}>
                              <strong>VIOS Support Requested:</strong>
                            </Grid.Column>
                            <Grid.Column width={12}>
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox
                                  name="hostingReport.viosSupportPhotography"
                                  label="Photography"
                                />
                                <MySemanticCheckBox
                                  name="hostingReport.viosSupportAV"
                                  label="AV"
                                />
                              </SemanticForm.Group>
                              <i>Has VIOS request been submitted?</i>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>

                        <div className="ui yellow message">
                          <div className="header">VIOS</div>
                          To request a photo or record video, click the{" "}
                          <a href="https://vios.army.mil" target="_blank">
                            VIOS
                          </a>{" "}
                          link. Opens the Visual Information Ordering Site
                          (VIOS) in a new browser tab
                        </div>
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <>
                        <MyDateInput
                          timeIntervals={15}
                          placeholderText="Date / Time of Arrival"
                          name="hostingReport.arrival"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          title="Date / Time of Arrival:"
                          minDate={new Date()}
                        />

                        <MyDateInput
                          timeIntervals={15}
                          placeholderText="Date / Time of Departure"
                          name="hostingReport.departure"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          title="Date / Time of Departure:"
                          minDate={new Date()}
                        />
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <MySelectInput
                        options={[
                          { text: "", value: "" },
                          { text: "None", value: "None" },
                          { text: "POV", value: "POV" },
                          { text: "GOV", value: "GOV" },
                          { text: "Commercial Air", value: "Commercial Air" },
                          {
                            text: "MILAIR (Rotary Wing)",
                            value: "MILAIR (Rotary Wing)",
                          },
                          {
                            text: "MILAIR (Fixed Wing)",
                            value: "MILAIR (Fixed Wing)",
                          },
                          { text: "Rental Car", value: "Rental Car" },
                          { text: "Bus", value: "Bus" },
                          { text: "Rail", value: "Rail" },
                        ]}
                        placeholder="Mode of Travel"
                        name="hostingReport.modeOfTravel"
                        label="Mode of Travel:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <>
                      <MyTextArea
                        rows={3}
                        placeholder="Provide details; if flying list airline, departure airport, arrival airport, arrival/departure time, flights etc."
                        name="hostingReport.travelArrangementDetails"
                        label="Travel Arrangement Details:"
                      />
                      <a href="https://www.ihg.com/armyhotels/hotels/us/en/carlisle/zyija/hoteldetail" target="_blank">
                      <Icon name='paperclip' style={{color: 'white'}}></Icon> <span  style={{color: 'white', textDecoration: 'underline' }}>  InterContinental Hotel Group (HG) Army Hotels Carlisle Barracks Info </span> 
                        </a>
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <>
                        <Divider color="black" />
                        <Grid>
                          <Grid.Row>
                            <Grid.Column width={4}>
                              <strong>Meal Requests:</strong>
                            </Grid.Column>
                            <Grid.Column width={12}>
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox
                                  name="hostingReport.mealRequestLunch"
                                  label="Lunch"
                                />
                                <MySemanticCheckBox
                                  name="hostingReport.mealRequestDinner"
                                  label="Dinner"
                                />
                              </SemanticForm.Group>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                        <Divider color="black" />
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextArea
                        rows={3}
                        placeholder="List any Dietary Restrictions"
                        name="hostingReport.dietaryRestrictions"
                        label="List any Dietary Restrictions:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <>
                        <Divider color="black" />
                        <Grid>
                          <Grid.Row>
                            <Grid.Column width={4}>
                              <strong>Are Lodging Arrangements Made:</strong>
                            </Grid.Column>
                            <Grid.Column width={12}>
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox name="hostingReport.lodgingArrangements" />
                              </SemanticForm.Group>
                              <i>
                                If yes provide lodging details. Lodging
                                location, room #, etc.
                              </i>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                        <Divider color="black" />
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextArea
                        rows={3}
                        placeholder="Lodging Location"
                        name="hostingReport.lodgingLocation"
                        label="Lodging Location:"
                      />
                    )}
                    {values.report === "Hosting Report" && (
                      <>
                        <Divider color="black" />
                        <Grid>
                          <Grid.Row>
                            <Grid.Column width={4}>
                              <strong>Local Transportation Needed:</strong>
                            </Grid.Column>
                            <Grid.Column width={12}>
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox name="hostingReport.localTransportationNeeded" />
                              </SemanticForm.Group>
                              <i>
                                If local transportation support is needed, check
                                the box and see instructions below
                              </i>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                        <Divider color="black" />

                        <div className="ui yellow message">
                          <div className="header">
                            Bus Transportation Request
                          </div>
                          If local transportation support is needed, check the
                          Local Transportation Checkbox above, and then submit
                          your request by clicking the
                          <a
                            href="https://armyeitaas.sharepoint-mil.us/teams/EnterprisePortal/Lists/BusTransportationRequest/AllItems.aspx"
                            target="_blank"
                          >
                            {" "}
                            Bus Transportation Request
                          </a>{" "}
                          link. When the site opens in a new tab click the New
                          button.
                        </div>
                      </>
                    )}
                    <Divider color="black" />
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={4}>
                          <strong>Parking Requirements:</strong>
                        </Grid.Column>
                        <Grid.Column width={12}>
                          <SemanticForm.Group inline>
                            <MySemanticCheckBox name="hostingReport.parkingRequirements" />
                          </SemanticForm.Group>
                          <i>
                            If parking is needed, check the box and a
                            notification will be sent to Executive Services
                          </i>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                    <Divider color="black" />
                    <MyTextArea
                      rows={3}
                      placeholder="Parking Details:  (Include any special requirements.)"
                      name="hostingReport.parkingDetails"
                      label="Parking Details:  (Include any special requirements.)"
                    />
                    {values.report === "Outsiders Report" && (
                      <>
                        <MyTextInput
                          name="hostingReport.outsiderReportUSAWCGraduate"
                          placeholder="USAWC Graduate: Enter Resident or DDEE and Year, e.g Res 2009, DDE 2008"
                          label="USAWC Graduate: Enter Resident or DDEE and Year, e.g Res 2009, DDE 2008"
                        />

                        <MySelectInput
                          options={[
                            { text: "", value: "" },
                            { text: "ACOM Outreach", value: "ACOM Outreach" },
                            {
                              text: "Cmdt's Personnal Staff",
                              value: "Cmdt's Personnal Staff",
                            },
                            {
                              text: "Cmdt's Special Staff",
                              value: "Cmdt's Special Staff",
                            },
                            { text: "Commmandant", value: "Commandant" },
                            { text: "CoS", value: "CoS" },
                            { text: "CSLD", value: "CSLD" },
                            { text: "EO", value: "EO" },
                            {
                              text: "Office of the Commandant",
                              value: "Office of the Commandant",
                            },
                            {
                              text: "Office of the Dean",
                              value: "Office of the Dean",
                            },
                            {
                              text: "Office of the Provost",
                              value: "Office of the Provost",
                            },
                            { text: "PKSOI", value: "PKSOI" },
                            { text: "RCI", value: "RCI" },
                            {
                              text: "School of Strategic Landpower",
                              value: "School of Strategic Landposer",
                            },
                            {
                              text: "SSI and USAWC Press",
                              value: "SSI and USAWC Press",
                            },
                            { text: "USAHEC", value: "USAHEC" },
                          ]}
                          placeholder="Directorate"
                          name="hostingReport.outsiderReportDirectorate"
                          label="Directorate:"
                        />

                        <MyTextInput
                          name="hostingReport.outsiderReportDV"
                          placeholder="Visiting DV: Enter the rank and bames of the distinguished visitors (DV). Outsiders Report is for important visitors, O6 and below"
                          label="Visiting DV: Enter the Rank and Names of the Distinguished Visitors (DV)"
                        />

                        <MyTextInput
                          name="hostingReport.outsiderReportNumOfPeople"
                          placeholder="Number of People"
                          label="Number of People:"
                        />
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <>
                        <Divider color="black" />
                        <Grid>
                          <Grid.Row>
                            <Grid.Column width={4}>
                              <strong>Flag Support Needed:</strong>
                            </Grid.Column>
                            <Grid.Column width={12}>
                              <SemanticForm.Group inline>
                                <MySemanticCheckBox name="hostingReport.flagSupport" />
                              </SemanticForm.Group>
                              <i>
                                If General Flag Support is needed, check the box
                                and a notification will be sent to Executive
                                Services
                              </i>
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                        <Divider color="black" />

                        <MyTextArea
                          rows={3}
                          placeholder="Flag Details:  (Describe type of flags and where to set up  e.g. US Army flag, USAWC flag, 2 star flag in Bliss Hall, etc.)"
                          name="hostingReport.flagDetails"
                          label="Flag Details::  (Describe type of flags and where to set up.)"
                        />
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextArea
                        rows={3}
                        placeholder="Official Gift Exchange (Or speaker fift only for addressing the entire class)"
                        name="hostingReport.gift"
                        label="Gift Requirement:"
                      />
                    )}
                    <Segment color="yellow" inverted>
                      <Divider color="black" />
                      <Grid>
                        <Grid.Row>
                          <Grid.Column width={4}>
                            <strong>Visitor is From Foreign Country:</strong>
                          </Grid.Column>
                          <Grid.Column width={12}>
                            <SemanticForm.Group inline>
                              <MySemanticCheckBox name="hostingReport.foreignVisitor" />
                            </SemanticForm.Group>
                          </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                          <Grid.Column width={4} />
                          <Grid.Column width={12}>
                            If Visitor is from a foreign country this will
                            e-mail the Security Office. If you have any
                            questions, contact the Security Office (245-4440 / 245 - 4289)
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                      <Divider color="black" />

                      {values.hostingReport &&
                        values.hostingReport.foreignVisitor && (
                          <>
                            <MyDataList
                              name="hostingReport.countryOfGuest"
                              placeholder="Country Of Guest"
                              label="Country of Guest: (Pick from the list or type your own)"
                              dataListId="countries"
                              options={Countries}
                            />

                            <Divider />
                            <Grid>
                              <Grid.Row>
                                <Grid.Column width={4}>
                                  <strong>
                                    Classification of Info Released:
                                  </strong>
                                </Grid.Column>
                                <Grid.Column width={12}>
                                  <SemanticForm.Group inline>
                                    <MySemanticRadioButton
                                      label="UNCLASS"
                                      value=""
                                      name="hostingReport.classificationOfInformationReleased"
                                    />
                                    <MySemanticRadioButton
                                      label="SECRET"
                                      value="SECRET"
                                      name="hostingReport.classificationOfInformationReleased"
                                    />
                                    <MySemanticRadioButton
                                      label="TOP SECRET"
                                      value="TOP SECRET"
                                      name="hostingReport.classificationOfInformationReleased"
                                    />
                                  </SemanticForm.Group>
                                </Grid.Column>
                              </Grid.Row>
                            </Grid>
                            <Divider />

                            <Divider />
                            <Grid>
                              <Grid.Row>
                                <Grid.Column width={4}>
                                  <strong>Type of Visit:</strong>
                                </Grid.Column>
                                <Grid.Column width={12}>
                                  <SemanticForm.Group inline>
                                    <MySemanticRadioButton
                                      label="None"
                                      value=""
                                      name="hostingReport.typeOfVisit"
                                    />
                                    <MySemanticRadioButton
                                      label="DOD Sponsored Visit"
                                      value="DOD Sponsored Visit"
                                      name="hostingReport.typeOfVisit"
                                    />
                                    <MySemanticRadioButton
                                      label="Govermnent to Government Visit"
                                      value="Govermnent to Government Visit"
                                      name="report"
                                    />
                                  </SemanticForm.Group>
                                </Grid.Column>
                              </Grid.Row>
                            </Grid>
                            <Divider />

                            <MyTextArea
                              rows={3}
                              placeholder="Additional Foreign Visitor Info"
                              name="hostingReport.additionalForeignGuestInformation"
                              label="Additional Foreign Visitor Info:"
                            />
                          </>
                        )}
                    </Segment>
                    {values.report === "Hosting Report" &&
                      values.hostingReport &&
                      id && (
                        <MySelectInput
                          options={[
                            { text: "", value: "" },
                            { text: "Draft", value: "Draft" },
                            {
                              text: "Exec Services Approved",
                              value: "Exec Services Approved",
                            },
                          ]}
                          placeholder="Hosting Report Status"
                          name="hostingReport.hostingReportStatus"
                          label="Hosting Report Status:  (Only Exec Services may use this dropdown."
                        />
                      )}
                    {values.report === "Outsiders Report" &&
                      values.hostingReport &&
                      id && (
                        <>
                          <MySelectInput
                            options={[
                              { text: "", value: "" },
                              { text: "Draft", value: "Draft" },
                              {
                                text: "Exec Services Approved",
                                value: "Exec Services Approved",
                              },
                            ]}
                            placeholder="Outsiders Report Status"
                            name="hostingReport.outsiderReportStatus"
                            label="Outsiders Report Status:  (Only Exec Services may use this dropdown."
                          />

                          <MyTextInput
                            name="hostingReport.outsiderReportEngagement"
                            placeholder="Enagement With"
                            label="Engagement With:"
                          />
                        </>
                      )}
                  </Segment>
                )}
              </>
            )}

            <Button
              disabled={submitting || activity.cancelled}
              loading={submitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              as={Link}
              to={
                id && id.length > 0
                  ? `${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`
                  : `${process.env.PUBLIC_URL}/activityTable`
              }
              floated="right"
              type="button"
              content="Cancel"
            />
          </Form>
        )}
      </Formik>
      {activity.createdBy && activity.createdAt && 
      <Header as='h3'>
    <Header.Subheader>
      Created by {activity.createdBy} @ {format(new Date(activity.createdAt), 'MMMM d, yyyy h:mm aa')}
    </Header.Subheader>
    {activity.lastUpdatedBy && activity.lastUpdatedAt &&
    <Header.Subheader>
      <br/>
      Last Updated by {activity.lastUpdatedBy} @ {format(new Date(activity.lastUpdatedAt), 'MMMM d, yyyy h:mm aa')}
    </Header.Subheader>
    }
  </Header>
}
    </Segment>
  );
});
