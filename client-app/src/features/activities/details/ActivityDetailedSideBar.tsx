import {useState, useEffect} from 'react'
import { ActivityAttachment } from "../../../app/models/activityAttachment";
import { Segment, Icon, Grid, List } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'
import { Activity } from '../../../app/models/activity'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBahai, faBookmark, faBookOpenReader, faBuilding, faBus, faCalendar, faCalendarCheck, faCalendarWeek, faCamera, faChalkboardTeacher, faCheck, faChurch, faClipboardUser, faClock, faComputer, faDove, faEarthAmericas, faEnvelope, faFax, faGraduationCap, faHashtag, faIdCard, faLaptop, faMobile, faNetworkWired, faNewspaper, faP, faPalette, faPeopleGroup, faPeopleRoof, faPersonMilitaryPointing, faPersonRifle, faPhone, faPhoneFlip, faPrint, faServer, faShieldHalved, faSignal, faSitemap, faSquareParking, faTablet, faTv, faUser, faUserSecret, faUsersRays } from '@fortawesome/free-solid-svg-icons';
import agent from '../../../app/api/agent';
import ActivityAttachmentSideBarComponent from './ActivityAttachmentSideBarComponent';
import format from 'date-fns/format';
import ResidentAndDistanceStudentCalendar from '../../fullCalendar/ResidentAndDistanceStudentCalendar';

interface Props {
    activity: Activity
}

const devicesRequiredRooms : string[] = [
    'Bldg650CollinsHallNormandyConferenceRoomSVTC@armywarcollege.edu',
    'Bldg650CollinsHallGuadalcanalRoomRm3013@armywarcollege.edu',
    'Bldg650CollinsHallStLoRoomRm3006@armywarcollege.edu',
    'Bldg650CollinsHall22ndInfConferenceRoomSVTC@armywarcollege.edu',
    'Bldg650CollinsHall18thInfConferenceRoom@armywarcollege.edu',
    'Bldg650CollinsHallCherbourgRoomRm1015@armywarcollege.edu',
    'Bldg650CollinsHallToyRoomRm1018@armywarcollege.edu',
    'Bldg650CollinsHallB030@armywarcollege.edu',
    'Bldg650CollinsHallB033ASVTC@armywarcollege.edu',
    'Bldg650CollinsHallB037SVTC@armywarcollege.edu',
    'Bldg650CollinsHallTriangleRoomSVTCRmB034@armywarcollege.edu'
  ];
  
  const includesAny = (arr : string[], values : string []) => values.some(v => arr.includes(v));


