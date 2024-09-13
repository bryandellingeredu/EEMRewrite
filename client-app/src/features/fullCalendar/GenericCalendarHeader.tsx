import { Button, Divider, Header, Icon } from "semantic-ui-react";
import { faBahai, faBookOpenReader, faBus, faCalendar, faChalkboardTeacher, faChurch, faDove, faNewspaper, faO, faPersonRifle, faGraduationCap, faPeopleGroup, faHouseChimneyWindow, faCalendarWeek, faClipboardUser, faUsersRays, faEarthAmericas, faUserFriends, faChessKing } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonMilitaryPointing } from "@fortawesome/free-solid-svg-icons";
import CSLLegend from "./CSLLegend";
import USAHECFacilitiesUsageLegend from "./USAHECFacilitiesUsageLegend";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";
import { useStore } from "../../app/stores/store";
import SyncCalendarInformation from "./SyncCalendarInformation";
import MSFPLegend from "./MSFPLegend";
import CIOEventPlanningLegend from "./CIOEventPlanningLegend";
import { useState, useEffect } from "react";
import SpouseLegend from "./SpouseLegend";
import GenericLegend from "./GenericLegend";
import ExecLegend from "./ExecLegend";

interface Props {
    id: string
}

export default function GenericCalendarHeader({id} : Props){
  const { modalStore, userStore } = useStore();
  const {openModal} = modalStore;
  const [cioEventPlanningAdmin, setCIOEventPlanningAdmin] = useState(false);
  const {user} = userStore
  useEffect(() => {
    setCIOEventPlanningAdmin((user && user.roles && user.roles.includes("CIOEventPlanningAdmin")) || false);
}, [user]);

if (id === 'cio' && !cioEventPlanningAdmin) {
  return (
    <Header as='h3' color='red'>
      <Icon name='exclamation triangle' />
      You do not have the required role to view this content.
    </Header>
  );
} 




    return(
      <>
       
        <Button icon  floated="right" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SyncCalendarInformation
                routeName={id}
                showSyncInfo={true}
              />, 'large'
            )
          }
        >
      <Icon name='sync'/>
       &nbsp; Sync To My Calendar
    </Button>
    <Button icon  floated="right" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SyncCalendarInformation
                routeName={id}
                showSyncInfo={false}
              />, 'large'
            )
          }
        >
      <Icon name='bell'/>
       &nbsp; Subscribe to Changes
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
          {id === 'cio' &&
     <>
     <FontAwesomeIcon icon={faUsersRays} size='2x' style={{marginRight: '10px'}} />
     CIO Event Planning Calendar
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
     USAHEC Calendar
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
         {id === 'internationalfellows' &&
        <>
           <FontAwesomeIcon icon={faEarthAmericas} size='2x' style={{marginRight: '10px'}} />
          International Fellows
        </>
      }
        {id === 'exec' &&
        <>
           <FontAwesomeIcon icon={faChessKing} size='2x' style={{marginRight: '10px'}} />
          Executive Services Calendar
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
      {id === 'spouse' &&
        <>
          <FontAwesomeIcon icon={faUserFriends} size='2x' style={{marginRight: '10px'}} />
          Spouse Calendar
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
   
  {(() => {
    switch (id) {
      case 'exec':
       return <ExecLegend />;
      case 'csl':
        return <CSLLegend />;
      case 'usahecFacilitiesUsage':
        return <USAHECFacilitiesUsageLegend />;
      case 'militaryFamilyAndSpouseProgram':
        return <MSFPLegend />;
      case 'cio':
        if (cioEventPlanningAdmin) {
          return <CIOEventPlanningLegend />;
        } else {
          return <GenericLegend />;
        }
      case 'spouse':
        return <SpouseLegend />;
      default:
        return <GenericLegend />;
    }
  })()}


    </>
    )
}
