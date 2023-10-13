import { Button, Icon, Image } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import TeamsInformation from "./TeamsInformation";
import { UserEmail } from "../../../app/models/userEmail";

interface Props{
  attendees: UserEmail[];
  setAttendees:  (newAttendees: UserEmail[]) => void;
  setTeamMeeting: () => void;
  makeTeamMeeting : boolean;
}



export default function TeamsButton({attendees, setAttendees, setTeamMeeting, makeTeamMeeting} : Props){
    const {modalStore} = useStore();
    const {openModal} = modalStore;
    return(
        <Button
        type="button"
         icon
         labelPosition="left" 
         onClick={() =>
            openModal(
              <TeamsInformation
              attendees={attendees}
              setAttendees={setAttendees}
              setTeamMeeting={setTeamMeeting}
              />, 'large'
            )
          }
       >
         EDU Teams Meeting
         {makeTeamMeeting && <Icon name="check square outline" /> }
         {!makeTeamMeeting && <Icon name="square outline" />}
       </Button>
   
        
    )
}