export default observer(function ActivityDetailedSidebar ({activity}: Props) {
    const [activityAttachments, setActivityAttachments] = useState<ActivityAttachment[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if(activity.activityAttachmentGroupLookup){
            agent.Attachments.activityDetails(activity.activityAttachmentGroupLookup).then((response) => {
                setActivityAttachments(response);
              });
            }
        };
        if(activity.activityAttachmentGroupLookup && activity.activityAttachmentGroupLookup.length > 0)
        fetchData();
      }, []);

    return (
        <Segment.Group>
           {/* <Segment
                textAlign='center'
                style={{ border: 'none' }}
                attached='top'
                secondary
                inverted
    color='teal'/>   */} 
{activity.activityRooms && activity.activityRooms.length > 0 && activity.numberAttending &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='users' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span>Attendees: {activity.numberAttending}</span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.phoneNumberForRoom &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='phone' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span>Room Requestor: {activity.phoneNumberForRoom}</span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.roomSetUp &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='setting' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 {activity.roomSetUp}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.blissHallSupport &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='check' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 Bliss Hall Support Requested
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.blissHallAVSptRequired && 
      activity.additionalVTCInfo &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='info' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={4}>
                 <span style={{paddingLeft: '5px'}}>
                 Bliss Hall Spt:
                 </span>
                 </Grid.Column>
                 <Grid.Column width={10}>
                 {activity.blissHallAVSptRequired}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Required
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

     {activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.vtcClassification &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Classification: {activity.vtcClassification}
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.distantTechPhoneNumber &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Distant Tech Phone : {activity.distantTechPhoneNumber}
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.requestorPOCContactInfo &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Requestor POC : {activity.distantTechPhoneNumber}
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.dialInNumber &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Dial-In Number : {activity.dialInNumber}
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.siteIDDistantEnd &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Site-ID Distant End : {activity.siteIDDistantEnd}
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.gosesInAttendance &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC a GO / SES is in attendance
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.seniorAttendeeNameRank &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Senior Atendee Name/Rank: {activity.seniorAttendeeNameRank}
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.additionalVTCInfo &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={4}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Info:
                 </span>
                 </Grid.Column>
                 <Grid.Column width={10}>
                 {activity.additionalVTCInfo}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.activityRooms && activity.activityRooms.length > 0 && activity.vtc && 
      activity.vtcStatus &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='tv' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>
                 VTC Status: {activity.vtcStatus}
                 </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }


{activity.activityRooms && activity.activityRooms.length > 0 && activity.roomSetUpInstructions &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='info' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 {activity.roomSetUpInstructions}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.g5Calendar &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='calendar' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 Added to the G5 Calendar
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.g5Calendar && activity.g5Organization &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='building' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 G5 Related Organization: {activity.g5Organization}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.hyperlink &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='linkify' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <a target="_blank" rel="noreferrer" href={activity.hyperlink}>
                   {activity.hyperlinkDescription || activity.hyperlink}
                </a>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.eventClearanceLevel &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='spy' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Clearance: {activity.eventClearanceLevel}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.communityEvent &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='globe' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Community Event
                 </Grid.Column>
             </Grid>
         </Segment>
 } 
 {activity.mfp &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='calendar check' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                  Military Spouse and Family Program
                 </Grid.Column>
             </Grid>
         </Segment>
 } 

{activity.mfp && activity.educationalCategory &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='graduation' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                  Educational Category: {activity.educationalCategory}
                 </Grid.Column>
             </Grid>
         </Segment>
 } 

 {(activity.commandantRequested || activity.dptCmdtRequested || activity.provostRequested ||
   activity.cofsRequested || activity.deanRequested || activity.ambassadorRequested ||
   activity.csmRequested) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
           <Icon name='users' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={8}>
         Leaders Requested: 
       </Grid.Column>
       <Grid.Column width={6}>
       <List >
            {activity.commandantRequested && <List.Item>Commandant</List.Item> }
            {activity.dptCmdtRequested && <List.Item>Dept Cmdt</List.Item> }
            {activity.provostRequested && <List.Item>Provost</List.Item> }
            {activity.cofsRequested && <List.Item>COS</List.Item> }
            {activity.deanRequested && <List.Item>Dean</List.Item> }
            {activity.ambassadorRequested && <List.Item>Ambassador</List.Item> }
            {activity.csmRequested && <List.Item>CSM</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }


{activity.imc &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='calendar' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the IMC Calendar
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.copiedToacademic &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='graduation' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the Faculty Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTostudentCalendar &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='graduation' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the Student Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedToasep &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='adn' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the ASEP Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTocio &&
             <Segment attached>
             <Grid verticalAlign='middle'>
             <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faUsersRays} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the CIO Event Planning Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }



{activity.copiedTocommandGroup &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faPersonMilitaryPointing} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the Command Group Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }


{activity.copiedTocommunity &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='handshake' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added  Community Events (External) Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTocsl &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='copyright' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the CSL Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTogarrison &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='building' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the Garrison Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTointernationalfellows &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faEarthAmericas} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the International Fellows
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTogeneralInterest &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBahai} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the General Interest Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedToholiday &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='tree' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the Holiday Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTopksoi &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faDove} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the PKSOI Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTosocialEventsAndCeremonies &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='glass martini' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to Social Events & Ceremonies Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTossiAndUsawcPress &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faNewspaper} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to SSI & USAWC Press Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTossl &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faPersonRifle} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the SSL Admin Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTotrainingAndMiscEvents &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faChalkboardTeacher} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '25px'}}>
                   Added to Training Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTobattlerhythm &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCalendarCheck} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '25px'}}>
                   Added to Battle Rhythm
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTostaff &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faClipboardUser} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '25px'}}>
                   Added to Staff Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }


{activity.copiedTousahecFacilitiesUsage &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBookOpenReader} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the USAHEC Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTovisitsAndTours &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBus} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the Visits and Tour Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }


{activity.copiedTosymposiumAndConferences &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faPeopleGroup} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '25px'}}>
                   Added to the Symposium & Conferences Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }




 { activity.category.name  === 'CSL Calendar' && activity.type && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='bookmark' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Event Type: {activity.type}
                 </Grid.Column>
             </Grid>
         </Segment>
   
 }

