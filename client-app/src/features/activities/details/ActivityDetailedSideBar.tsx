
import { Segment, Icon, Grid, List } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'
import { Activity } from '../../../app/models/activity'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBahai, faBookmark, faBookOpenReader, faBuilding, faBus, faCalendar, faCalendarWeek, faChalkboardTeacher, faCheck, faChurch, faComputer, faDove, faFax, faGraduationCap, faHashtag, faIdCard, faNewspaper, faP, faPalette, faPeopleGroup, faPeopleRoof, faPersonMilitaryPointing, faPersonRifle, faShieldHalved, faSitemap, faSquareParking, faUserSecret } from '@fortawesome/free-solid-svg-icons';

interface Props {
    activity: Activity
}

export default observer(function ActivityDetailedSidebar ({activity}: Props) {
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
                   Added to the Academic IMC Calendar
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

{activity.copiedTochapel &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faChurch} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '25px'}}>
                   Added to the Chapel Calendar
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

{activity.copiedTocomplementary &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='star' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to the Complementary Events Calendar
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
                   Added to the Community Relations Calendar
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
                   Added to the SSL Calendar
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
                   Added to Training & Misc Events Calendar
                 </Grid.Column>
             </Grid>
 </Segment>
 }

{activity.copiedTousahec &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='book' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={14}>
                   Added to USAHEC Calendar
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
                   Added to the USAHEC Facilities Usage Calendar
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

{activity.copiedToweeklyPocket &&
             <Segment attached>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCalendarWeek} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={14} style={{paddingLeft: '20px'}}>
                   Added to the Weekly Pocket Calendar
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

</Segment.Group>
    )
})
