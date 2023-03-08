import { Button, Divider, Header, Icon, List, Tab } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import {useState} from 'react';
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faWindows } from "@fortawesome/free-brands-svg-icons";
import { faApple } from "@fortawesome/free-brands-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faAndroid } from "@fortawesome/free-brands-svg-icons";
import CopyToClipboard from "./copyToClipboard";

const faWindowsPropIcon = faWindows as IconProp;
const faApplePropIcon = faApple as IconProp;
const faGooglePropIcon = faGoogle as IconProp;
const faAndroidPropIcon = faAndroid as IconProp;


interface Props {
    routeName: string
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
      { routeName: "imc", title: "Integrated Master Calendar (IMC)" }];




export default function SyncCalendarInformation({routeName} : Props){

    const { modalStore } = useStore();
     const {closeModal} = modalStore;
     const [lookup, setLookup] = useState<Dictionary[]>(cases);

     const panes = [
      {
        menuItem: {
          key: "tab1",
          icon: <FontAwesomeIcon icon={faWindowsPropIcon} size="2x" color="#00b5ad" />,
          content: <span style={{color: '#00b5ad', fontSize: '2em'}}>&nbsp;Outlook</span>
        },
        render: () => <Tab.Pane>
           <List bulleted size='big'>
    <List.Item>Open Microsoft Outlook.</List.Item>
    <List.Item>Click on "File" in the top left corner.</List.Item>
    <List.Item>
      Select "Account Settings" and then "Account Settings" again from the drop-down menu.
    </List.Item>
    <List.Item>
      In the "Internet Calendars" section, click on "New".
    </List.Item>
    <List.Item>
      Enter the iCal feed URL into the text field and click on "Add".
    </List.Item>
    <List.Item>
      The calendar will now appear in the "Internet Calendars" section of the "Account
      Settings" window. To subscribe to the calendar, select it and click on "OK".
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
          content: <span style={{color: '#00b5ad', fontSize: '2em'}}>&nbsp;Google Calendar</span>
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

    return (
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
              Copy the iCal feed Url:  {`${process.env.REACT_APP_API_FULL_URL}/SyncCalendar/${routeName}`}   <CopyToClipboard text={`${process.env.REACT_APP_API_URL}/SyncCalendar/${routeName}` } />
             </Header>

             <Tab panes={panes} />
    
    </>
    )};