{/* activity.category.name  === 'CSL Calendar' && activity.color && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faPalette} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}>  Event Color: {activity.color}
                 </span>                 
                 </Grid.Column>
             </Grid>
         </Segment>
   
*/ }

{ activity.category.name  === 'CSL Calendar' && activity.dti && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='check' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   DTI Supported Exercise
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'CSL Calendar' && activity.education && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='graduation' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}> Supports Education or Simulation </span> 
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.category.name  === 'CSL Calendar' && 
(activity.cslDirectorateCSL || activity.cslDirectorateDSW || activity.cslDirectorateDTI ||
    activity.cslDirectorateSLFG || activity.cslDirectorateFellows) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <FontAwesomeIcon icon={faSitemap} size='2x' color='#00b5ad'  />
       </Grid.Column>
       <Grid.Column width={6}>
         <span style={{paddingLeft: '10px'}}> CSL Directorate:</span> 
       </Grid.Column>
       <Grid.Column width={8}>
       <List >
            {activity.cslDirectorateCSL && <List.Item>CSL</List.Item> }
            {activity.cslDirectorateDSW && <List.Item>DSW</List.Item> }
            {activity.cslDirectorateDTI && <List.Item>DTI</List.Item> }
            {activity.cslDirectorateSLFG && <List.Item>SLFG</List.Item> }
            {activity.cslDirectorateFellows && <List.Item>Fellows</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }

{ activity.category.name  === 'CSL Calendar' && activity.pax && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faP} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                Pax: {activity.pax}              
                 </Grid.Column>
             </Grid>
         </Segment>
   
 }

{activity.category.name  === 'CSL Calendar' && 
(activity.roomRequirementBasement || activity.roomRequirement1 || activity.roomRequirement3 ||
    activity.roomRequirement3 ) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <FontAwesomeIcon icon={faPeopleRoof} size='2x' color='#00b5ad'  />
       </Grid.Column>
       <Grid.Column width={6}>
         <span style={{paddingLeft: '12px'}}> Room Rqmt:</span> 
       </Grid.Column>
       <Grid.Column width={8}>
       <List >
            {activity.roomRequirementBasement && <List.Item>Basement</List.Item> }
            {activity.roomRequirement1  && <List.Item>1st Floor</List.Item> }
            {activity.roomRequirement2  && <List.Item>2nd Floor</List.Item> }
            {activity.roomRequirement3 && <List.Item>3rd Floor</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }

{activity.category.name  === 'CSL Calendar' && 
(activity.participationCmdt || activity.participationGO|| activity.participationDir ||
    activity.participationForeign ) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <FontAwesomeIcon icon={faPeopleGroup} size='2x' color='#00b5ad'  />
       </Grid.Column>
       <Grid.Column width={6}>
         <span style={{paddingLeft: '12px'}}> Participation:</span> 
       </Grid.Column>
       <Grid.Column width={8}>
       <List >
            {activity.participationCmdt && <List.Item>Cmdt Participation</List.Item> }
            {activity.participationGO  && <List.Item>GO Participation</List.Item> }
            {activity.participationDir  && <List.Item>Dir, CSL Participation</List.Item> }
            {activity.participationForeign && <List.Item>Foreign National Participation</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }

{activity.category.name  === 'CSL Calendar' && 
(activity.automationProjection || activity.automationCopiers|| activity.automationPC ||
    activity.automationVTC || activity.automationTaping ) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <FontAwesomeIcon icon={faComputer} size='2x' color='#00b5ad'  />
       </Grid.Column>
       <Grid.Column width={6}>
         <span style={{paddingLeft: '12px'}}> Automation/IV:</span> 
       </Grid.Column>
       <Grid.Column width={8}>
       <List >
            {activity.automationProjection && <List.Item>Projection</List.Item> }
            {activity.automationCopiers && <List.Item>Copiers</List.Item> }
            {activity.automationPC  && <List.Item>PC Rqmts</List.Item> }
            {activity.automationVTC && <List.Item>VTC</List.Item> }
            {activity.automationTaping && <List.Item>Taping Rqmts</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }

{ activity.category.name  === 'CSL Calendar'  && activity.automationComments &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Automation Comments:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.automationComments}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'CSL Calendar' && activity.communicationSupport && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faFax} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}> 
                 Communication Support: {activity.communicationSupport}
                 </span> 
                             
                 </Grid.Column>
             </Grid>
         </Segment> 
 }

