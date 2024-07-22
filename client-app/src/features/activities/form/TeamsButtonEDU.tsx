import { Button, Icon, Image } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import TeamsInformationEDU from "./TeamsInformationEDU";
import { UserEmail } from "../../../app/models/userEmail";

interface Props{
  attendees: UserEmail[];
  setAttendees:  (newAttendees: UserEmail[]) => void;
  setTeamMeeting: () => void;
  makeTeamMeeting : boolean;
  teamLink : string;
  teamLookup : string;
  teamIsDeleted : boolean;
  deleteTeamMeeting: () => void;
  teamAttendeesLoading: boolean;
  id: string;
  manageSeries: string;
  teamOwner: string;
  setTeamOwner: (newTeamOwner: string) => void;
  teamOwnerChangeIsDisabled: boolean;
}


export default function TeamsButtonEDU(
  {attendees, setAttendees, setTeamMeeting,
   makeTeamMeeting, teamLink,  teamLookup, teamIsDeleted,
    deleteTeamMeeting, teamAttendeesLoading, id, manageSeries,
    teamOwner, setTeamOwner,  teamOwnerChangeIsDisabled } : Props){
    const {modalStore} = useStore();
    const {openModal} = modalStore;
    return(
        <Button
        primary
        type="button"
         icon
         labelPosition="left" 
         disabled={teamIsDeleted}
         loading={teamAttendeesLoading}
         onClick={() =>
            openModal(
              <TeamsInformationEDU
              attendees={attendees}
              setAttendees={setAttendees}
              setTeamMeeting={setTeamMeeting}
              teamLink = {teamLink}
              teamLookup = {teamLookup}
              deleteTeamMeeting = {deleteTeamMeeting}
              id={id}
              manageSeries={manageSeries}
              teamOwner={teamOwner}
              setTeamOwner={setTeamOwner}
              teamOwnerChangeIsDisabled={teamOwnerChangeIsDisabled}
              />, 'large'
            )
          }
       >
         EDU Teams Meeting  
         {teamIsDeleted ? (<Icon name="square outline" />) : (
            (makeTeamMeeting || teamLink) ?
             <Icon name="check square outline" size="large"/> :
             <Icon name="square outline" size="large" />
          )}
       </Button>   
    )
}