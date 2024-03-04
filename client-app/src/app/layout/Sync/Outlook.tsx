import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faWindows } from "@fortawesome/free-brands-svg-icons";
import { Header, Segment, Button, SegmentGroup, Icon} from "semantic-ui-react";
import CopyToClipboard from "./CopyToClipboard";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores/store";
import { useEffect } from "react";

const faWindowsPropIcon = faWindows as IconProp;



export default observer(function Outlook(){
  const {
    navbarStore: {setPage, icalUrl, calendarName },
    userStore: {user, setStudentType}
  } = useStore();

  useEffect(() => {
    if (user) {
      if (!user.studentType)  setStudentType(user.userName);
    }
  }, [user, user?.studentType]);

    const handleGoBack = () => setPage("calendar");
    const videoUrl = `${process.env.PUBLIC_URL}/assets/videos/SyncToOutlook.mp4`;
    return(
       <>
        <Header as="h1" textAlign="center">
        <Header.Content>
        <FontAwesomeIcon icon={faWindowsPropIcon} size="2x" color="orange" style={{paddingRight: '10px'}} />
         Outlook iCal Subscription Instructions
          <Header.Subheader>  Subscribing to the {calendarName} will automatically sync any changes made to your outlook calendar and you will receive updates automatically.
       </Header.Subheader>
        </Header.Content>
      </Header>
      <Header as="h4" textAlign="center" >
              Copy the iCal feed Url: {`${icalUrl}/${user!.studentType.replace(/\s+/g, '')}`}
              <span style={{ marginLeft: '50px' }} />
                 <CopyToClipboard text={`${icalUrl}/${user!.studentType.replace(/\s+/g, '')}`} />
             </Header>
      <SegmentGroup>
        <Segment content='Open Microsoft Outlook In a browser. DO NOT use a client.'></Segment>
        <Segment>
        To Open Edu Outlook go to <a href="https://office.com" target="_blank">https://office.com</a> and sign in with your Edu Account. 
        </Segment>
        <Segment>
        To Open Army .Mil Outlook go to <a href="https://webmail.apps.mil/calendar/view/month" target="_blank">https://webmail.apps.mil/calendar/view/month</a>  and sign in with your CAC. 
        </Segment>
        <Segment content='Click add Calendar on the left hand side of screen.'></Segment>
        <Segment content='Click Subscribe from web.'></Segment>
        <Segment content='Paste the url you copied from the EEM.'></Segment>
        <Segment content='Give Your Calendar a Name, Pick a Color and Charm if you Like and pick where to Add it to My Calendars, or Other Calendars.'></Segment>
        <Segment content='Click the Import Button.  after several seconds your calendar will be imported.'></Segment>
        <Segment>
        Watch the tutorial video: <a href={videoUrl} target="_blank" rel="noopener noreferrer">How to Sync to Outlook</a>.
        </Segment>
        <Segment><Button basic color='orange'icon labelPosition='left' onClick={handleGoBack}>
                <Icon name='backward' />
                Back To Calendar
        </Button>
        </Segment>
      </SegmentGroup>
     </>
    )

})