{ activity.category.name  === 'CSL Calendar' && activity.faxClassification && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faUserSecret} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}> 
                 FAX Classification: {activity.faxClassification}
                 </span> 
                             
                 </Grid.Column>
             </Grid>
         </Segment> 
 }

{ activity.category.name  === 'CSL Calendar'  && activity.communicationComments &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Communication Comments:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.communicationComments}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'CSL Calendar' && activity.catering && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='food' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Catering is Required
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.category.name  === 'CSL Calendar' && 
(activity.cateringAreaArdennes || activity.cateringArea18|| activity.cateringArea22 ) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <Icon name='food' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={6}>
         Catering Area(s)
       </Grid.Column>
       <Grid.Column width={8}>
       <List >
            {activity.cateringAreaArdennes && <List.Item>Ardennes</List.Item> }
            {activity.cateringArea18 && <List.Item>18th Break Area</List.Item> }
            {activity.cateringArea22 && <List.Item>22nd Break Area</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }

{activity.category.name  === 'CSL Calendar' && 
(activity.cateringBreakArea18 || activity.cateringBreakArea22) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <Icon name='food' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={6}>
         Catering Break Area(s)
       </Grid.Column>
       <Grid.Column width={8}>
       <List >
            {activity.cateringBreakArea18 && <List.Item>18th Side Break Area</List.Item> }
            {activity.cateringBreakArea22 && <List.Item>22nd Side Break Area</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }

{ activity.category.name  === 'CSL Calendar'  && activity.cateringComments &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Catering Comments:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.cateringComments}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'CSL Calendar' && activity.transportation && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBus} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '5px'}}> 
                 Transportation: {activity.transportation}
                 </span>                            
                 </Grid.Column>
             </Grid>
         </Segment> 
 }


{ activity.category.name  === 'CSL Calendar' && activity.parkingPasses && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faSquareParking} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Parking Passes are Required
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'CSL Calendar' && activity.parkingSpaces && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faSquareParking} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Parking Spaces: {activity.parkingSpaces}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'CSL Calendar'  && activity.transportationComments &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Transportation Comments:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.transportationComments}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'CSL Calendar' && activity.registration && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faIdCard} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                   Registration is Required
                   </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'CSL Calendar'  && activity.registrationLocation &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='marker' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Registration Location:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.registrationLocation}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{activity.category.name  === 'CSL Calendar' && 
(activity.securityBadgeIssue || activity.securityAfterDutyAccess) && 
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <FontAwesomeIcon icon={faShieldHalved} size='2x' color='#00b5ad'  />
       </Grid.Column>
       <Grid.Column width={6}>
       <span style={{paddingLeft: '5px'}}>
       Security
       </span>
         
       </Grid.Column>
       <Grid.Column width={8}>
       <List >
            {activity.securityBadgeIssue && <List.Item>Badge Issue</List.Item> }
            {activity.securityAfterDutyAccess && <List.Item>After Duty Access</List.Item> }
       </List>
       </Grid.Column>
   </Grid>
</Segment>
   }

{ activity.category.name  === 'CSL Calendar'  && activity.securityComments &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Security Comments:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.securityComments}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'CSL Calendar'  && activity.suppliesComments &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Supplies Comments:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.suppliesComments}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'CSL Calendar'  && activity.otherComments &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        Other Comments:
                    </Grid.Column>
                    <Grid.Column width={8}>
                    {activity.otherComments}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'CSL Calendar' && activity.approvedByOPS && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCheck} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Approved by OPS: {activity.approvedByOPS}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'Garrison Calendar' && activity.garrisonCategory && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBookmark} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Garrison Category: {activity.garrisonCategory}
                 </Grid.Column>
             </Grid>
         </Segment>
 }



{ activity.category.name  === 'Garrison Calendar' && activity.marketingRequest && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCheck} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                   Marketing Request
                   </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'Garrison Calendar' && activity.marketingRequest && activity.marketingCampaignCategory &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCheck} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                   Campaign Category: {activity.marketingCampaignCategory}
                   </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'Garrison Calendar' && activity.marketingRequest && activity.marketingProgram &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCheck} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                   Program: {activity.marketingProgram}
                   </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'SSL Calendar' && activity.sslCategories && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBookmark} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   SSL Category: {activity.sslCategories}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'USAHEC Calendar' && activity.usahecDirectorate && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faSitemap} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                     USAHEC Directorate: {activity.usahecDirectorate}
                 </span>                 
                 </Grid.Column>
             </Grid>
         </Segment>
 }



