import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Header, Segment, Button, SegmentGroup, Icon} from "semantic-ui-react";
import CopyToClipboard from "./CopyToClipboard";
import { useStore } from "../../stores/store";
import { observer } from "mobx-react-lite";

const faGooglePropIcon = faGoogle as IconProp;



export default observer(function Google(){
   const {
        navbarStore: {setPage, icalUrl, calendarName },
      } = useStore();

    const handleGoBack = () => setPage("calendar");
    return(
       <>
        <Header as="h1" textAlign="center">
        <Header.Content>
        <FontAwesomeIcon icon={faGooglePropIcon} size="2x" color="orange" style={{paddingRight: '10px'}} />
        Google Calendar iCal Subscription Instructions
          <Header.Subheader>  Subscribing to the {calendarName} will automatically sync any changes made to your Google Calendar and you will receive updates automatically.
       </Header.Subheader>
        </Header.Content>
      </Header>
   <Header as="h4" textAlign="center" >
              Copy the iCal feed Url: {icalUrl}
              <span style={{ marginLeft: '50px' }} />
                 <CopyToClipboard text={icalUrl} />
             </Header>
      <SegmentGroup>
        <Segment content='Go to Google Calendar on your computer'></Segment>
        <Segment content='On the left side of the screen, click the "Add calendar" button'></Segment>
        <Segment content='Tap "Add Account" and select "Google"'></Segment>
        <Segment content='Select "From URL'></Segment>
        <Segment content='Enter the iCal feed URL and click "Add Calendar'></Segment>
        <Segment content='The calendar will now appear in your Google Calendar on both your computer and mobile device'></Segment>
        <Segment><Button basic color='orange'icon labelPosition='left' onClick={handleGoBack}>
                <Icon name='backward' />
                Back To Calendar
        </Button>
        </Segment>
      </SegmentGroup>
     </>
    )

})