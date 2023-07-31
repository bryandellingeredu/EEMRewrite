import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faApple } from "@fortawesome/free-brands-svg-icons";
import { Header, Segment, Button, SegmentGroup, Icon} from "semantic-ui-react";
import CopyToClipboard from "./CopyToClipboard";
import { useStore } from "../../stores/store";
import { observer } from "mobx-react-lite";

const faApplePropIcon = faApple as IconProp;



export default observer (function Apple(){
    const {
        navbarStore: {setPage },
      } = useStore();
    const handleGoBack = () => setPage("calendar");
    return(
       <>
        <Header as="h1" textAlign="center">
        <Header.Content>
        <FontAwesomeIcon icon={faApplePropIcon} size="2x" color="orange" style={{paddingRight: '10px'}} />
         iPhone iCal Subscription Instructions
          <Header.Subheader>  Subscribing to the Student Calendar will automatically sync any changes made to your iPhone calendar and you will receive updates automatically.
       </Header.Subheader>
        </Header.Content>
      </Header>
      <Header as="h4" textAlign="center" >
              Copy the iCal feed Url:  https://apps.armywarcollege.edu/eem/api/SyncCalendar/studentCalendar
              <span style={{ marginLeft: '50px' }} />
                 <CopyToClipboard text={`https://apps.armywarcollege.edu/eem/api/SyncCalendar/studentCalendar` } />
             </Header>
      <SegmentGroup>
        <Segment content='On your iPhone, go to "Settings"'></Segment>
        <Segment content='Tap "Calendars" and then "Accounts'></Segment>
        <Segment content='Tap "Add Account" and then "Other"'></Segment>
        <Segment content='Tap "Add Subscribed Calendar" and enter the iCal feed URL'></Segment>
        <Segment content='Enter the iCal feed URL into the text field and click on "Add"'></Segment>
        <Segment content='Tap "Next" and then "Save"'></Segment>
        <Segment content='The calendar will now appear in the "Calendars" app on your iPhone'></Segment>
        <Segment><Button basic color='orange'icon labelPosition='left' onClick={handleGoBack}>
                <Icon name='backward' />
                Back To Calendar
        </Button>
        </Segment>
      </SegmentGroup>
     </>
    )

})