{ activity.category.name  === 'USAHEC Calendar' && activity.usahecCalendarCategory && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBookmark} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                     USAHEC Category: {activity.usahecCalendarCategory}
                 </span>                 
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'USAHEC Facilities Usage Calendar' && activity.usahecFacilityReservationType && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBookmark} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Reservation Type: {activity.usahecFacilityReservationType}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'USAHEC Facilities Usage Calendar' && activity.copyToUSAHECCalendar && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCalendar} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                     Event Copied to the USAHEC Calendar               
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'USAHEC Facilities Usage Calendar' && activity.marketingRequest && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCheck} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Marketing Request
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'Weekly Pocket Calendar' && activity.pocketCalNonAcademicEvent && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faGraduationCap} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                   This is a Pocket Calendar Non Academic Event
                   </span>
                 </Grid.Column>
             </Grid>
         </Segment>
}

{ activity.category.name  === 'Weekly Pocket Calendar' && activity.pocketCalWeek && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCalendarWeek} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Week: {activity.pocketCalWeek}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'Weekly Pocket Calendar' && activity.pocketCalLessonNumber && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faHashtag} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Lesson Number: {activity.pocketCalLessonNumber}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'Weekly Pocket Calendar' && activity.pocketCalPresenter && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faChalkboardTeacher} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                   Presenter: {activity.pocketCalPresenter}
                   </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.category.name  === 'Weekly Pocket Calendar' && activity.pocketCalPresenterOrg && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBuilding} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 <span style={{paddingLeft: '10px'}}>
                   Presenter Org: {activity.pocketCalPresenterOrg}
                   </span>
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) &&
   !activity.studentCalendarResident && !activity.studentCalendarDistanceGroup1  && !activity.studentCalendarDistanceGroup2 && !activity.studentCalendarDistanceGroup3 &&
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <Icon name='user' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={14}>
        Student Type:  Resident
       </Grid.Column>
   </Grid>
</Segment>
}

{(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) &&
   activity.studentCalendarResident &&
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <Icon name='user' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={14}>
        Student Type:  Resident
       </Grid.Column>
   </Grid>
</Segment>
}

{(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) &&
   activity.studentCalendarDistanceGroup1 &&
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <Icon name='user' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={14}>
        Student Type:  DEP 2024
       </Grid.Column>
   </Grid>
</Segment>
}

{(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) &&
   activity.studentCalendarDistanceGroup2 &&
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <Icon name='user' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={14}>
        Student Type:  DEP 2025
       </Grid.Column>
   </Grid>
</Segment>
}

{(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) &&
   activity.studentCalendarDistanceGroup3 &&
   <Segment attached>
   <Grid verticalAlign='middle'>
       <Grid.Column width={1}>
       <Icon name='user' size='large' color='teal' />
       </Grid.Column>
       <Grid.Column width={14}>
        Student Type:  DEP 2026
       </Grid.Column>
   </Grid>
</Segment>
}


