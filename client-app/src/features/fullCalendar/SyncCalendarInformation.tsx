import { Button, Divider, Form, Header, Icon, Input, Label, List, Message, Segment, Tab } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import {useEffect, useState} from 'react';
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faWindows } from "@fortawesome/free-brands-svg-icons";
import { faApple } from "@fortawesome/free-brands-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faAndroid } from "@fortawesome/free-brands-svg-icons";
import CopyToClipboard from "./copyToClipboard";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import { observer } from "mobx-react-lite";
import LoadingComponent from "../../app/layout/LoadingComponent";

const faWindowsPropIcon = faWindows as IconProp;
const faApplePropIcon = faApple as IconProp;
const faGooglePropIcon = faGoogle as IconProp;
const faAndroidPropIcon = faAndroid as IconProp;


interface Props {
    routeName: string
    showSyncInfo: boolean
}

interface Dictionary {
    routeName: string;
    title: string;
}


const cases = [
      { routeName: "academic", title: "Academic Calendar" },
      { routeName: "asep", title: "ASEP Calendar" },
      { routeName: "commandGroup", title: "Command Group Calendar" },
      { routeName: "community", title: "Community Calendar" },
      { routeName: "csl", title: "CSL Calendar" },
      { routeName: "garrison", title: "Garrison Calendar" },
      { routeName: "internationalfellows", title: "International Fellows" },
      { routeName: "GeneralInterest", title: "General Interest" },
      { routeName: "holiday", title: "Holiday Calendar" },
      { routeName: "pksoi", title: "PKSOI Calendar" },
      { routeName: "socialEventsAndCeremonies", title: "Social Events and Ceremonies" },
      { routeName: "usahec", title: "USAHEC Calendar" },
      { routeName: "ssiAndUsawcPress", title: "SSI and USAWC Press Calendar" },
      { routeName: "ssl", title: "SSL Calendar" },
      { routeName: "trainingAndMiscEvents", title: "Training and Misc. Events Calendar" },
      { routeName: "usahecFacilitiesUsage", title: "USAHEC Facilities Usage Calendar" },
      { routeName: "visitsAndTours", title: "Visits and Tours" }, 
      { routeName: "symposiumAndConferences", title: "Symposium and Conferences Calendar" },
      { routeName: "militaryFamilyAndSpouseProgram", title: "Military Family and Spouse Program" },
      { routeName: "battlerhythm", title: "Battle Rhythm Calendar" },
      { routeName: "staff", title: "Staff Calendar" },
      { routeName: "studentCalendar", title: "Student Calendar" },
      { routeName: "imc", title: "Integrated Master Calendar (IMC)" }];




