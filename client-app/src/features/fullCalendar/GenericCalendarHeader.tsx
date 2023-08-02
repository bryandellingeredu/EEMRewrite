import { Button, Divider, Header, Icon } from "semantic-ui-react";
import { faBahai, faBookOpenReader, faBus, faCalendar, faChalkboardTeacher, faChurch, faDove, faNewspaper, faO, faPersonRifle, faGraduationCap, faPeopleGroup, faHouseChimneyWindow, faCalendarWeek, faClipboardUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonMilitaryPointing } from "@fortawesome/free-solid-svg-icons";
import CSLLegend from "./CSLLegend";
import USAHECFacilitiesUsageLegend from "./USAHECFacilitiesUsageLegend";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";
import { useStore } from "../../app/stores/store";
import SyncCalendarInformation from "./SyncCalendarInformation";
import MSFPLegend from "./MSFPLegend";

interface Props {
    id: string
}

export default function GenericCalendarHeader({id} : Props){
  const { modalStore } = useStore();
  const {openModal} = modalStore;
    return(
      <>
       
        <Button icon  floated="right" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SyncCalendarInformation
                routeName={id}
              />, 'large'
            )
          }
        >
      <Icon name='sync'/>
       &nbsp; Sync To My Calendar
    </Button>
    <Divider horizontal>

    <Header as='h2'>
    {id === 'ssl' &&
     <>
     <FontAwesomeIcon icon={faPersonRifle} size='2x' style={{marginRight: '10px'}} />
     SSL Admin Calendar
   </>
      }
 
         {id === 'battlerhythm' &&
     <>
     <FontAwesomeIcon icon={faCalendarCheck} size='2x' style={{marginRight: '10px'}} />
     Battle Rhythm
   </>
      }
    {id === 'staff' &&
     <>
     <FontAwesomeIcon icon={faClipboardUser} size='2x' style={{marginRight: '10px'}} />
     Staff Calendar
   </>
      }
    {id === 'visitsAndTours' &&
     <>
     <FontAwesomeIcon icon={faBus} size='2x' style={{marginRight: '10px'}} />
     Visits And Tours
   </>
      }
    {id === 'trainingAndMiscEvents' &&
     <>
     <FontAwesomeIcon icon={faChalkboardTeacher} size='2x' style={{marginRight: '10px'}} />
     Training
   </>
      }
    {id === 'ssiAndUsawcPress' &&
     <>
     <FontAwesomeIcon icon={faNewspaper} size='2x' style={{marginRight: '10px'}} />
     SSI And USAWC Press Calendar
   </>
      }
    {id === 'pksoi' &&
     <>
     <FontAwesomeIcon icon={faDove} size='2x' style={{marginRight: '10px'}} />
     PKSOI Calendar
   </>
      }
    {id === 'other' &&
     <>
     <FontAwesomeIcon icon={faO} size='2x' style={{marginRight: '10px'}} />
     Other
   </>
      }
    {id === 'generalInterest' &&
     <>
     <FontAwesomeIcon icon={faBahai} size='2x' style={{marginRight: '10px'}} />
     General Interest
   </>
      }
    {id === 'usahecFacilitiesUsage' &&
     <>
     <FontAwesomeIcon icon={faBookOpenReader} size='2x' style={{marginRight: '10px'}} />
     USAHEC Facilities Usage Calendar
   </>
      }
    {id === 'usahec' &&
        <>
          <Icon name='book'  />
          USAHEC Calendar
        </>
      }
    {id === 'garrison' &&
        <>
          <Icon name='building'  />
          Garrison Calendar
        </>
      }
    {id === 'community' &&
        <>
          <Icon name='handshake'  />
          Community Events (External)
        </>
      }
      {id === 'csl' &&
        <>
          <Icon name='copyright'  />
          CSL Calendar
        </>
      }
         {id === 'socialEventsAndCeremonies' &&
        <>
          <Icon name='glass martini'  />
          Social Events And Ceremonies
        </>
      }
     
      {id === 'asep' &&
        <>
          <Icon name='adn' />
          ASEP Calendar
        </>
      }
      {id === 'holiday' &&
        <>
          <Icon name='tree' />
          Holiday Calendar
        </>
      }
       {id === 'commandGroup' &&
        <>
          <FontAwesomeIcon icon={faPersonMilitaryPointing} size='2x' style={{marginRight: '10px'}} />
          Command Group Calendar
        </>
      }
         {id === 'symposiumAndConferences' &&
        <>
          <FontAwesomeIcon icon={faPeopleGroup} size='2x' style={{marginRight: '10px'}} />
          Symposium and Conferences Calendar
        </>
      }
       {id === 'militaryFamilyAndSpouseProgram' &&
        <>
          <FontAwesomeIcon icon={faHouseChimneyWindow} size='2x' style={{marginRight: '10px'}} />
          Military Spouse and Family Program
        </>
      }
      {id === 'academic' &&
        <>
          <FontAwesomeIcon icon={faGraduationCap} size='2x' style={{marginRight: '10px'}} />
          Faculty Calendar
        </>
      }

       {id === 'studentCalendar' &&
        <>
          <FontAwesomeIcon icon={faGraduationCap} size='2x' style={{marginRight: '10px'}} />
          Student Calendar
        </>
      }
      
    </Header>
  </Divider>

    {id === 'csl' && <CSLLegend />}
    {id === 'usahecFacilitiesUsage' && <USAHECFacilitiesUsageLegend />}
    {id === 'militaryFamilyAndSpouseProgram' && <MSFPLegend />}
    </>
    )
}