{(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) && activity.studentCalendarMandatory &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='street view' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                  Resident Attendance is Mandatory
                 </Grid.Column>
             </Grid>
 </Segment>
 }
 {(activity.category.name  === 'International Fellows' || activity.copiedTointernationalfellows) && activity.studentCalendarMandatory &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='street view' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                  International Fellows Attendance is Mandatory
                 </Grid.Column>
             </Grid>
 </Segment>
 }
 {(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) && activity.studentCalendarDistanceGroup1 && activity.studentCalendarDistanceGroup1Mandatory &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='street view' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                  DEP 2024 Attendance is Mandatory
                 </Grid.Column>
             </Grid>
 </Segment>
 }
  {(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) && activity.studentCalendarDistanceGroup2 && activity.studentCalendarDistanceGroup2Mandatory &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='street view' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                  DEP 2025 Attendance is Mandatory
                 </Grid.Column>
             </Grid>
 </Segment>
 }
   {(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar) && activity.studentCalendarDistanceGroup3 && activity.studentCalendarDistanceGroup3Mandatory &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='street view' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                  DEP 2026 Attendance is Mandatory
                 </Grid.Column>
             </Grid>
 </Segment>
 }
{ (activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar || activity.copiedTointernationalfellows)  && activity.studentCalendarUniform &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='male' />
                    </Grid.Column>
                    <Grid.Column width={2}>
                        Uniform:
                    </Grid.Column>
                    <Grid.Column width={12}>
                    {activity.studentCalendarUniform}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{(activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar || activity.copiedTointernationalfellows) && activity.studentCalendarPresenter &&
    <Segment attached>
    <Grid verticalAlign='middle'>
        <Grid.Column width={1}>
        <FontAwesomeIcon icon={faChalkboardTeacher} size='2x' color='#00b5ad'  />
        </Grid.Column>
        <Grid.Column width={14}>
        <span style={{paddingLeft: '10px'}}>
          Presenter: {activity.studentCalendarPresenter}
          </span>
        </Grid.Column>
    </Grid>
</Segment>
 }


{ (activity.category.name  === 'Student Calendar' || activity.copiedTostudentCalendar || activity.copiedTointernationalfellows)  && activity.studentCalendarNotes &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={2}>
                        Notes:
                    </Grid.Column>
                    <Grid.Column width={12}>
                    {activity.studentCalendarNotes}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.category.name  === 'Weekly Pocket Calendar'  && activity.pocketCalNotes &&
            <Segment attached>
                <Grid>
                    <Grid.Column width={1}>
                        <Icon size='large' color='teal' name='info' />
                    </Grid.Column>
                    <Grid.Column width={2}>
                        Notes:
                    </Grid.Column>
                    <Grid.Column width={12}>
                    {activity.pocketCalNotes}
                    </Grid.Column>
                </Grid>
            </Segment>
      }

{ activity.copiedTocio && activity.eventPlanningPAX && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faP} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Pax: {activity.eventPlanningPAX}              
                 </Grid.Column>
             </Grid>
         </Segment>
   
 }

{ activity.copiedTocio && activity.eventPlanningExternalEventPOCName && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faUser} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning POC Name: {activity.eventPlanningExternalEventPOCName}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningExternalEventPOCEmail && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faEnvelope} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning POC Email: {activity.eventPlanningExternalEventPOCEmail}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.copiedTocio && activity.eventPlanningExternalEventPOCContactInfo &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='info' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={4}>
                 <span style={{paddingLeft: '5px'}}>
                 CIO Event Planning POC Info:
                 </span>
                 </Grid.Column>
                 <Grid.Column width={10}>
                 {activity.eventPlanningExternalEventPOCContactInfo}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{activity.copiedTocio && activity.eventPlanningCIORequirementsComments &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='info' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={4}>
                 <span style={{paddingLeft: '5px'}}>
                 CIO Requirements Comments:
                 </span>
                 </Grid.Column>
                 <Grid.Column width={10}>
                 {activity.eventPlanningCIORequirementsComments}
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && 
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCheck} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Status: {activity.eventPlanningStatus || 'Pending'}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningNumOfPC &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faComputer} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Num of PCs: {activity.eventPlanningNumOfPC}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningNumOfBYADS &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faLaptop} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Num of BYADs: {activity.eventPlanningNumOfBYADS}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }
 { activity.copiedTocio && activity.eventPlanningNumOfVOIPs &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faMobile} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Num of VOIP / VOSIP / Cell Phone: {activity.eventPlanningNumOfVOIPs}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningNumOfPrinters &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faPrint} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Num of Printers / Copiers: {activity.eventPlanningNumOfPrinters}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningNumOfPeripherals &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCamera} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Num of Peripherals: {activity.eventPlanningNumOfPeripherals}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningNumOfMonitors &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faTv} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Num of Monitors / Projectors: {activity.eventPlanningNumOfMonitors}              
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningSetUpDate &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faClock} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Set Up:  {format(activity.eventPlanningSetUpDate, 'MMMM d, yyyy h:mm aa')}           
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningGovLaptops &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faLaptop} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Goverment Laptops      
                 </Grid.Column>
             </Grid>
         </Segment>
 }

