import { Button, Header, Icon, Segment, SegmentGroup } from "semantic-ui-react"

interface EventInfo{
    title: string
    time: string
    location: string
    description: string
    leadOrg: string
    actionOfficer: string
    actionOfficerPhone: string
    mandatory: boolean
    presenter: string
    uniform: string
    notes: string
    hyperLink: string
    hyperLinkDescription: string
    teamLink: string
    studentType: string,
    internationalFellowsStaffEventCategory: string
  }

  interface Props {
    eventInfo: EventInfo
    setShowDetailsFalse: () => void;
}

export default function InternationalFellowsEventDetails({eventInfo, setShowDetailsFalse} : Props) {
    return(
        <>
         <SegmentGroup>
         <Segment>
            <Button basic color="teal" onClick={setShowDetailsFalse} type='button' >
                <Icon name="arrow left" /> Back To Calendar
            </Button>
            <Header textAlign="center">
                <Header.Content>
                    {eventInfo.title}
                </Header.Content>
                <Header.Subheader>
                    {eventInfo.time}
                </Header.Subheader>
            </Header>
           </Segment>
           <Segment>
             <strong>Category:</strong> {eventInfo.studentType}
          </Segment>
          <Segment>
            <strong>Location:</strong> {eventInfo.location}
         </Segment>
         {eventInfo.hyperLink && 
        <Segment> 
            <a href={eventInfo.hyperLink} className="ui orange button" target="_blank">
                {eventInfo.hyperLinkDescription.length > 500 
                ? `${eventInfo.hyperLinkDescription.substring(0, 500)}...` 
                : eventInfo.hyperLinkDescription}
            </a>
        </Segment>
         }
         {eventInfo.teamLink && 
            <Segment> 
                <a href={eventInfo.teamLink} className="ui teal button" target="_blank">
                    Join Team Meeting
                </a>
            </Segment>
        }
        <Segment>
            <strong>Description:</strong> {eventInfo.description}
        </Segment>
        {eventInfo.leadOrg &&  <Segment><strong>Lead Org: </strong>{eventInfo.leadOrg}</Segment>}
        {eventInfo.actionOfficer &&  <Segment><strong>Action Officer: </strong>{eventInfo.actionOfficer}</Segment>}
        {eventInfo.actionOfficerPhone &&  <Segment><strong>Action Officer Phone: </strong>{eventInfo.actionOfficerPhone}</Segment>}
        {eventInfo.mandatory && <Segment><strong>Attendance is mandatory </strong></Segment>}
        {eventInfo.presenter && <Segment><strong>Presenter: </strong>{eventInfo.presenter}</Segment>}
        {eventInfo.uniform && <Segment><strong>Uniform: </strong>{eventInfo.uniform}</Segment>}
        {eventInfo.notes && <Segment><strong>Notes: </strong>{eventInfo.notes}</Segment>}
        {eventInfo.internationalFellowsStaffEventCategory && <Segment><strong>Staff Category:
             </strong>{eventInfo.internationalFellowsStaffEventCategory === 'Leave/TDY' ? 'Leave' : eventInfo.internationalFellowsStaffEventCategory }</Segment>}
        <Segment>
       <Button basic color="teal" onClick={setShowDetailsFalse} type='button' >
                        <Icon name="arrow left" /> Back To Calendar
                    </Button>
        </Segment>
         </SegmentGroup>
        </>
    )
}