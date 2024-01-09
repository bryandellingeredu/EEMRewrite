import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faAndroid } from "@fortawesome/free-brands-svg-icons";
import { Header, Segment, Button, SegmentGroup, Icon} from "semantic-ui-react";
import CopyToClipboard from "./CopyToClipboard";
import { useStore } from "../../stores/store";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const faAndroidPropIcon = faAndroid as IconProp;



export default observer (function Android(){
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
    return(
       <>
        <Header as="h1" textAlign="center">
        <Header.Content>
        <FontAwesomeIcon icon={faAndroidPropIcon} size="2x" color="orange" style={{paddingRight: '10px'}} />
         Android iCal Subscription Instructions
          <Header.Subheader>  Subscribing to the {calendarName} will automatically sync any changes made to your Android Device's calendar and you will receive updates automatically.
       </Header.Subheader>
        </Header.Content>
      </Header>
      <Header as="h4" textAlign="center" >
              Copy the iCal feed Url: {`${icalUrl}/${user!.studentType.replace(/\s+/g, '')}`}
              <span style={{ marginLeft: '50px' }} />
                 <CopyToClipboard text={`${icalUrl}/${user!.studentType.replace(/\s+/g, '')}`} />
             </Header>
      <SegmentGroup>
        <Segment content='On your Android device, open the "Calendar" app'></Segment>
        <Segment content='Tap the "Menu" icon in the top left corner and select "Settings"'></Segment>
        <Segment content='Tap "Add Account" and select "Google"'></Segment>
        <Segment content='Enter your Google account credentials and sign in'></Segment>
        <Segment content='Once you are signed in, tap the "Menu" icon again and select "Calendar settings"'></Segment>
        <Segment content='Tap "Add calendar" and enter the iCal feed URL, then tap "Add calendar" again'></Segment>
        <Segment content='The calendar will now appear in the "Calendar" app on your Android device'></Segment>
        <Segment><Button basic color='orange'icon labelPosition='left' onClick={handleGoBack}>
                <Icon name='backward' />
                Back To Calendar
        </Button>
        </Segment>
      </SegmentGroup>
     </>
    )

})