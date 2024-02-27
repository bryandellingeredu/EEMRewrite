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
  ButtonGroup,
  Modal,
  Image,
  FormInput
} from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { ValidationError } from 'yup';
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
  faGlobeAmericas,
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
import { convertToRaw, EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import DocumentUploadWidget from "../../../app/common/documentUpload/documentUploadWidget";
import { Attachment } from "../../../app/models/attachment";
import { toast } from "react-toastify";
import { Countries } from "../../../app/models/countryList";
import agent from "../../../app/api/agent";
import RepeatingEventButton from "./RepeatingEventButton";
import { ActivityAttachment } from "../../../app/models/activityAttachment";
import UploadAttachmentModal from "./UploadAttachmentModal";
import ActivityAttachmentComponent from "./ActivityAttachmentComponent";
import SubCalendarInformation from "./SubCalendarInformation";
import CUIWarningModal from "./CUIWarningModal";
import MyTextAreaWithTypeahead from "../../../app/common/form/MyTextAreaWithTypeAhead";
import TeamsButtonEDU from "./TeamsButtonEDU";
import { UserEmail } from "../../../app/models/userEmail";
import { BackToCalendarInfo } from "../../../app/models/backToCalendarInfo";
import TeamsButtonArmy from "./TeamsButtonArmy";
import SelectRoomWizard from "./SelectRoomWizard";



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
    modalStore,
    userStore,
    backToCalendarStore
  } = useStore();
  const {
    createGraphEvent,
    updateGraphEvent,
    createActivity,
    updateActivity,
    loadActivity,
    loadingInitial,
    uploadDocument,
    uploadActivityDocument,
    uploading,
    calendarEventParameters,
    setTempRoomEmails,
    getTempRoomEmails,
    removeTempRoomEmails
  } = activityStore;
  const {user, isLoggedIn} = userStore
  const {getBackToCalendarInfoRecord} = backToCalendarStore;
  const [armyTeamLink, setArmyTeamLink] = useState('');
  const [armyTeamLinkWarning, setArmyTeamLinkWarning ] = useState(false);
  const updateArmyTeamLink  = (newArmyTeamLink: string) => {setArmyTeamLink(newArmyTeamLink)};
  const [enlistedAidAdmin, setEnlistedAidAdmin] = useState(false);
  const [studentCalendarAdmin, setStudentCalendarAdmin] = useState(false);
  const [cioEventPlanningAdmin, setCIOEventPlanningAdmin] = useState(false);
  const [memberOfExecServices, setMemberOfExecServices] = useState(false);
  useEffect(() => {
    setStudentCalendarAdmin((user && user.roles && user.roles.includes("studentCalendarAdmin")) || false);
    setEnlistedAidAdmin((user && user.roles && user.roles.includes("EnlistedAidAdmin")) || false);
    setCIOEventPlanningAdmin((user && user.roles && user.roles.includes("CIOEventPlanningAdmin")) || false);
    setMemberOfExecServices((user && user.roles && user.roles.includes("ExecServices")) || false);
}, [user]);
  const [roomOptionRegistryId, setRoomOptionRegistryId] = useState<string>(uuid())
  const [attendees, setAttendees] = useState<UserEmail[]>([]);
  const updateAttendees = (newAttendees: UserEmail[]) => {setAttendees(newAttendees);};
  const [makeTeamMeeting, setMakeTeamMeeting] = useState(false);
  const updateMakeTeamMeeting = () => {setMakeTeamMeeting(true)};
  const[teamIsDeleted, setTeamIsDeleted] = useState(false);
  const[teamAttendeesLoading, setTeamAttendeesLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [lockDateInput, setLockDateInput] = useState(false);
  const setLockDateInputLocked = () => setLockDateInput(true);
  const setlockDateInputUnlocked = () => setLockDateInput(false); 
  const { categoryOptions, categories, loadCategories } = categoryStore;
  const { eduGraphUser, loadEDUGraphUser, armyProfile } = graphUserStore;
  const { locationOptions, loadLocations } = locationStore;
  const { organizationOptions, organizations, loadOrganizations } =
    organizationStore;
  const { graphRooms, loadGraphRooms, graphReservationParameters } =
    graphRoomStore;
  const {openModal, closeModal} = modalStore;
  const { id } = useParams<{ id: string }>();
  const { roomid } = useParams<{ roomid: string }>();
  const { calendarid } = useParams<{ calendarid: string }>();
  const { manageSeries } = useParams<{ manageSeries: string }>();
  const { copy } = useParams<{ copy: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { backToCalendarId } = useParams<{ backToCalendarId: string }>();
  const { enlistedaideid } = useParams<{ enlistedaideid: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(
    new ActivityFormValues()
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    new RecurrenceFormValues()
  );
  const [cuiWarningHasBeenDisplayed, setCUIWarningHasBeenDisplayed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [attachBioError, setAttachBioError] = useState(false);
  const [distantTechError, setDistantTechError] = useState(false);
  const [attachNoAttachmentError, setAttachNoAttachmentError] = useState(false);
  const [subCalendarError, setSubCalendarError] = useState(false);
  const [noRoomError, setNoRoomError] = useState(false);
  const [noRegistrationSiteError, setNoRegistrationSiteError] = useState(false);
  const [noLeaderDateError, setNoLeaderDateError] = useState(false);
  const [recurrenceInd, setRecurrenceInd] = useState<boolean>(false);
  const [recurrenceDisabled, setRecurrenceDisabled] = useState<boolean>(false);
  const [roomRequired, setRoomRequired] = useState<boolean>(false);
  const [showRoomWizard,setShowRoomWizard] = useState<boolean>(false);
  const [roomEmails, setRoomEmails] = useState<string[]>([]);
  const [originalRoomEmails, setOriginalRoomEmails] = useState<string[]>([]);
  const [uploadDifferentBioIndicator, setUploadDifferentBioIndicator] =
    useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(categoryId);
  const [cancellingRooms, setCancellingRooms] =
  useState(false);

  const [popupStartOpen, setPopupStartOpen] =useState(false);
  const [popupEndOpen, setPopupEndOpen] =useState(false);
  const [popupRecurringOpen, setPopupRecurringOpen] = useState(false);
  const [removeEventLookup, setRemoveEventLookup] = useState(false);

  const handleRecurringClose = () => {
    setPopupRecurringOpen(false);
  }

  const handleRecurringOpen = () => {
    setPopupRecurringOpen(true);
  }

  const handleSetConfirmModalOpen = () => {
    setConfirmModalOpen(true);
  }

  const handleStartOpen = () => {
    setPopupStartOpen(true);
  }

  const handleEndOpen = () => {
    setPopupEndOpen(true);
  }



  const handleCancelRoomReservations =() => {
    setConfirmModalOpen(false);
    setCancellingRooms(true);
    agent.Activities.cancelRoomReservations(id, manageSeries)
    .then(() => {
      setTempRoomEmails(id, roomEmails);
      setRemoveEventLookup(true);
     setRoomRequired(false);
      setRoomEmails([]);
      setOriginalRoomEmails([]);
      setCancellingRooms(false);
      setPopupStartOpen(false);
      setTimeout(function() {
        setRoomRequired(true);
        let currentPath = history.location.pathname;
        history.replace(`/temporary-route`);
        history.replace(currentPath);
      }, 1000);
    }).catch((error) => {
      console.log(error);
      toast.error('error cancelling room reservations');
      setPopupStartOpen(false);
      setPopupEndOpen(false);
    });
  }

  const handleSetRoomRequired = (newRoomRequired : boolean) => setRoomRequired(newRoomRequired);
  const handleSetShowRoomWizard = (newShowRoomWizard: boolean) => setShowRoomWizard(newShowRoomWizard);
  const handleCloseSelectRoomWizard = () => {
    setShowRoomWizard(false);
    const noRoomErrorAnchor = document.getElementById("noRoomErrorAnchor");
    if (noRoomErrorAnchor) {
      noRoomErrorAnchor.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
  const handleUploadDifferentBioClick = () =>
    setUploadDifferentBioIndicator(true);

  const [blissHallModalOpen, setBlissHallModalOpen] = useState<boolean>(false);
  const handleCloseBlissHallModal = () => setBlissHallModalOpen(false);

  const handleSetRoomEmails = (newRoomEmails: string[]) => {

    const blissHallEmails = graphRooms
    .filter(x => x.displayName.includes("Bliss"))
    .map(x => x.emailAddress);

    let showModal : boolean = false;

    blissHallEmails.forEach(email => {
      if (!roomEmails.includes(email) && newRoomEmails.includes(email)) {
        showModal = true;
      }
    });

    if (showModal) {
      setBlissHallModalOpen(true);
    }

    setRoomEmails(newRoomEmails);

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

  const [activityAttachments, setActivityAttachments] = useState<ActivityAttachment[]>([]);
  const [activityAttachmentGroupId, setActivityAttachmentGroupId] = useState(uuid());

  const deleteActivityAttachment = (activityAttachmentId : string) => {
    setActivityAttachments(activityAttachments.filter(x => x.id !== activityAttachmentId));
  }

   const handleCUIWarningHasBeenDisplayed = () => {
    closeModal();
    setCUIWarningHasBeenDisplayed(true);
  }

  function handleActivityDocumentUpload(file: any) {
    const activityAttachmentId = uuid();
    const fileName = file.name;
    const fileType = file.type;

    uploadActivityDocument(file, activityAttachmentGroupId, activityAttachmentId)
      .then((response) => {
        const activityAttachment: ActivityAttachment = {
          id: activityAttachmentId,
          activityAttachmentGroupId,
          fileName,
          fileType
        };
        setActivityAttachments([...activityAttachments, activityAttachment]);
        toast.success(`${activityAttachment.fileName} successfully uploaded`);
      })
      .catch((error) => {
        console.log(error);
        toast.error(`Error uploading ${fileName}: ${error.message}`);
      });
  }


  function handleBioDocumentUpload(file: any) {
    uploadDocument(file).then((response) => {
      setUploadDifferentBioIndicator(false);
      setAttachment(response);
      toast.success(`${response.fileName} successfully uploaded`);
    });
  }

  const deleteTeamMeeting = async () => {
    try{
      if(id && manageSeries && manageSeries === "true"){
        await agent.Teams.deleteSeries(id);
      }else{
        await agent.Teams.delete(activity.teamLookup, activity.teamRequester);
      }
    
      setTeamIsDeleted(true);
      activity.teamLink = '';
      activity.teamInvites = [];
      activity.teamRequester = '';
      activity.teamLookup = '';
      setMakeTeamMeeting(false);
      toast.success("the team meeting has been deleted", {
        position: "top-center",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
      
    } catch (err) {
      console.error(err);
      toast.error("an error occured deleting teams meeting", {
        position: "top-center",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
    }
  }


  /*const handleDownloadAttachment = async () => {
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
  }; */

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

      const attachmentData = await fetch(`${process.env.REACT_APP_API_URL}/upload/${metaData.id}`, requestOptions);

 headers.append('Content-Type', 'application/json');
          const data = await attachmentData.arrayBuffer();
         const file = new Blob([data], { type: metaData.fileType });
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
    copiedTocio: Yup.boolean(),
    categoryId: Yup.string(),
    primaryLocation: Yup.string()
    .when('$roomRequired', {
      is: false,
      then: Yup.string().required("Primary Location is required"),
    }),    
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
    eventClearanceLevel: Yup.string().required('The Event Clearance Level is required'),
    title: Yup.string().required("The title is required"),
    description: Yup.string().required("Event Details are required"),
    start: Yup.string()
      .required()
      .nullable()
      .test("startBeforeEnd", "Start must be before or same as End", function () {
        return new Date(this.parent.start) <= new Date(this.parent.end);
      }),
    end: Yup.string().required().nullable(),
    actionOfficer: Yup.string().required(),
    actionOfficerPhone: Yup.string().required(),
  });

  useEffect(() => {
    if(!isLoggedIn)  window.location.href = `${window.location.origin}/eem?redirecttopage=manage/${id}/${categoryId}`;
   }, [isLoggedIn] )

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
    if (id) {0
      loadActivity(id, categoryId).then((response) => {
        if (response && !response.report) response.report = "none" ;
        if(copy && copy === 'true' && response && response.hostingReport) response.hostingReport = null;
        if(copy && copy === 'true' && response && response.title) response.title = response.title + ' Copied on - ' + format(new Date(), 'MMMM d, yyyy h:mm aa')
        if(copy && copy === 'true' && response && response.report) response.report = 'none';
        if(copy && copy === 'true' && response && response.activityRooms) response.activityRooms = [];
        if(copy && copy === 'true' && response && response.recurrenceInd) response.recurrenceInd = false;
        if(copy && copy === 'true' && response && response.eventLookup) response.eventLookup = '';
        if(copy && copy === 'true' && response && response.teamLookup && response.teamRequester){
          setMakeTeamMeeting(true);
        } 
        if(response && response.armyTeamLink){
          setArmyTeamLink(response.armyTeamLink);
          setArmyTeamLinkWarning(true);
        }

       
        setActivity(new ActivityFormValues(response));
        if (response?.attachmentLookup && response?.attachmentLookup > 0 && (!copy || copy === 'false')) {
          setAttachment({
            id: response?.attachmentLookup,
            fileName: "",
            fileType: "",
          });
        }
        if (response?.activityAttachmentGroupLookup && response?.activityAttachmentGroupLookup.length > 0 && (!copy || copy === 'false')) {
          setActivityAttachmentGroupId(response?.activityAttachmentGroupLookup);
          agent.Attachments.activityDetails(response.activityAttachmentGroupLookup).then((response) => {
            setActivityAttachments(response);
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

        if(response?.teamLookup && response?.teamRequester){
          agent.Teams.attendees(response?.teamLookup, response?.teamRequester).then((attendeeArray) => {
            setTeamAttendeesLoading(false);
              if(attendeeArray.length){
                  setAttendees(attendeeArray);
              }
          });
      }else{
        setTeamAttendeesLoading(false);
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
      setTeamAttendeesLoading(false);
      loadCategories();
      loadOrganizations();
      loadLocations();
    }
    if (isSignedIn) {
      loadEDUGraphUser();
    }
    if(getTempRoomEmails(id)){
      setRoomRequired(true);
    }
  }, [isSignedIn, graphRooms]);

  const handleCancelClick = () => {

    if(backToCalendarId){
      const backToCalendarRecord : BackToCalendarInfo | undefined = getBackToCalendarInfoRecord(backToCalendarId);
      if(backToCalendarRecord){
       const url : string = `${backToCalendarRecord.url}/${backToCalendarRecord.id}`
       history.push(url);
       return;
      }
    }
    const url = id && id.length > 0
      ? `${process.env.PUBLIC_URL}/activitydetail/${id}/${categoryId}/true`
      : `${process.env.PUBLIC_URL}/activityTable`;
    history.push(url);
  };

  function handleFormSubmit(activity: ActivityFormValues) {
    setShowRoomWizard(false);
    if(id && getTempRoomEmails(id)){
      removeTempRoomEmails(id);
    }
    let hostingReportError = false;
    let distantTechErrorIndicator = false;
    let subCalendarErrorIndicator = false;
    let noRoomErrorIndicator = false;
    let noRegistrationSiteErrorIndicator = false;
    let noLeaderDateErrorIndicator = false;
    setDistantTechError(false);
    setAttachBioError(false);
    setAttachNoAttachmentError(false);
    setSubCalendarError(false);
    setNoRoomError(false);
    setNoRegistrationSiteError(false);
    setNoLeaderDateError(false);

    
    if(!roomRequired && (activity.categoryId == '' || categories.find((x) => x.id === activity.categoryId)?.name ==="Other")){
      setSubCalendarError(true);
      subCalendarErrorIndicator = true;
      const subCalendarAnchor = document.getElementById("subCalendarAnchor");
      if (subCalendarAnchor) {
        subCalendarAnchor.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    if (roomRequired && roomEmails.length < 1){
      setNoRoomError(true);
      noRoomErrorIndicator = true;
      const noRoomErrorAnchor = document.getElementById("noRoomErrorAnchor");
      if (noRoomErrorAnchor) {
        noRoomErrorAnchor.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    if(activity.copiedTosymposiumAndConferences && activity.symposiumLinkInd && !activity.symposiumLink){
      setNoRegistrationSiteError(true);
      noRegistrationSiteErrorIndicator = true;
      const noRegistrationSiteErrorAnchor = document.getElementById("noRegistrationSiteErrorAnchor")
      if(noRegistrationSiteErrorAnchor){
        noRegistrationSiteErrorAnchor.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    if(
      (activity.commandantRequested && (!activity.commandantStart || !activity.commandantEnd )) ||
      (activity.dptCmdtRequested && (!activity.dptCmdtStart || !activity.dptCmdtEnd)) ||
      (activity.provostRequested && (!activity.provostStart || !activity.provostEnd)) ||
      (activity.csmRequested && (!activity.csmStart || !activity.csmEnd)) ||
      (activity.deanRequested && (!activity.deanStart || !activity.deanEnd)) ||
      (activity.cofsRequested && (!activity.cofsStart || !activity.cofsEnd)) ||
      (activity.ambassadorRequested && (!activity.ambassadorStart || !activity.ambassadorEnd)) 
    ){
       setNoLeaderDateError(true);
       noLeaderDateErrorIndicator = true;
       const noLeaderDateErrorAnchor = document.getElementById("noLeaderDateErrorAnchor");
       if(noLeaderDateErrorAnchor){
        noLeaderDateErrorAnchor.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
       }
    }

    if (activity.vtc && !activity.distantTechPhoneNumber){
      setDistantTechError(true);
      distantTechErrorIndicator = true;
      const distantTechAnchor = document.getElementById("distantTechAnchor");
      if (distantTechAnchor) {
        distantTechAnchor.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
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
    if (!hostingReportError && !distantTechErrorIndicator && !subCalendarErrorIndicator && !noRoomErrorIndicator && !noRegistrationSiteErrorIndicator && !noLeaderDateErrorIndicator) {
      setSubmitting(true);
      if(roomEmails.includes('Bldg650CollinsHallB037SVTC@armywarcollege.edu')){
        activity.eventClearanceLevel = 'Secret';
      }
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
      if(activityAttachments && activityAttachments.length > 0){
        activity.activityAttachmentGroupLookup = activityAttachmentGroupId;
      }else{
        activity.activityAttachmentGroupLookup = null;
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
      activity.teamInvites = attendees;
      activity.armyTeamLink = armyTeamLink;
      if(!activity.teamLink && makeTeamMeeting) activity.makeTeamMeeting = true;
      if(teamIsDeleted) {
        activity.teamInvites = [];
        activity.teamLink = '';
        activity.teamLookup = '';
        activity.teamRequester = '';
        activity.makeTeamMeeting = false;
      }
      if(removeEventLookup) activity.eventLookup = '';
      if (!activity.id || (copy && copy === 'true' )) {
        let newActivity = {
          ...activity,
          id: category.name === "Academic Calendar" ? "" : uuid(),
          teamLink: "",
          teamRequestor: "",
          teamLookup: "",
          teamInvites: attendees,
          makeTeamMeeting: makeTeamMeeting
        };
        category.name === "Academic Calendar"
          ? createGraphEvent(newActivity).then(() =>{
              if(backToCalendarId){
                const backToCalendarRecord : BackToCalendarInfo | undefined = getBackToCalendarInfoRecord(backToCalendarId);
                if(backToCalendarRecord){
                 const url : string = `${backToCalendarRecord.url}/${backToCalendarRecord.id}`
                 history.push(url);
                }else{
                  history.push(
                    `${process.env.PUBLIC_URL}/activities/${newActivity.id}/${category.id}`
                  )
                }   
              }else{
                history.push(
                  `${process.env.PUBLIC_URL}/activities/${newActivity.id}/${category.id}`
                )
              }
             
          })
          : createActivity(newActivity)
          .then(() => {
            if(backToCalendarId){
              const backToCalendarRecord : BackToCalendarInfo | undefined = getBackToCalendarInfoRecord(backToCalendarId);
              if(backToCalendarRecord){
               const url : string = `${backToCalendarRecord.url}/${backToCalendarRecord.id}`
               history.push(url);
              }else{
                history.push(
                  `${process.env.PUBLIC_URL}/activitydetail/${newActivity.id}/${category.id}/true`
                )
              }   
            }else{
              history.push(
                `${process.env.PUBLIC_URL}/activitydetail/${newActivity.id}/${category.id}/true`
              )
            }
          })
          .catch((error) => {
            console.log(error);
            toast.error('An error occurred while creating the activity');
          });
        
      } else {
        debugger;
        category.name === "Academic Calendar"
          ? updateGraphEvent({ ...activity, id: activity!.id }).then(() =>
          {
            if(enlistedaideid){
              history.push(
                `${process.env.PUBLIC_URL}/enlistedAideCheckListForm/${activity.id}/${category.id}`
              )
            }else{
              history.push(
                `${process.env.PUBLIC_URL}/activitydetail/${activity.id}/${category.id}/true`
              )
            }
          }
            )
          : updateActivity(
              { ...activity, id: activity!.id },
              manageSeries
            ).then(() =>{
              if(enlistedaideid){
                history.push(
                  `${process.env.PUBLIC_URL}/enlistedAideCheckListForm/${activity.id}/${category.id}`
                )
              }else{  
                debugger;     
                if(backToCalendarId){
                  const backToCalendarRecord : BackToCalendarInfo | undefined = getBackToCalendarInfoRecord(backToCalendarId);
                  if(backToCalendarRecord){
                   const url : string = `${backToCalendarRecord.url}/${backToCalendarRecord.id}`
                   history.push(url);
                  }else{
                    history.push(
                      `${process.env.PUBLIC_URL}/activitydetail/${activity.id}/${category.id}/true`
                    )
                  }
                } else {
                history.push(
                  `${process.env.PUBLIC_URL}/activitydetail/${activity.id}/${category.id}/true`
                )
                }            
              }
            }
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
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const fiftyNineDaysInMs = 59 * oneDayInMs;
    useEffect(() => {
      if(!cuiWarningHasBeenDisplayed && !v.checkedForOpsec && 
         (v.communityEvent || v.mfp || v.copiedTocommunity ||  ["Community Event (External)"]
         .includes(categories.find((x) => x.id === v.categoryId)?.name || "")
         )){
          openModal(
            <CUIWarningModal handleCUIWarningHasBeenDisplayed={handleCUIWarningHasBeenDisplayed} showHeader={true} cuiButtonClicked={false} opsecButtonClicked={false}/>, 'large'
           )
         }
      if ((v.end && v.start) && v.end.getDate() !== v.start.getDate()) {
        setRecurrenceDisabled(true);
        setRecurrenceInd(false);
      } else {
        setRecurrenceDisabled(false);
      }
      if ((v.end && v.start) && v.end < v.start) {
        setFieldValue("end", new Date(v.start.getTime() + 30 * 60000));
      } else if ((v.end && v.start) && v.end.getTime() === v.start.getTime()) {
        setFieldValue("end", new Date(v.start.getTime() + 15 * 60000));
      } else if ((v.end && v.start) && v.end.getTime() - v.start.getTime() > fiftyNineDaysInMs) {
        setFieldValue("end", new Date(v.start.getTime() + fiftyNineDaysInMs));
      }

      if (currentCategoryId !== v.categoryId) {
        const isIncludedInIMC = categories
          .filter((x) => x.includeInIMC)
          .map((x) => x.id)
          .includes(v.categoryId);
        if (v.imc !== isIncludedInIMC && !(id && id.length))  {
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
          { routeName: "cio", copiedTo: "copiedTocio" },
          { routeName: "garrison", copiedTo: "copiedTogarrison" },
          { routeName: "internationalfellows", copiedTo: "copiedTointernationalfellows" },
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
          { routeName: "studentCalendar", copiedTo: "copiedTostudentCalendar" },
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

  const renderConfirmModal = () => (
    <Modal
    style={{ marginTop: '300px' }}
      size="mini"
      open={confirmModalOpen}
      onClose={() => setConfirmModalOpen(false)}
    >
      <Modal.Header>Change Room Reservation Time</Modal.Header>
      <Modal.Content>
        <p>Are you sure you want to change the time of this room reservation?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={() => setConfirmModalOpen(false)}>
          No
        </Button>
        <Button
          positive
          onClick={handleCancelRoomReservations}
        >
          Yes
        </Button>
      </Modal.Actions>
    </Modal>
  );

  function yupToFormErrors(yupError: ValidationError) {
    let errors: Record<string, string> = {};
  
    if (yupError.inner) {
      for (let error of yupError.inner) {
        if (error.path && !errors[error.path]) {
          errors[error.path] = error.message;
        }
      }
    }
  
    return errors;
  }

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

      {armyTeamLinkWarning &&
           <div className="ui yellow message">
           <div className="header">
             This Event has an associated Army Teams Meeting.
           <span style={{ paddingRight: "10px" }}>
             If you make changes to this event make sure you also update the Team Meeting in Outlook.{" "}
           </span>
           </div>
         </div>
      }

<Modal
        open={blissHallModalOpen}
        onClose={handleCloseBlissHallModal}
        size='small'
      >
        <Modal.Header>Bliss Auditorium Support</Modal.Header>
        <Modal.Content>
          <p>You have selected Bliss Auditorium, Please indicate if you need additional support by clicking the Bliss Auditorium Support Checkbox.  If selected then enter your comments in the Bliss Auditorium AV 
            Support Required Textbox. This gives teh NEC contractor a heads up that audio visual support is being requested (e.g. projection support, record presentation, broadcast presentation etc). If you do need projection support,
            please attach your PowerPoint Briefing to the attachment section at the bottom of the form. Please contact Matt Divittore at 245-4333 if you have additional questions about utilizing Bliss Auditorium.
          </p>
          <p>
            NOTE: If you need audio visual support, you must also enter your audio visual request into the  <a href="https://vios.army.mil" target="_blank">
                            VIOS
                          </a>{" "} system. The NEC Contractor still requires the <a href="https://vios.army.mil" target="_blank">
                            VIOS
                          </a>{" "}form to be filled out.
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleCloseBlissHallModal}>
            Close
          </Button>
        </Modal.Actions>
      </Modal>

<Formik
  enableReinitialize
  initialValues={activity}
  onSubmit={(values) => handleFormSubmit(values)}
  validate={(values) => {
    try {
      debugger;
      validationSchema.validateSync(values, {
        context: { roomRequired },
        abortEarly: false,
      });
    } catch (error) {
      debugger;
      if (error instanceof ValidationError) {
        return yupToFormErrors(error);
      }
      else{
        if(error instanceof Object){
        toast.error(error.toString(), {
          position: "top-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          });
        }
      }
      throw error;
    }
  }}
>
  
        {({ handleSubmit, isSubmitting, values }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">

            <FormObserver />
            <ScrollToFieldError />
         
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
                       open={popupStartOpen}
                       onOpen={handleStartOpen}
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
                    <Button
            floated="right"
            icon
            size="mini"
            color="black"
            compact
            onClick={() => {setPopupStartOpen(false)}}
          >
            <Icon name="close" />
          </Button>
                      Why can't I change the start date?
                    </Popup.Header>
                    <Popup.Content>
                      This event has a current room reservation. Changing the start date will
                      require the room to be re-approved by the room delegate. 
                         <Divider />
                      <Button type='button' primary
                        onClick={() => { setConfirmModalOpen(true);}} loading={cancellingRooms}>
                        Change Room Reservation Time
                      </Button> 
                      {renderConfirmModal()}
                    </Popup.Content>
                  </Popup>
                </Grid.Column>
                <Grid.Column>
                  <Popup
                   open={popupEndOpen }
                   onOpen={handleEndOpen}
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
                    <Button
            floated="right"
            icon
            size="mini"
            color="black"
            compact
            onClick={() => setPopupEndOpen(false)}
          >
            <Icon name="close" />
          </Button>
                      Why can't I change the end date?
                    </Popup.Header>
                    <Popup.Content>
               
                    This event has a current room reservation. Changing the end date will
                      require the room to be re-approved by the room delegate. 
                         <Divider />
                      <Button type='button' primary
                        onClick={() => {setConfirmModalOpen(true);}} loading={cancellingRooms}>
                        Change Room Reservation Time
                      </Button> 
                      {renderConfirmModal()}
                    </Popup.Content>
                  </Popup>
                </Grid.Column>    
                <Grid.Column>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                 <div style={{ flex: '1 1 auto' }}>
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
                    handleRecurringClose={handleRecurringClose}
                    handleRecurringOpen={handleRecurringOpen}
                    popupRecurringOpen={popupRecurringOpen}
                    renderConfirmModal={renderConfirmModal}
                    handleSetConfirmModalOpen={handleSetConfirmModalOpen}
                    cancellingRooms={cancellingRooms}
                  />
                </div>
                </div>
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
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                 
                    <div style={{ flex: '1 1 auto' }}>
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
                    handleRecurringClose={handleRecurringClose}
                    handleRecurringOpen={handleRecurringOpen}
                    popupRecurringOpen={popupRecurringOpen}
                    renderConfirmModal={renderConfirmModal}
                    handleSetConfirmModalOpen={handleSetConfirmModalOpen}
                    cancellingRooms={cancellingRooms}
                  />
                      </div>
                  </div>
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
                        title={lockDateInput ? "Loading Rooms Please Wait..." : "*Start:"}
                        minDate={new Date()}
                        showTimeSelect={!values.allDayEvent}
                        timeIntervals={!values.allDayEvent ? 15 : undefined}
                        timeCaption="time"
                        disabled={ lockDateInput ||
                          (id && originalRoomEmails && originalRoomEmails.length
                            ? true
                            : false)
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
                        title={lockDateInput ? "Loading Rooms Please Wait..." : "*End:"}
                        minDate={values.start}
                        showTimeSelect={!values.allDayEvent}
                        timeIntervals={!values.allDayEvent ? 15 : undefined}
                        timeCaption="time"
                        disabled={ lockDateInput ||
                          (id && originalRoomEmails && originalRoomEmails.length
                            ? true
                            : false)
                        }
                      />
                    </SemanticForm.Field>
            
                    <SemanticForm.Field>
     
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                  
                  <div style={{ flex: '1 1 auto' }}>
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
                    handleRecurringClose={handleRecurringClose}
                    handleRecurringOpen={handleRecurringOpen}
                    popupRecurringOpen={popupRecurringOpen}
                    renderConfirmModal={renderConfirmModal}
                    handleSetConfirmModalOpen={handleSetConfirmModalOpen}
                    cancellingRooms={cancellingRooms}
                  />
                    </div>
                 </div>
      
                    </SemanticForm.Field>
                  </SemanticForm.Group>
                  <Divider />
                </>
              )}

             <MyTextInput
              name="title"
              placeholder="*Event Title (required field)"
            />

            <MyTextArea
              rows={3}
              placeholder="*Event Details / Description (required field) DO NOT ENTER CUI IN THIS FIELD"
              name="description"
            />


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

           <Segment style={{backgroundColor: '#FFE4E1'}}>
            <SemanticForm.Group inline >
            <SemanticForm.Field style={{ paddingRight: "50px" }}>
            <Image  src={`${process.env.PUBLIC_URL}/assets/teams.svg`}  size='tiny' floated="left"/>
            </SemanticForm.Field>
            <SemanticForm.Field>
             Create and Manage a Microsoft Teams Meeting:
            </SemanticForm.Field>
            <SemanticForm.Field>
            <TeamsButtonEDU 
                    attendees={attendees}
                    setAttendees={updateAttendees}
                    setTeamMeeting={updateMakeTeamMeeting}
                    makeTeamMeeting = {makeTeamMeeting}
                    teamLink = {activity.teamLink}
                    teamLookup = {activity.teamLookup}
                    teamIsDeleted = {teamIsDeleted}
                    deleteTeamMeeting = {deleteTeamMeeting}
                    teamAttendeesLoading = {teamAttendeesLoading}
                    manageSeries={manageSeries}
                    id={id}
                  />
            </SemanticForm.Field>
            <SemanticForm.Field>
              <TeamsButtonArmy
               allDayEvent={values.allDayEvent}
               start={values.start}
               end={values.end}
               title={values.title}
               armyTeamLink={armyTeamLink}
               updateArmyTeamLink={updateArmyTeamLink}
               recurrenceInd={recurrenceInd}
               />
            </SemanticForm.Field>
            <SemanticForm.Field>
              Use the Edu and Army Teams Meeting buttons to create, associate, and manage Microsoft Teams Meetings
            </SemanticForm.Field>
            </SemanticForm.Group>                               
          </Segment>


         
            <LocationRadioButtons
              roomRequired={roomRequired}
              showRoomWizard={showRoomWizard}
              setRoomRequired={handleSetRoomRequired}
              setShowRoomWizard={handleSetShowRoomWizard}
            />

            {showRoomWizard &&
            <SelectRoomWizard
            roomOptionRegistryId={roomOptionRegistryId}
            lockDateInput={lockDateInput}
            setRoomEmails={handleSetRoomEmails}
            roomEmails={roomEmails}
            setShowRoomWizard={setShowRoomWizard}
            closeSelectRoomWizard={handleCloseSelectRoomWizard}
             />
            }


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

          
                <Segment color="purple"   style={{
      position: (roomRequired && !showRoomWizard) ? "static" : "absolute",
      zIndex: (roomRequired && !showRoomWizard) ? "auto" : -1,
      opacity: (roomRequired && !showRoomWizard) ? 1 : 0,
    }}>
                  <Header as="h5" textAlign="center">
                    <FontAwesomeIcon
                      icon={faPeopleRoof}
                      size="2x"
                      style={{ marginRight: "10px" }}
                      color="purple"
                    />
                    <span style={{ color: "purple" }} id="noRoomErrorAnchor">Book a Room</span>
                                {noRoomError && (
                                  <p>
                                    <Label basic color="red">
                                      Pick at least one Room. (If rooms are still loading please wait)
                                    </Label>
                                  </p>
                                )}
                  </Header>
                  <RoomPicker
                    id={id}
                    start={values.start}
                    end={values.end}
                    setRoomEmails={handleSetRoomEmails}
                    roomEmails={roomEmails}
                    recurrenceInd={recurrenceInd}
                    recurrence={recurrence}
                    unlockDateInput={setlockDateInputUnlocked}
                    lockDateInput={setLockDateInputLocked}
                    roomRequired={roomRequired}
                    roomOptionRegistryId={roomOptionRegistryId}
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
                    .includes("Bliss") && (
                    <>
                      <Grid>
                        <Grid.Row>
                          <Grid.Column width={3}>
                            <strong>Bliss Auditorium Support:</strong>
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
                        placeholder="You have selected the Bliss Auditorium and you "
                        name="blissHallAVSptRequired"
                        label="Bliss Auditorium A/V Spt Required:"
                      />
                    </>
                  )}
                  {graphRooms
                    .filter((obj) => roomEmails.includes(obj.emailAddress))
                    .map((x) => x.displayName)
                    .join(",")
                    .includes("VTC") && (
                      <Segment style={{backgroundColor: '#F5EAF2'}}>
                    <MyCheckBox
                      name="vtc"
                      label="SVTC: (allow 30 minute set up time)"
                    />
                    </ Segment>
                  )}

                  {graphRooms
                    .filter((obj) => roomEmails.includes(obj.emailAddress))
                    .map((x) => x.displayName)
                    .join(",")
                    .includes("VTC") &&
                    values.vtc && (
                      <Segment style={{backgroundColor: '#F5EAF2'}}>
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
                          label="SVTC Classification: (If you don't know the SVTC type leave this field blank)"
                        />

                        <MyTextInput
                          name="distantTechPhoneNumber"
                          placeholder="Distant Tech Phone Number"
                          label="Distant Tech Phone Number be provided:"
                        />
                          <p><i id="distantTechAnchor">Distant Tech Phone Number MUST be provided</i></p>
                                {distantTechError && (
                                  <p>
                                    <Label basic color="red">
                                      Enter a Distant Tech Phone Number
                                    </Label>
                                  </p>
                                )}

                        <MyTextInput
                          name="requestorPOCContactInfo"
                          placeholder="Enter Name, Phone #"
                          label="Requestor POC Contact Info:"
                        />

                        <MyTextInput
                          name="dialInNumber"
                          placeholder="Dial-In Number"
                          label="Dial-In Number: (to be entered by SVTC Tech if applicable, DO NOT ENTER SIPRNET IP)"
                        />

                        <MyTextInput
                          name="siteIDDistantEnd"
                          placeholder="Site-ID Distant End"
                          label="Site-ID Distant End: (to be entered by SVTC Tech if applicable, DO NOT ENTER SIPRNET IP)"
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
                          placeholder="Additional SVTC Info"
                          name="additionalVTCInfo"
                          label="Additional SVTC Info: (Display presentation across svtc - MUST attach presentation (e.g. Powerpoint, Word, PDF)"
                        />
                        {id && id.length > 0 && (
                          <MySelectInput
                            options={[
                              { text: "", value: "" },
                              { text: "Tentative", value: "Tentative" },
                              { text: "Confirmed", value: "Confirmed" },
                              { text: "Cancelled", value: "Cancelled" },
                            ]}
                            placeholder="SVTC Status"
                            name="vtcStatus"
                            label="SVTC Status: (for SVTC Coordinators ONLY)"
                          />
                        )}
                      </Segment>
                    )}

                  <hr color="purple" />
                </Segment>
           



            <Segment color="orange" inverted>
              <Grid>
                <Grid.Row>
                  
                  <Grid.Column width={2}>
                    <div style={{ paddingTop: "10px" }} />
                    <Button icon inverted color='blue' size='tiny' circular
                    type="button"
                    onClick={() =>
                      openModal(
                        <SubCalendarInformation/>, 'large'
                      )
                    }
                    >
                      <Icon name='info' />
                    </Button>
                    <span> Sub Calendar: </span>
                  
                  </Grid.Column>
                  
                  <Grid.Column width={13}>
                 
                  {activity.copiedTocio && !cioEventPlanningAdmin ? (
  <div>CIO Event Planning Calendar</div>
) : (
  <MySelectInput
    options={categoryOptions
      .filter((x: any) => {
        if (x.text === "Student Calendar Academic Year 2023" || x.text === "Staff Calendar") {
          return false;
        }
        if (x.text === "CIO Event Planning Calendar" && !cioEventPlanningAdmin) {
          return false;
        }
        return true;
      })
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
)}
                     <p><i id="subCalendarAnchor">A sub calendar is required for the event to appear on an installation calendar</i></p>
                                {subCalendarError && (
                                  <p>
                                    <Label basic color="red">
                                      You must enter a sub calendar if you are not reserving a room
                                    </Label>
                                  </p>
                                )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>

            {!studentCalendarAdmin && !memberOfExecServices
             &&  categories.find((x) => x.id === values.categoryId)?.name ==="Student Calendar" &&
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF3',
    color: '#9F6000',
    padding: '1em',
    borderRadius: '5px',
    margin: '1em',
    border: '1px solid #9F6000',
  }}>
    <h2>You are not authorized to create or update a Student Calendar Event</h2>
    <p>You do not have the necessary permissions to save events to the "Student Calendar".</p>
    {activity.id && activity.categoryId && categories.find((x) => x.id === values.categoryId)?.name ==="Student Calendar" &&
    <Button basic color='blue'
    as={Link} to={`${process.env.PUBLIC_URL}/addToCalendars/${activity.id}/${activity.categoryId}`}
    >I would like to add this event to an EEM Calendar </Button>
    }
  </div>
}


{(categories.find((x) => x.id === values.categoryId)?.name ==="Symposium and Conferences Calendar" || values.copiedTosymposiumAndConferences) &&
   <Segment style={{ backgroundColor: "#e1e9b7" }} >
      <Header as="h5" icon textAlign="center" color="brown">
      <Icon name="group" />
                  <Header.Content>Symposium and Conferences</Header.Content>          
      </Header>
      <Grid>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>Does this event have a registration link?:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox name="symposiumLinkInd" />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />
                {values.symposiumLinkInd && 
                <>
                <MyTextInput
                name="symposiumLink"
                placeholder="https://"
                label="Enter Registration URL"
              />
              <p><i id="noRegistrationSiteErrorAnchor">A Registration link MUST be provided</i></p>
              {noRegistrationSiteError && (
                <p>
                  <Label basic color="red">
                  You have checked there is a registration link, please enter a Registration URL 
                  </Label>
                </p>
              )}
              </>
                }
   </Segment>
}

{(categories.find((x) => x.id === values.categoryId)?.name ==="International Fellows" || values.copiedTointernationalfellows ) &&
     <Segment style={{ backgroundColor: "#d7f5f3" }} >
     <Header as="h5" icon textAlign="center" color="green">
       <FontAwesomeIcon
         icon={faGlobeAmericas}
         size="2x"
         style={{ marginRight: "10px" }}
       />
       <Header.Content>International Fellows Information</Header.Content>
     </Header>
     <Divider />

     <Grid>
                        <Grid.Row>
                          <Grid.Column width={3}>
                            <strong>Attendance is Mandatory:</strong>
                          </Grid.Column>
                          <Grid.Column width={13}>
                            <SemanticForm.Group inline>
                              <MySemanticCheckBox name="studentCalendarMandatory" />
                            </SemanticForm.Group>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                      <Divider />
      
                  <MyTextInput name="studentCalendarPresenter" placeholder="Presenter" label="Presenter:" />
                 
                 <MyTextAreaWithTypeahead
                   rows={3}
                   placeholder="Uniform: "
                   name="studentCalendarUniform"
                   label="Uniform:"
                   options={['',
                    'Uniform Required: Special Event--Class A/Army Service Uniform (ASU) or comparable uniform for other services; Civilians: Traditional Business--gentlemen: matching suit, dress shirt, tie and leather dress shoes; ladies: suit or jacket with coordinating skirt/slacks or a dress, and dress shoes.',
                    'Service Dress (Class B)--Military: Class B/Army Service Uniform (ASU) (rank and name plate required, no jacket, tie required if wearing long sleeve shirt/no tie with short sleeve shirt) or comparable uniform for other services; Civilians: Business--gentlemen: sports jacket with dress slacks, dress shirt, and no tie, and leather dress shoes;ladies: jacket or business top with skirt or slacks or a dress, and dress shoes.',
                    'Smart Business: gentlemen: sports jacket with dress slacks, dress shirt and tie, and leather dress shoes; ladies: jacket with skirt or slacks or a dress, and dress shoes. Or Class B/ASU or comparable attire for other services is an authorized equivalent standard of dress. Tuesday is "tieless Tuesday" no tie is required with suit.',
                    'Business Casual: gentlemen: slacks, dress shirt or collared polo shirt/buttoned shirt and/or sweater, leather shoes, boat shoes, or loafers (no sneakers); ladies: skirt or slacks with top or casual dress and casual shoes. Class B/ASU or comparable attire for other services is an authorized equivalent standard of dress.',
                    'Combat and Functional: Military--Army Combat Uniform or comparable attire for other services (flight suits authorized); Civilians: Business Casual--gentlemen: slacks, dress shirt or collared polo shirt/buttoned shirt, and/or sweater, leather shoes, boat shoes, or loafers (no sneakers); ladies: skirt or slacks with top or casual dress, and casual shoes.',
                    'Bliss Auditorium, random seating.',
                    'Seminar Rooms, Root Hall. ',
                    'Bliss Auditorium, assigned seating by seminar.',
                    'Wil Washcoe Auditorium (WWA).',
                    'Attendance voluntary.',
                    'Spouses invited to attend, the name tag must be displayed.',
                    'Meet in accordance with instructions in Electives syllabi and previously issued course and classroom assignment instructions.',
                  ]}
                 />


         

                   <MyTextArea
                      rows={3}
                      placeholder="Notes: "
                      name="studentCalendarNotes"
                      label="Notes:"
                    />
     </Segment>
}


            {(categories.find((x) => x.id === values.categoryId)?.name ==="Student Calendar" || values.copiedTostudentCalendar ) &&
               studentCalendarAdmin  &&
               <Segment style={{ backgroundColor: "#f4e9f7" }} >
                   <Header as="h5" icon textAlign="center" color="purple">
                  <Icon name="graduation cap" />
                  <Header.Content>Student Calendar</Header.Content>               
                </Header>
  
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>
                <Segment.Group horizontal>
                  <Segment style={{ backgroundColor: "#f4e9f7" }}>
                    <strong>Student Type:</strong>
                  </Segment>
                  <Segment style={{ backgroundColor: "#f4e9f7" }}>
                    <MySemanticCheckBox
                      name="studentCalendarResident"
                      label="Resident"
                    />
                      {(values.studentCalendarResident || values.studentCalendarMandatory) && 
                    <div>
                       <MySemanticCheckBox
                      name="studentCalendarMandatory"
                      label="Attendance is Mandatory"
                    />
                    </div>
                     }
                    </Segment>
                    <Segment style={{ backgroundColor: "#f4e9f7" }}>
                    <MySemanticCheckBox
                      name="studentCalendarDistanceGroup1"
                      label="DEP 2024"
                    />
                      {values.studentCalendarDistanceGroup1 && 
                    <div>
                       <MySemanticCheckBox
                      name="studentCalendarDistanceGroup1Mandatory"
                      label="Attendance is Mandatory"
                    />
                    </div>
                     }
                    </Segment>
                    <Segment style={{ backgroundColor: "#f4e9f7" }}>
                    <MySemanticCheckBox
                      name="studentCalendarDistanceGroup2"
                      label="DEP 2025"
                    />
                      {values.studentCalendarDistanceGroup2 && 
                    <div>
                       <MySemanticCheckBox
                      name="studentCalendarDistanceGroup2Mandatory"
                      label="Attendance is Mandatory"
                    />
                    </div>
                     }
                    </Segment>
                    <Segment style={{ backgroundColor: "#f4e9f7" }}>
                    <MySemanticCheckBox
                      name="studentCalendarDistanceGroup3"
                      label="DEP 2026"
                    />
                      {values.studentCalendarDistanceGroup3 && 
                    <div>
                       <MySemanticCheckBox
                      name="studentCalendarDistanceGroup3Mandatory"
                      label="Attendance is Mandatory"
                    />
                    </div>
                     }
                    </Segment>
                  </Segment.Group>
                  </Grid.Column>
                  </Grid.Row>
                </Grid>
             
                <Divider />

      
                  <MyTextInput name="studentCalendarPresenter" placeholder="Presenter" label="Presenter:" />
                 
                 <MyTextAreaWithTypeahead
                   rows={3}
                   placeholder="Uniform: "
                   name="studentCalendarUniform"
                   label="Uniform:"
                   options={['',
                    'Uniform Required: Special Event--Class A/Army Service Uniform (ASU) or comparable uniform for other services; Civilians: Traditional Business--gentlemen: matching suit, dress shirt, tie and leather dress shoes; ladies: suit or jacket with coordinating skirt/slacks or a dress, and dress shoes.',
                    'Service Dress (Class B)--Military: Class B/Army Service Uniform (ASU) (rank and name plate required, no jacket, tie required if wearing long sleeve shirt/no tie with short sleeve shirt) or comparable uniform for other services; Civilians: Business--gentlemen: sports jacket with dress slacks, dress shirt, and no tie, and leather dress shoes;ladies: jacket or business top with skirt or slacks or a dress, and dress shoes.',
                    'Smart Business: gentlemen: sports jacket with dress slacks, dress shirt and tie, and leather dress shoes; ladies: jacket with skirt or slacks or a dress, and dress shoes. Or Class B/ASU or comparable attire for other services is an authorized equivalent standard of dress. Tuesday is "tieless Tuesday" no tie is required with suit.',
                    'Business Casual: gentlemen: slacks, dress shirt or collared polo shirt/buttoned shirt and/or sweater, leather shoes, boat shoes, or loafers (no sneakers); ladies: skirt or slacks with top or casual dress and casual shoes. Class B/ASU or comparable attire for other services is an authorized equivalent standard of dress.',
                    'Combat and Functional: Military--Army Combat Uniform or comparable attire for other services (flight suits authorized); Civilians: Business Casual--gentlemen: slacks, dress shirt or collared polo shirt/buttoned shirt, and/or sweater, leather shoes, boat shoes, or loafers (no sneakers); ladies: skirt or slacks with top or casual dress, and casual shoes.',
                    'Bliss Auditorium, random seating.',
                    'Seminar Rooms, Root Hall. ',
                    'Bliss Auditorium, assigned seating by seminar.',
                    'Wil Washcoe Auditorium (WWA).',
                    'Attendance voluntary.',
                    'Spouses invited to attend, the name tag must be displayed.',
                    'Meet in accordance with instructions in Electives syllabi and previously issued course and classroom assignment instructions.',
                  ]}
                 />


         

                   <MyTextArea
                      rows={3}
                      placeholder="Notes: "
                      name="studentCalendarNotes"
                      label="Notes:"
                    />
                  
               </Segment>
            }

          
            {categories.find((x) => x.id === values.categoryId)?.name ===
              "Garrison Calendar" && (
                <Segment style={{ backgroundColor: "#FFFCE9" }} >
                <Header as="h5" icon textAlign="center" color="orange">
                  <Icon name="building" />
                  <Header.Content>Garrison Information</Header.Content>
                </Header>

                <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "ACS", value: "ACS" },
                    { text: "Command", value: "Command" },
                    { text: "Chapel", value: "Chapel" },
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
                <Segment style={{ backgroundColor: "#98FFFE" }} >
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
              <Segment style={{backgroundColor: '#FFF2D7'}}>
                <Header as="h5" icon textAlign="center" color="pink">
                  <FontAwesomeIcon
                    icon={faBookOpenReader}
                    size="2x"
                    style={{ marginRight: "10px" }}
                  />
                  <Header.Content>
                    USAHEC Usage Information
                  </Header.Content>
                </Header>
                <MySelectInput

                  options={[
                    { text: "", value: "" },
                    {
                      text: "AHEC",
                      value: "AHEC",
                    },
                    { text: "AHCF", value: "AHCF" },
                    { text: "Holiday", value: "Holiday" },
                    { text: "Government", value: "Government" },
                    { text: "Holiday", value: "Holiday" },
                    { text: "Public Event", value: "Public Event" },
                    { text: "Billable Event", value: "Billable Event" },
                    { text: "AWC/CBKS Tenant", value: "AWC/CBKS Tenant" },
                    { text: "AHEC Highlight", value: "AHEC Highlight" },
                    { text: "AWC Event", value: "AWC Event" },
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
              <Segment style={{backgroundColor: '#F9ECFE'}}>
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
                <Segment style={{ backgroundColor: "#E8FBFF" }} >
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
                    { text: "SVTC", value: "VTC" },
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
                          label="SVTC (3 day notice)"
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
              "International Fellows",
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
                            label="Faculty Calendar"
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
                              <MySemanticCheckBox
                            name="copiedTocio"
                            label="CIO Event Planning Calendar"
                            disabled={!cioEventPlanningAdmin || categories
                              .filter((x) => x.routeName === "cio")
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
                            label="Military Spouse and Family Program"
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
                            label="SSL Admin Calendar"
                            disabled={categories
                              .filter((x) => x.routeName === "ssl")
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
                            name="copiedTousahecFacilitiesUsage"
                            label="USAHEC Calendar"
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

                         <MySemanticCheckBox
                            name="copiedTostudentCalendar"
                            label="Student Calendar"
                            disabled={!studentCalendarAdmin || categories
                              .filter((x) => x.routeName === "studentCalendar")
                              .map((x) => x.id)
                              .includes(currentCategoryId)}
                          />

                         <MySemanticCheckBox
                            name="copiedTointernationalfellows"
                            label="International Fellows"
                            disabled={categories
                              .filter((x) => x.routeName === "internationalfellows")
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

{values.copiedTocio && (
                <Segment style={{ backgroundColor: "#ECDEC9", display: cioEventPlanningAdmin ? 'block' : 'none'  }} >
                      <Header as="h5" icon textAlign="center" color="brown">
                      <Icon name="users" />
                      <Header.Content>CIO Event Planning Information</Header.Content>
                      </Header>
                      {cioEventPlanningAdmin &&  <MyTextInput name="eventPlanningPAX" placeholder="0" label="PAX:"  />}
                      {!cioEventPlanningAdmin && <p> <strong> PAX: </strong> {activity.eventPlanningPAX}</p>  }
                      {cioEventPlanningAdmin && <MyTextInput name="eventPlanningExternalEventPOCName" placeholder="" label="External Event POC Name:" />}
                      {!cioEventPlanningAdmin && <p> <strong> External Event POC Name: </strong> {activity.eventPlanningExternalEventPOCName}</p>  }
                      {cioEventPlanningAdmin && <MyTextInput name="eventPlanningExternalEventPOCEmail" placeholder="" label="External Event POC Email:" />}
                      {!cioEventPlanningAdmin && <p> <strong> External Event POC Email: </strong> {activity.eventPlanningExternalEventPOCEmail}</p>  }
                      {cioEventPlanningAdmin && <MyTextArea  rows={3} placeholder="" name="eventPlanningExternalEventPOCContactInfo" label="External POC Contact Info:"/> }
                      {!cioEventPlanningAdmin && <p> <strong> External POC Contact Info: </strong> {activity.eventPlanningExternalEventPOCContactInfo}</p>  }
                      {cioEventPlanningAdmin &&
                      <>
               <Divider />
               <Grid>
                  <Grid.Row>
                    <Grid.Column width={2}>
                     <strong>Email Notification: </strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline>
                        <MySemanticCheckBox
                          name="eventPlanningNotifyPOC"
                          label="Notify The POC"
                        />
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>

                <Divider />
                </>
                      }
                {cioEventPlanningAdmin &&
                  <MySelectInput
                  options={[
                    { text: "", value: "" },
                    { text: "Pending", value: "Pending" },
                    { text: "Ready", value: "Ready" },
                    { text: "Closed", value: "Closed" },
                   
                  ]}
                  placeholder="Pending"
                  name="eventPlanningStatus"
                  label="Status:"
                />}

                 {!cioEventPlanningAdmin && <p> <strong> Status: </strong> {activity.eventPlanningStatus || 'Pending'}</p>  }

<Divider horizontal >
      Resources
    </Divider>
                <Grid>
                  <Grid.Row columns={3}>
                    <Grid.Column>
                    {cioEventPlanningAdmin && <MyTextInput name="eventPlanningNumOfPC" placeholder="0" label="Num Of PCs:" /> }
                    {!cioEventPlanningAdmin && <p> <strong> Num of PCs: </strong> {activity.eventPlanningNumOfPC || '0'} </p>  }
                    </Grid.Column>
                    <Grid.Column>
                    {cioEventPlanningAdmin && <MyTextInput name="eventPlanningNumOfBYADS" placeholder="0" label="Num Of BYADs (Bring Your Own Device):" /> }
                    {!cioEventPlanningAdmin && <p> <strong> Num Of BYADs (Bring Your Own Device): </strong> {activity.eventPlanningNumOfBYADS || '0'} </p>  }
                    </Grid.Column>
                    <Grid.Column>
                    {cioEventPlanningAdmin && <MyTextInput name="eventPlanningNumOfVOIPs" placeholder="0" label="Num Of VOIP / VOSIP / Conf Phone:" /> }
                    {!cioEventPlanningAdmin && <p> <strong> Num Of VOIP / VOSIP / Conf Phone: </strong> {activity.eventPlanningNumOfVOIPs || '0'} </p>  }
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={3}>
                  <Grid.Column>
                  {cioEventPlanningAdmin && <MyTextInput name="eventPlanningNumOfPrinters" placeholder="0" label="Num Of Printers / Copiers:" /> }
                  {!cioEventPlanningAdmin && <p> <strong> Num Of Printers / Copiers: </strong> {activity.eventPlanningNumOfPrinters || '0'} </p>  }
                    </Grid.Column> 
                    <Grid.Column>
                    {cioEventPlanningAdmin &&<MyTextInput name="eventPlanningNumOfPeripherals" placeholder="0" label="Num Of Peripherals (Cameras / Other / Docking Stations):" />}
                    {!cioEventPlanningAdmin && <p> <strong> Num Of Peripherals (Cameras / Other / Docking Stations): </strong> {activity.eventPlanningNumOfPeripherals || '0'} </p>  }
                    </Grid.Column>                               
                    <Grid.Column>
                    {cioEventPlanningAdmin && <MyTextInput name="eventPlanningNumOfMonitors" placeholder="0" label="Num Of Monitors / Projectors:" /> }
                    {!cioEventPlanningAdmin && <p> <strong> Num Of Monitors / Projectors: </strong> {activity.eventPlanningNumOfMonitors || '0'} </p>  }
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                     <Divider />

                     {cioEventPlanningAdmin && <MyDateInput
                          timeIntervals={15}
                          placeholderText="Date / Time CIO Reps Should Start Setting Up"
                          name="eventPlanningSetUpDate"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          title="Date / Time CIO Reps Should Start Setting Up:"
                          minDate={new Date()}
                        />}
                         {!cioEventPlanningAdmin && !activity.eventPlanningSetUpDate && <p> <strong> Date / Time CIO Reps Should Start Setting Up: </strong> </p>  }
                         {!cioEventPlanningAdmin && activity.eventPlanningSetUpDate && <p> <strong> Date / Time CIO Reps Should Start Setting Up: </strong>  {format(activity.eventPlanningSetUpDate, 'MMMM d, yyyy h:mm aa')} </p>  }
                         {!cioEventPlanningAdmin && <Divider />}
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>BYOD / BYAD:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline>
                      {cioEventPlanningAdmin &&
                        <MySemanticCheckBox
                          name="eventPlanningGovLaptops"
                          label="Government Laptops"
                        />}
                        {!cioEventPlanningAdmin && activity.eventPlanningGovLaptops && <span>Government Laptops &nbsp;&nbsp; </span>}
                        {cioEventPlanningAdmin &&<MySemanticCheckBox
                          name="eventPlanningPersonalLaptops"
                          label="Personal Laptops"
                        />}
                           {!cioEventPlanningAdmin && activity.eventPlanningPersonalLaptops && <span>Personal Laptops &nbsp;&nbsp; </span>}
                           {cioEventPlanningAdmin &&<MySemanticCheckBox
                          name="eventPlanningTablets"
                          label="Tablets"
                        />}
                         {!cioEventPlanningAdmin && activity.eventPlanningTablets && <span>Tablets &nbsp;&nbsp; </span>}
                         {cioEventPlanningAdmin &&<MySemanticCheckBox
                          name="eventPlanningServers"
                          label="Servers"
                        /> }
                         {!cioEventPlanningAdmin && activity.eventPlanningServers && <span>Servers &nbsp;&nbsp; </span>}
                         {cioEventPlanningAdmin && <MySemanticCheckBox
                          name="eventPlanningCellPhones"
                          label="Cell Phones"
                        />}
                        {!cioEventPlanningAdmin && activity.eventPlanningCellPhones && <span>Cell Phones &nbsp;&nbsp; </span>}
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider />

                <Grid>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>Networks:</strong>
                    </Grid.Column>
                    <Grid.Column width={14}>
                      <SemanticForm.Group inline>
                      {cioEventPlanningAdmin &&
                        <MySemanticCheckBox
                          name="eventPlanningNetworkREN"
                          label="REN"
                        />}
                          {!cioEventPlanningAdmin && activity.eventPlanningNetworkREN && <span>REN &nbsp;&nbsp; </span>}
                          {cioEventPlanningAdmin &&
                        <MySemanticCheckBox
                          name="eventPlanningNetworkWireless"
                          label="Wireless"
                        />}
                         {!cioEventPlanningAdmin && activity.eventPlanningNetworkWireless && <span>Wireless &nbsp;&nbsp; </span>}
                         {cioEventPlanningAdmin &&
                        <MySemanticCheckBox
                          name="eventPlanningNetworkNTG"
                          label="NTG"
                        />}
                         {!cioEventPlanningAdmin && activity.eventPlanningNetworkNTG && <span>NTG &nbsp;&nbsp; </span>}
                         {cioEventPlanningAdmin &&
                        <MySemanticCheckBox
                          name="eventPlanningNetworkNTS"
                          label="NTS"
                        />}
                          {!cioEventPlanningAdmin && activity.eventPlanningNetworkNTS && <span>NTS &nbsp;&nbsp; </span>}
                          {cioEventPlanningAdmin &&
                        <MySemanticCheckBox
                          name="eventPlanningNetworkSIPR"
                          label="SIPR"
                        />}
                          {!cioEventPlanningAdmin && activity.eventPlanningNetworkSIPR && <span>SIPR &nbsp;&nbsp; </span>}
                          {cioEventPlanningAdmin &&
                        <MySemanticCheckBox
                          name="eventPlanningNetworkNIPR"
                          label="NIPR"
                        />}
                          {!cioEventPlanningAdmin && activity.eventPlanningNetworkNIPR && <span>NIPR &nbsp;&nbsp; </span>}
                      </SemanticForm.Group>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>

                </Segment>
            )}


            {(values.communityEvent || values.mfp || values.copiedTocommunity ||  ["Community Event (External)"].includes(
                categories.find((x) => x.id === values.categoryId)?.name || ""
              )) && (
              <Segment inverted color="red">
                <Header as={'h2'} content='You have selected Community Event and / or Military Spouse and Family Program so you must review the event details for OPSEC and PII. check box below when complete'/>
                <MyCheckBox
                  name="checkedForOpsec"
                />
                    <Button icon inverted  
                    type="button"
                    onClick={() =>
                      openModal(
                        <CUIWarningModal handleCUIWarningHasBeenDisplayed={handleCUIWarningHasBeenDisplayed} showHeader={false} cuiButtonClicked={true} opsecButtonClicked={false}/>, 'large'
                      )
                    }
                    >
                      Show More Information about CUI
                    </Button>
                    <Button icon inverted 
                    type="button"
                    onClick={() =>
                      openModal(
                        <CUIWarningModal handleCUIWarningHasBeenDisplayed={handleCUIWarningHasBeenDisplayed} showHeader={false} cuiButtonClicked={false} opsecButtonClicked={true}/>, 'large'
                      )
                    }
                    >
                      Show OPSEC Guidelines for USAWC Calendar Addition
                    </Button>
              </Segment>
            )}

            {(values.mfp ||
              ["Military Spouse and Family Program"].includes(
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
                label="Educational Category for MSFP:"
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
              {!roomEmails.includes('Bldg650CollinsHallB037SVTC@armywarcollege.edu') &&
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
                }
                {roomEmails.includes('Bldg650CollinsHallB037SVTC@armywarcollege.edu') &&
                 <FormInput value='Secret' label='Event Clearance Level:' readonly/>   
                }
            </SemanticForm.Group>

            <Divider />
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>
                <Segment.Group horizontal>
                  <Segment>
                    <strong>Request Presence:</strong>
                  </Segment>
                  <Segment>
                    <MySemanticCheckBox
                      name="commandantRequested"
                      label="Commandant"
                    />
                    {values.commandantRequested && 
                    <div>
                    <MyDateInput
                          timeIntervals={15}
                          placeholderText="Commandant Start Time"
                          name="commandantStart"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                           <MyDateInput
                          timeIntervals={15}
                          placeholderText="Commandant End Time"
                          name="commandantEnd"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                    </div>
                    }
                    </Segment>
                    <Segment>
                    <MySemanticCheckBox name="dptCmdtRequested" label="DCOM" />
                    {values.dptCmdtRequested && 
                    <div>
                    <MyDateInput
                          timeIntervals={15}
                          placeholderText="DCOM Start Time"
                          name="dptCmdtStart"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                           <MyDateInput
                          timeIntervals={15}
                          placeholderText="DCOM End Time"
                          name="dptCmdtEnd"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                    </div>
                    }
                    </Segment>
                    <Segment>
                    <MySemanticCheckBox
                      name="provostRequested"
                      label="Provost"
                    />
                     {values.provostRequested && 
                    <div>
                    <MyDateInput
                          timeIntervals={15}
                          placeholderText="Provost Start Time"
                          name="provostStart"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                           <MyDateInput
                          timeIntervals={15}
                          placeholderText="Provost End Time"
                          name="provostEnd"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                    </div>
                    }
                    </Segment>
                    <Segment>
                    <MySemanticCheckBox name="cofsRequested" label="COS" />
                    {values.cofsRequested && 
                    <div>
                    <MyDateInput
                          timeIntervals={15}
                          placeholderText="COS Start Time"
                          name="cofsStart"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                           <MyDateInput
                          timeIntervals={15}
                          placeholderText="COS End Time"
                          name="cofsEnd"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                    </div>
                    }
                    </Segment>
                    <Segment>
                    <MySemanticCheckBox name="deanRequested" label="Dean" />
                    {values.deanRequested && 
                    <div>
                    <MyDateInput
                          timeIntervals={15}
                          placeholderText="Dean Start Time"
                          name="deanStart"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                           <MyDateInput
                          timeIntervals={15}
                          placeholderText="Dean End Time"
                          name="deanEnd"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                    </div>
                    }
                    </Segment>
                    <Segment>
                    <MySemanticCheckBox
                      name="ambassadorRequested"
                      label="AMB"
                    />
                      {values.ambassadorRequested && 
                    <div>
                    <MyDateInput
                          timeIntervals={15}
                          placeholderText="AMB Start Time"
                          name="ambassadorStart"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                           <MyDateInput
                          timeIntervals={15}
                          placeholderText="AMB End Time"
                          name="ambassadorEnd"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                    </div>
                    }
                     </Segment>
                     <Segment>
                    <MySemanticCheckBox name="csmRequested" label="CSM" />
                    {values.csmRequested && 
                    <div>
                    <MyDateInput
                          timeIntervals={15}
                          placeholderText="CSM Start Time"
                          name="csmStart"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                           <MyDateInput
                          timeIntervals={15}
                          placeholderText="CSM End Time"
                          name="csmEnd"
                          showTimeSelect
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                        />
                    </div>
                    }
                    </Segment>
                </Segment.Group>
            
                  <i id="noLeaderDateErrorAnchor">
                    Request the presence of the leader. (Sends an e-mail invite
                    to the leader's admin assistant.)
                  </i>
                  {noLeaderDateError && (
                                  <p>
                                    <Label basic color="red">
                                      Start and end times for the visit are required
                                    </Label>
                                  </p>
                                )}
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
                          label="Hosting Report - BG (O7) and Above or Civilian SES Equivalent"
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

                {values.report && values.report !== "none" && (
                  <Segment style={{backgroundColor: '#ECFFE9'}}>
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
                        placeholder="Uniform of Visitor"
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
                                  uploadDocument={handleBioDocumentUpload}
                                  loading={uploading}
                                  color={'black'}
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
                      <a href="https://www.ihg.com/armyhotels/hotels/us/en/carlisle/zyjia/hoteldetail?cm_mmc=PS-IHGArmy-G%20B-AMER-%5BUSA%5D-Army-Americas-%5BE%5D-PA%20-%20Carlisle%20Barracks-ihg%20army%20hotel%20carlisle%20barracks&gad=1&gclid=Cj0KCQjw0tKiBhC6ARIsAAOXutl1ZGsVHTCpJcbqW1V9_qV6HHRPPIqNiO1q_mQQxE90IaXogiRhjz0aAtSSEALw_wcB" target="_blank">
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
                          placeholder="Flag Details:  (Describe type of flags and where to set up  e.g. US Army flag, USAWC flag, 2 star flag in Bliss Auditorium, etc.)"
                          name="hostingReport.flagDetails"
                          label="Flag Details::  (Describe type of flags and where to set up.)"
                        />
                      </>
                    )}
                    {values.report === "Hosting Report" && (
                      <MyTextArea
                        rows={3}
                        placeholder="Official Gift Exchange or speaker gift only for those addressing the entire class
                        (Speakers who are Active-Duty General Officers or receiving an honorarium or are not authorized to receive mementos)"
                        name="hostingReport.gift"
                        label="Gift Requirement:"
                      />
                    )}
                    <Segment style={{backgroundColor: '#FFF9A6'}}>
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


                 {enlistedAidAdmin && 
                       <Grid>
                        <Grid.Row>
                          <Grid.Column width={3}>
                            <strong>Add this Event to the Enlisted Aide Management Calendar:</strong>
                          </Grid.Column>
                          <Grid.Column width={13}>
                            <SemanticForm.Group inline>
                              <MySemanticCheckBox name="enlistedAideEvent" />
                            </SemanticForm.Group>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                  }

                      {values.enlistedAideEvent && enlistedAidAdmin && (
                <Segment style={{ backgroundColor: "#f7f2e1" }} >
                <Header as="h5" icon textAlign="center" color="orange">
                  <Icon name="clipboard" />
                  <Header.Content>Enlisted Aide Event Information</Header.Content>
                </Header>

                <MyDataList
                      name="enlistedAideFundingType"
                      placeholder=""
                      label="Funding Type: (Pick from the list or type your own)"
                      dataListId="enlistedAideFundingType"
                      options={['GIFT','ORF']}
                    />
                  
                  <MyDataList
                      name="enlistedAideVenue"
                      placeholder=""
                      label="Venue: (Pick from the list or type your own)"
                      dataListId="enlistedAideVenue"
                      options={['AHEC','LVCC', 'Quarters 1', 'Root Hall']}
                    />

                   <MyTextInput name="enlistedAideGuestCount" placeholder="0" label = "Guest Count"/>

                   <MyDataList
                      name="enlistedAideCooking"
                      placeholder="Not Applicable"
                      label="Cooking: (Leave Blank for Not Applicable, Pick from the list, or type your own)"
                      dataListId="enlistedAideCooking"
                      options={["Buffet", "Hors d' oeuvres", "Plated Meal"]}
                    />

                  <MyTextInput name="enlistedAideDietaryRestrictions" placeholder="None Known" label = "Dietary Restrictions (Leave Blank for no dietary restrictions)"/>

                  
                  <MyDataList
                      name="enlistedAideAlcohol"
                      placeholder="No Alcohol Needed"
                      label="Alcohol: (Leave Blank for Not Applicable, Pick from the list, or type your own)"
                      dataListId="enlistedAideAlcohol"
                      options={["Open Bar", "Wine & Beer"]}
                    />

                 <Divider />
                   <Grid>
                        <Grid.Row>
                          <Grid.Column width={2}>
                            <strong>Set Up is Needed:</strong>
                          </Grid.Column>
                          <Grid.Column width={14}>
                            <SemanticForm.Group inline>
                              <MySemanticCheckBox name="enlistedAideSetup" />
                            </SemanticForm.Group>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    <Divider />
                      <MyTextArea
              label="Additional Remarks:"
              rows={3}
              placeholder=""
              name="enlistedAideAdditionalRemarks"
            />

                </Segment>

                )}


                    <Divider color="black" />
                          <Grid>
                            <Grid.Row>
                              <Grid.Column width={1}>
                                <strong>Attachments:</strong>
                              </Grid.Column>
                              <Grid.Column width={15}>
                              <ButtonGroup>
                              <Button animated='vertical'basic size='tiny' type='button'
                               onClick={() =>
                                openModal(
                                  <UploadAttachmentModal
                                  uploadDocument={handleActivityDocumentUpload}
                                  loading={uploading}
                                  color={'black'}
                                  activityAttachments = {activityAttachments}
                                  />, 'large'
                                )
                              }
                              >
                                <Button.Content hidden>Add File</Button.Content>
                                <Button.Content visible>
                                <Icon name='paperclip' size="large" />
                                </Button.Content>
                                </Button>
                                {activityAttachments.map((attachment) => (
                                    <ActivityAttachmentComponent key={attachment.id} attachmentActivityId = {attachment.id} fileName = {attachment.fileName} deleteActivityAttachment = {deleteActivityAttachment} />
                                 ))}
                                </ButtonGroup>
                            
                              </Grid.Column>
                            </Grid.Row>
                          </Grid>
                          <Divider color="black" />
            <Button
              disabled={submitting || 
                 (!studentCalendarAdmin && !memberOfExecServices && categories.find((x) => x.id === values.categoryId)?.name ==="Student Calendar")}
              loading={submitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              onClick={handleCancelClick}
              floated="right"
              type="button"
              content="Cancel"
            />
      
      {!studentCalendarAdmin &&  !memberOfExecServices  && categories.find((x) => x.id === values.categoryId)?.name ==="Student Calendar" &&
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF3',
    color: '#9F6000',
    padding: '1em',
    borderRadius: '5px',
    margin: '1em',
    border: '1px solid #9F6000',
  }}>
    <h2>You are not authorized!</h2>
    <p>You do not have the necessary permissions to save events to the "Student Calendar".</p>
    {activity.id && activity.categoryId && categories.find((x) => x.id === values.categoryId)?.name ==="Student Calendar" &&
    <Button basic color='blue'
    as={Link} to={`${process.env.PUBLIC_URL}/addToCalendars/${activity.id}/${activity.categoryId}`}
    >I would like to add this event to an EEM Calendar </Button>
    }
  </div>
}
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
