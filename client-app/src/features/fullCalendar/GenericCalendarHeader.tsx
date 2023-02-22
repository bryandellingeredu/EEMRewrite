import { Divider, Header, Icon } from "semantic-ui-react";
import { faBahai, faBookOpenReader, faBus, faCalendar, faChalkboardTeacher, faChurch, faDove, faNewspaper, faO, faPersonRifle, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonMilitaryPointing } from "@fortawesome/free-solid-svg-icons";
import CSLLegend from "./CSLLegend";

interface Props {
    id: string
}

export default function GenericCalendarHeader({id} : Props){
    return(
      <>
    <Divider horizontal>
      
    <Header as='h2'>
    {id === 'ssl' &&
     <>
     <FontAwesomeIcon icon={faPersonRifle} size='2x' style={{marginRight: '10px'}} />
     SSL Calendar
   </>
      }
    {id === 'weeklyPocket' &&
     <>
     <FontAwesomeIcon icon={faCalendar} size='2x' style={{marginRight: '10px'}} />
     Weekly Pocket Calendar
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
     Training And Misc Events
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
    {id === 'complementary' &&
        <>
          <Icon name='star'  />
          Complementary Events
        </>
      }
    {id === 'community' &&
        <>
          <Icon name='handshake'  />
          Community Relations
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
      {id === 'chapel' &&
        <>
          <FontAwesomeIcon icon={faChurch} size='2x' style={{marginRight: '10px'}} />
          Chapel Calendar
        </>
      }
       {id === 'commandGroup' &&
        <>
          <FontAwesomeIcon icon={faPersonMilitaryPointing} size='2x' style={{marginRight: '10px'}} />
          Command Group Calendar
        </>
      }
      {id === 'academic' &&
        <>
          <FontAwesomeIcon icon={faGraduationCap} size='2x' style={{marginRight: '10px'}} />
          Academic IMC Event Calendar
        </>
      }
      
    </Header>
  </Divider>

    {id === 'csl' && <CSLLegend />}
    </>
    )
}