import { Button, Icon, Image } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import TeamsInformation from "./TeamsInformation";
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
}


export default function TeamsButton(
  {attendees, setAttendees, setTeamMeeting,
   makeTeamMeeting, teamLink,  teamLookup, teamIsDeleted,
    deleteTeamMeeting, teamAttendeesLoading, id, manageSeries} : Props){
    const {modalStore} = useStore();
    const {openModal} = modalStore;
    return(
        <Button
        type="button"
         icon
         labelPosition="left" 
         disabled={teamIsDeleted}
         loading={teamAttendeesLoading}
         onClick={() =>
            openModal(
              <TeamsInformation
              attendees={attendees}
              setAttendees={setAttendees}
              setTeamMeeting={setTeamMeeting}
              teamLink = {teamLink}
              teamLookup = {teamLookup}
              deleteTeamMeeting = {deleteTeamMeeting}
              id={id}
              manageSeries={manageSeries}
              
              />, 'large'
            )
          }
       >
         EDU Teams Meeting  
         {teamIsDeleted ? (<Icon name="square outline" />) : (
            (makeTeamMeeting || teamLink) ?
             <Icon name="check square outline" /> :
             <Icon name="square outline" />
          )}
       </Button>   
    )
}