{ activity.copiedTocio && activity.eventPlanningPersonalLaptops &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faLaptop} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Personal Laptops    
                 </Grid.Column>
             </Grid>
         </Segment>
 }
 { activity.copiedTocio && activity.eventPlanningTablets &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faTablet} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Tablets       
                 </Grid.Column>
             </Grid>
         </Segment>
 }
  { activity.copiedTocio && activity.eventPlanningServers &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faServer} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Servers       
                 </Grid.Column>
             </Grid>
         </Segment>
 }
   { activity.copiedTocio && activity.eventPlanningCellPhones &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faMobile} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Cell Phones      
                 </Grid.Column>
             </Grid>
         </Segment>
 }
    { activity.copiedTocio && activity.eventPlanningNetworkREN &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning REN Required     
                 </Grid.Column>
             </Grid>
         </Segment>
    
 }
    { activity.copiedTocio && activity.eventPlanningNetworkWireless &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faSignal} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                CIO Event Planning Wireless Required     
                 </Grid.Column>
             </Grid>
         </Segment>
    
 }
     { activity.copiedTocio && activity.eventPlanningNetworkNTG &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 CIO Event Planning NTG Required   
                 </Grid.Column>
             </Grid>
         </Segment>
    
 }

{ activity.copiedTocio && activity.eventPlanningNetworkNTS &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 CIO Event Planning NTS Required   
                 </Grid.Column>
             </Grid>
         </Segment>
    
 }

{ activity.copiedTocio && activity.eventPlanningNetworkSIPR &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 CIO Event Planning SIPR Required   
                 </Grid.Column>
             </Grid>
         </Segment>
    
 }

{ activity.copiedTocio && activity.eventPlanningNetworkNIPR &&
   <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={14}>
                 CIO Event Planning NIPR Required   
                 </Grid.Column>
             </Grid>
         </Segment>
}

    {activity.activityRooms && activity.activityRooms.length > 0 
     && includesAny(activity.activityRooms.map(x => x.email), devicesRequiredRooms)
     && activity.roomResourceNipr &&
     <Segment attached>
     <Grid verticalAlign='middle'>
         <Grid.Column width={1}>
         <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
         </Grid.Column>
         <Grid.Column width={14}>
          NIPR Required   
         </Grid.Column>
     </Grid>
    </Segment>
     }

{activity.activityRooms && activity.activityRooms.length > 0 
     && includesAny(activity.activityRooms.map(x => x.email), devicesRequiredRooms)
     && activity.roomResourceSipr &&
     <Segment attached>
     <Grid verticalAlign='middle'>
         <Grid.Column width={1}>
         <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
         </Grid.Column>
         <Grid.Column width={14}>
          SIPR Required   
         </Grid.Column>
     </Grid>
    </Segment>
     }

{activity.activityRooms && activity.activityRooms.length > 0 
     && includesAny(activity.activityRooms.map(x => x.email), devicesRequiredRooms)
     && activity.roomResourceRen &&
     <Segment attached>
     <Grid verticalAlign='middle'>
         <Grid.Column width={1}>
         <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
         </Grid.Column>
         <Grid.Column width={14}>
          REN Required   
         </Grid.Column>
     </Grid>
    </Segment>
     }
    
    {activity.activityRooms && activity.activityRooms.length > 0 
     && includesAny(activity.activityRooms.map(x => x.email), devicesRequiredRooms)
     && activity.roomResourceNtg &&
     <Segment attached>
     <Grid verticalAlign='middle'>
         <Grid.Column width={1}>
         <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
         </Grid.Column>
         <Grid.Column width={14}>
          NTG Required   
         </Grid.Column>
     </Grid>
    </Segment>
     }

{activity.activityRooms && activity.activityRooms.length > 0 
     && includesAny(activity.activityRooms.map(x => x.email), devicesRequiredRooms)
     && activity.roomResourceNts &&
     <Segment attached>
     <Grid verticalAlign='middle'>
         <Grid.Column width={1}>
         <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
         </Grid.Column>
         <Grid.Column width={14}>
          NTS Required   
         </Grid.Column>
     </Grid>
    </Segment>
     }

     
{activity.activityRooms && activity.activityRooms.length > 0 
     && includesAny(activity.activityRooms.map(x => x.email), devicesRequiredRooms)
     && activity.roomResourceOther &&
     <Segment attached>
     <Grid verticalAlign='middle'>
         <Grid.Column width={1}>
         <FontAwesomeIcon icon={faNetworkWired} size='2x' color='#00b5ad'  />
         </Grid.Column>
         <Grid.Column width={14}>
          {activity.roomResourceOtherText }  Resource Required
         </Grid.Column>
     </Grid>
    </Segment>
     }


      

{activityAttachments.map((attachment) => (
        <ActivityAttachmentSideBarComponent key={attachment.id} attachmentActivityId = {attachment.id} fileName = {attachment.fileName}  />
     ))}



</Segment.Group>
    )
})