export default observer( function SyncCalendarInformation({routeName, showSyncInfo} : Props){
   
    const { modalStore, userStore } = useStore();
     const {closeModal} = modalStore;
     const {user, setStudentType} = userStore
     const [lookup, setLookup] = useState<Dictionary[]>(cases);
     const [saving, setSaving] = useState(false);
     const [error, setError] = useState(false);
     const [email, setEmail] = useState('');

     useEffect(() => {
      if (user) {
        if (!user.studentType)  setStudentType(user.userName);
      }
    }, [user, user?.studentType]);

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(false);
      setEmail(e.target.value);
    };

    const videoUrl = `${process.env.PUBLIC_URL}/assets/videos/SyncToOutlook.mp4`;

     const panes = [
      {
        menuItem: {
          key: "tab1",
          icon: <FontAwesomeIcon icon={faWindowsPropIcon} size="2x" color="#00b5ad" />,
          content: <span style={{color: '#00b5ad', fontSize: '2em'}}>&nbsp;Outlook</span>
        },
        render: () => <Tab.Pane>
           <List bulleted size='big'>
    <List.Item>Open Microsoft Outlook In a browser. DO NOT use a client.</List.Item>
    <List.Item>To Open Edu Outlook go to <a href="https://office.com" target="_blank">https://office.com</a> and sign in with your Edu Account. </List.Item> 
    <List.Item>To Open Army .Mil Outlook go to <a href="https://webmail.apps.mil/calendar/view/month" target="_blank">https://webmail.apps.mil/calendar/view/month</a>  and sign in with your CAC. </List.Item>
    <List.Item>Navigate to your outlook calendar if you are not already there</List.Item>
    <List.Item>
      Click add Calendar on the left hand side of screen.
    </List.Item>
    <List.Item>
      Click Subscribe from web.
    </List.Item>
    <List.Item>
      Paste the url you copied from the EEM.
    </List.Item>
    <List.Item>
      Give Your Calendar a Name, Pick a Color and Charm if you Like and pick where to Add it to My Calendars, or Other Calendars.
    </List.Item>
    <List.Item>
      Click the Import Button.  after several seconds your calendar will be imported.
    </List.Item>
    <List.Item>
          Watch the tutorial video: <a href={videoUrl} target="_blank" rel="noopener noreferrer">How to Sync to Outlook</a>.
    </List.Item>
  </List>
        </Tab.Pane>
      },
      {
        menuItem: {
          key: "tab2",
          icon: <FontAwesomeIcon icon={faApplePropIcon} size="2x" color="#00b5ad" />,
          content: <span style={{color: '#00b5ad', fontSize: '2em'}}>&nbsp;iPhone</span>
        },
        render: () => <Tab.Pane>
           <List bulleted size="big">
    <List.Item>On your iPhone, go to "Settings".</List.Item>
    <List.Item>Tap "Calendars" and then "Accounts".</List.Item>
    <List.Item>Tap "Add Account" and then "Other".</List.Item>
    <List.Item>Tap "Add Subscribed Calendar" and enter the iCal feed URL.</List.Item>
    <List.Item>Tap "Next" and then "Save".</List.Item>
    <List.Item>The calendar will now appear in the "Calendars" app on your iPhone.</List.Item>
  </List>
        </Tab.Pane>
      },
      {
        menuItem: {
          key: "tab3",
          icon: <FontAwesomeIcon icon={faAndroidPropIcon} size="2x" color="#00b5ad" />,
          content: <span style={{color: '#00b5ad', fontSize: '2em'}}>&nbsp;Android</span>
        },
        render: () => <Tab.Pane>
           <List bulleted size="big">
    <List.Item>On your Android device, open the "Calendar" app.</List.Item>
    <List.Item>Tap the "Menu" icon in the top left corner and select "Settings".</List.Item>
    <List.Item>Tap "Add account" and select "Google".</List.Item>
    <List.Item>Enter your Google account credentials and sign in.</List.Item>
    <List.Item>
      Once you are signed in, tap the "Menu" icon again and select "Calendar settings".
    </List.Item>
    <List.Item>
      Tap "Add calendar" and enter the iCal feed URL, then tap "Add calendar" again.
    </List.Item>
    <List.Item>The calendar will now appear in the "Calendar" app on your Android device.</List.Item>
  </List>
        </Tab.Pane>
      },
      {
        menuItem: {
          key: "tab4",
          icon: <FontAwesomeIcon icon={faGooglePropIcon} size="2x" color="#00b5ad" />,
          content: <span style={{color: '#00b5ad', fontSize: '2em'}}>&nbsp;Google</span>
        },
        render: () => <Tab.Pane>
           <List bulleted size="big">
    <List.Item>Go to Google Calendar on your computer.</List.Item>
    <List.Item>On the left side of the screen, click the "Add calendar" button.</List.Item>
    <List.Item>Select "From URL".</List.Item>
    <List.Item>Enter the iCal feed URL and click "Add Calendar".</List.Item>
    <List.Item>The calendar will now appear in your Google Calendar on both your computer and mobile device.</List.Item>
  </List>
        </Tab.Pane>
      }
    ];

    const handleButtonClick = async () => {
      setError(false);
      if (email && /\S+@\S+\.\S+/.test(email)) {
        setSaving(true);
        try {
          await agent.SyncCalendarNotifications.create({ email, route: routeName });
              // Show the toast notification
              toast.info('Success: You have been added to the synchronization notifications', {
                position: "top-left",
                autoClose: 20000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              if(!showSyncInfo) closeModal();
    
        } catch (error) {
          console.error("An error occurred:", error);
          setError(true);
        } finally {
          setSaving(false);
        }
      } else {
        setError(true);
      }
    };

    return (
      <>
      {!user || !user.studentType && <LoadingComponent content='Loading...'/>}
      {user && user?.studentType && 
        <>
          <Button
            floated="right"
            icon
            size="mini"
            color="black"
            compact
            onClick={() => closeModal()}
          >
            <Icon name="close" />
          </Button>
          {showSyncInfo &&
          <>
          <Header as="h2">
            <Icon name="sync" />
            <Header.Content>
            {lookup.find(x => x.routeName === routeName)?.title} iCal Subscription Instructions
              <Header.Subheader>  Subscribing to the {lookup.find(x => x.routeName === routeName)?.title} will automatically sync any changes made to your personal calendar and you will receive updates automatically.
           </Header.Subheader>
            </Header.Content>
          </Header>
          <Divider />

          <Header as="h4" >
              {routeName !== 'studentCalendar' && 
              <>
              <span  style={{paddingRight: '10px'}}>
              Copy the iCal feed Url:  {`${process.env.REACT_APP_API_FULL_URL}/SyncCalendar/${routeName}`} 
              </span>
                <CopyToClipboard text={`${process.env.REACT_APP_API_FULL_URL}/SyncCalendar/${routeName}` } />
                </>
               }
               {routeName === 'studentCalendar' && 
              <>
              <span style={{paddingRight: '10px'}}>
              Copy the iCal feed Url:  {`${process.env.REACT_APP_API_FULL_URL}/SyncCalendar/${routeName}/${user.studentType.replace(/\s+/g, '')}`} 
              </span>
                <CopyToClipboard text={`${process.env.REACT_APP_API_FULL_URL}/SyncCalendar/${routeName}/${user.studentType.replace(/\s+/g, '')}` } />
                </>
               }
             </Header>
             </>
          }

             <Message info style={{marginTop: '30px'}} >
      <Message.Header>Subscribe to Changes</Message.Header>
      {routeName !== "symposiumAndConferences" && 
         <span>
          If you subscribe you will receive an email with any changes to the Symposiums and Conferences Calendar , please enter your email and click "Submit."
           </span>
       }
     
        {routeName !== "symposiumAndConferences" && 
         <span>
          If you subscribe you will receive an email with any changes to the Calendar that are within 3 days, please enter your email and click "Submit."
           </span>
       }
      <p/>
      <Form>
        <Input
          style={{ width: '600px' }}
          size="large"
          label={{ icon: 'asterisk' }}
          labelPosition='left corner'
          placeholder='Email...'
          onChange={handleInputChange}
          value={email}
          error={error}
        />
        <Button type='button' size="large" primary onClick={handleButtonClick} loading={saving}>Submit </Button>
        {error && <Label basic color='red' pointing='left'>Please enter a valid email</Label>}
      </Form>
    </Message>

    {showSyncInfo &&
    <>
             <Tab panes={panes} />

             <Message warning>
    <Message.Header>Key Points: Syncing IMC or Organizational Calendar with Your Personal Calendar</Message.Header>
    <p>When you synchronize your personal calendar with the IMC or an organizational calendar, be aware that you will be importing a large volume of data. This may lead to a significant increase in the data within your personal calendar.</p>
    <p>It's important to note that your personal calendar will display only the essential event details: title, location, description, and date/time. You will not have access to any other information about the event.</p>
  </Message>
   </>
    }
    
    </>
  }
  </>
    )});