import { faBahai, faBookmark, faBookOpenReader, faBus, faCalendarCheck, faChalkboardTeacher, faDove, faNewspaper, faPeopleGroup, faPersonMilitaryPointing } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Divider, Grid, Header, Icon, Segment, SegmentGroup } from "semantic-ui-react";
import DocumentUploadWidget from "../../../app/common/documentUpload/documentUploadWidget";
import { useStore } from "../../../app/stores/store";




export default function SubCalendarInformation(){
    const { modalStore } = useStore();
    const {closeModal} = modalStore;
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

          <Divider horizontal>
            <Header as="h2">
                <Icon name='info' />     
              EEM Calendars
            </Header>
          </Divider>

          <SegmentGroup>
            <Segment>
          <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='calendar' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Integrated Master Calendar (IMC) </strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 The USAWC enterprise synchronization calendar. Events that affect the entire enterprise or Carlisle Barracks proper. 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='calendar' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>SSL Academic Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 School of Strategic Landpower Academic events which affect or influence the Enterprise. Examples: Noon time lectures, leadership meetings, boatyard wars, RWRC 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                     <Icon name='adn' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Army Strategic Education Program (ASEP) Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by ASEP. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Examples: (internal) Directors Meeting, internal IPRs, personal leaves; (IMC Worthy) ASEP A, NLC, senior spouse course 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faPersonMilitaryPointing} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Command Group Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is a calendar that informs the enterprise of CMDT level events. Enterprise impacting events are added to the IMC. Examples: ARS Europe, Board of Visitors.  
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='copyright' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Center for Strategic Leadership (CSL) Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by CSL. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Examples: (internal) CSL Directors Meeting, Landpower IPR; (IMC Worthy) CJFLCC, JLASS, Joint Overmatch 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='building' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Garrison (USAG) Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by USAG. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Example: (internal) RSO Training, EFMP Coffee, Wing night; (IMC Worthy) FSE, Protection Working Group, USAG Command and staff
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBahai} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>General Interest Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 Events that do not fit on any other calendar yet, have an impact on two or more SCIPs or Staff sections are added to this calendar and IMC. Example: Civilian Employee In-Processing; Multi-Media Curation Display & instruction working group (non-battle rhythm meeting), rehearsal ROC Drill
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='tree' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Holiday Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This calendar is used to place all Federal holidays and Military Training holidays. These events are added to the IMC. Examples: Presidents Day and the associated military training holiday 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='calendar check' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Military Spouse & Family Program (MSFP) Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by MSFP. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. This calendar also can be shone to the internet for anyone to view. Examples: FLAGS workshop, Spouses Reading Program, ELDC-S 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faDove} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Peacekeeping and Stability Operations Institute (PKSOI) Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by PKSOI. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Examples: Holocaust Remembrance Day, Peacekeepers Day 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='glass martini' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Social Events and Ceremonies Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This calendar is used to post Social and Ceremonial events which involve one or more SCIP and/or staff sections. Events that impact the enterprise are added to the IMC. Examples: IHOFs, Excellence in Educator’s Reception, Change of Command, Graduation, Commandant’s Reception, Army Birthday
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faNewspaper} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Strategic Studies Institute SSI And USAWC Press Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by SSI. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Examples: (internal) Directors Meeting, internal IPRs, personal leaves; (IMC Worthy)
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faPeopleGroup} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Symposia and Conferences Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This calendar is for all USAWC hosted symposiums and conferences. Those which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Examples: PLA Conference, USAWC Inaugural Conference on Civil-Military Relations, Strategic Leadership Development (SLD) Forum 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBookmark} size='2x' color='#00b5ad'  />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>School of Strategic Landpower (SSL) Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by SSL. This is also where faculty development events are also posted. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Examples: (internal) Directors Meeting, internal IPRs, Department meetings; (IMC Worthy) BSAP Graduation, Annual Strategy Competition, New Faculty Orientation
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faChalkboardTeacher} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Training Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This calendar is for any training that is occurring in person on Carlisle Barracks. If a training event impacts the USAWC enterprise, the event is added to the IMC. Examples: CES Training, SHARP Training, Full Scale Exercise
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <Icon name='book' size='large' color='teal' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>United States Army and Education Center (USAHEC) Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by USAHEC. Events which warrant a numbered OPORD and events that inform or impact the enterprise would be added to the IMC. Examples: (internal) Senior leaders Meeting, USAHEC All Hands Meeting, time cards due; (IMC Worthy) Educational Program Women’s History- world war women, ROTC Visits, Replica Tomb of the Unknown Soldier Exhibit
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBookOpenReader} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>USAHEC Facilities Usage Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This is an internal calendar used by USAHEC. The primary use is for USAHEC to use this calendar to manage their internal spaces and needs for those who occupy them. 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faBus} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Visits and Staff Rides Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 This calendar is used to reflect all the visits to Carlisle Barracks as well as all the staff rides that the USAWC conducts. If an event warrants a numbered OPORD or events that inform or impact the enterprise, they are added to the IMC. Examples: GEN Flynn Visit, CODEL, SLSRs 
                 </Grid.Column>
             </Grid>
             </Segment>
             <Segment>
             <Grid verticalAlign='middle'>
                 <Grid.Column width={1}>
                 <FontAwesomeIcon icon={faCalendarCheck} size='2x'  color='#00b5ad' />
                 </Grid.Column>
                 <Grid.Column width={3}>
                     <strong>Battle Rhythm Calendar</strong>
                 </Grid.Column>
                 <Grid.Column width={12}>
                 If an event meets the criteria laid out in USAWC Regulation 1-12 (USAWC Battle Rhythm) then it is added to this calendar and the IMC. Examples: COS Synch, G3 Operations Synch, CLIF, Board of Directors 
                 </Grid.Column>
             </Grid>
             </Segment>
          </SegmentGroup>


          </>
          )
        }