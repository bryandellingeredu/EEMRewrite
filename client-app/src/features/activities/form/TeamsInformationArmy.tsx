import { useState } from "react";
import { useStore } from "../../../app/stores/store";
import { Button, ButtonGroup, Divider, Header, Icon, Input, Message, Segment, SegmentGroup, TextArea } from "semantic-ui-react";
import { toast } from "react-toastify";

interface Props{
    allDayEvent: boolean
    start: Date
    end: Date
    title: string
    armyTeamLink: string
    updateArmyTeamLink : (newTeamLink: string) => void;
    recurrenceInd: boolean
}

export default function TeamsInformationArmy({allDayEvent, start, end, title, armyTeamLink, updateArmyTeamLink, recurrenceInd}: Props){
    const [teamLink, setTeamLink] = useState(armyTeamLink);
    const [error, setError] = useState(false);
    const {modalStore} = useStore();
    const [section, setSection] = useState(teamLink ? 'showMeeting' :
    recurrenceInd ? 'addJoinLink' : 'addMeeting');
    const [myPowerAppUrl, setMyPowerAppUrl] = useState('');
    const url = "https://play.apps.appsplatform.us/play/e/default-fae6d70f-954b-4811-92b6-0530d6f84c43/a/acc5bdd2-e83e-4b00-82de-87db02ca9bd4?tenantId=fae6d70f-954b-4811-92b6-0530d6f84c43";
    const openPowerApps = () => {
        let powerAppUrl = url;
        const startYear = start.getFullYear();
        const startMonth = start.getMonth() + 1;
        const startDay = start.getDate();
        const startHours24 = start.getHours(); 
        const startMinutes = start.getMinutes();
        const startHours12 = startHours24 % 12 || 12;
        const formattedStartMinutes = startMinutes < 10 ? '0' + startMinutes : startMinutes;
        const startAMPM = startHours24 >= 12 ? 'true' : 'false';
    
        const endYear = end.getFullYear();
        const endMonth = end.getMonth() + 1;
        const endDay = end.getDate();
        const endHours24 = end.getHours(); 
        const endMinutes = end.getMinutes();
        const endHours12 = endHours24 % 12 || 12;
        const formattedEndMinutes = endMinutes < 10 ? '0' + endMinutes : endMinutes;
        const endAMPM = endHours24 >= 12 ? 'true' : 'false';
    
        const formattedAllDayEvent = allDayEvent ? 'true' : 'false';
        const encodedTitle = encodeURIComponent(title);
    
        powerAppUrl += `&AllDayEvent=${formattedAllDayEvent}`;
        powerAppUrl += `&StartMonth=${startMonth}&StartDay=${startDay}&StartYear=${startYear}&StartHour=${startHours12}&StartMinute=${formattedStartMinutes}&StartAMPM=${startAMPM}`;
        powerAppUrl += `&EndMonth=${endMonth}&EndDay=${endDay}&EndYear=${endYear}&EndHour=${endHours12}&EndMinute=${formattedEndMinutes}&EndAMPM=${endAMPM}`;
        powerAppUrl += `&Title=${encodedTitle}`;
        setMyPowerAppUrl(powerAppUrl);
        const newWindow = window.open(powerAppUrl, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null; 
    };

    const handleSaveClick = () => {
      if (!teamLink) {
          setError(true);
      } else {
          setError(false);
          updateArmyTeamLink(teamLink);
          toast.success('Team Link copied to the EEM', {
            position: toast.POSITION.TOP_CENTER
          });
          modalStore.closeModal();
      }
  };

  const deleteTeamMeeting = () => {
    updateArmyTeamLink('');
    toast.success('Team Link removed from the EEM', {
      position: toast.POSITION.TOP_CENTER
    });
    modalStore.closeModal();
  }

  const handleGoToTeamsClick = () => {
    window.open(teamLink, "_blank");
    modalStore.closeModal();
 }
    return(
         <>
         <Button
        floated="right"
        icon
        size="mini"
        color="black"
        compact
        onClick={() => modalStore.closeModal()}
      >
        <Icon name="close" />
      </Button>
      <Header as="h2">
      {!teamLink && 
      <Header.Content>
          Add or Associate an Army Teams Meeting to this Event.
          <Header.Subheader>This will create or associate an Army Teams Meeting
          </Header.Subheader>
        </Header.Content>
       }
        {teamLink && 
        <Header.Content>
          Army Teams Meeting
          <Header.Subheader>View and Edit this Army Teams Meeting</Header.Subheader>
        </Header.Content>
      }
      </Header>
      <Divider />

      {section === 'showMeeting' &&
        <Segment textAlign="center">
          <ButtonGroup size='massive'>
           <Button primary onClick={handleGoToTeamsClick}>
           Join Team Meeting
         </Button>
         <Button secondary onClick={() => {
  navigator.clipboard.writeText(teamLink)
    .then(() => {
      toast.success('Team Link copied to clipboard', {
        position: toast.POSITION.TOP_CENTER
      });
    })
    .catch(err => {
      toast.error('Failed to copy link: ' + err, {
        position: toast.POSITION.TOP_CENTER
      });
    });
}}>
  Copy Team Link
</Button>
         <Button color='red' onClick={() => setSection('deleteMeeting')}>
           Delete
         </Button>
       </ButtonGroup>
        </Segment>
      }


      {section === 'addMeeting' && 
      <Segment textAlign="center">
      <Button.Group size="massive">
    <Button
     positive
     onClick={() => setSection('addOrAssociate')}
    >I Want to Add or Associate an Army Teams Meeting</Button>
    <Button.Or />
    <Button  onClick={() => modalStore.closeModal()}>Cancel</Button>
  </Button.Group>
</Segment>
   }
        {section === 'addOrAssociate' && 
      <Segment textAlign="center">
      <Button.Group size="massive">
    <Button
     positive
     onClick={() => setSection('areYouOnNipr')}
    >Create a New Teams Meeting</Button>
    <Button.Or />
    <Button   onClick={() => setSection('addJoinLink')}>
     Associate an Existing Teams Meeting
    </Button>
  </Button.Group>
</Segment>
   }
    {section === 'areYouOnNipr' && 
      <Segment textAlign="center">
      <Button.Group size="massive">
    <Button
     positive
     onClick={() => setSection('onNipr')}
    >I'm connected to the NIPR or AVD</Button>
    <Button.Or />
    <Button   onClick={() => setSection('addJoinLink')}>
     I'm NOT connected to the NIPR or AVD
    </Button>
  </Button.Group>
</Segment>
   }
      {section === 'onNipr' && 
      <Segment textAlign="center">
      <Button.Group size="massive">
    <Button
     positive
     onClick={() => setSection('powerApp')}
    >Create a Teams Meeting For Me</Button>
    <Button.Or />
    <Button   onClick={() => setSection('addJoinLink')}>
     I'll Make My Own Meeting
    </Button>
  </Button.Group>
</Segment>
   }
      {section === 'deleteMeeting' &&
       <SegmentGroup>
        <Segment textAlign="center">
          <Header icon color="teal">
          <Icon name="trash" />
          Delete a Teams Meeting
          </Header>
          <Message info>
        <h3>
         <strong>Deleting an Army Team Meeting in the EEM will 
          NOT Delete the meeting in Outlook.
         </strong>
         <p>First Delete the Army Team Meeting in Outlook.</p>
         <p> Then press the 
          delete button below to remove the Team Meeting from the EEM.</p>
          <p>Finally click the Save Button on the Event Form To save your changes.</p>  
        </h3> 
       </Message>
       </Segment>
       <Segment clearing>
        <Button floated="right" primary onClick={deleteTeamMeeting} size='large' color='red' content = 'Delete Team Meeting' type="button"/>
      </Segment>
       </SegmentGroup>
      }
     {section === 'powerApp' && 
    <SegmentGroup>
       <Segment textAlign="center" color="teal">
       <Header icon color="teal">
       <Icon name="plus" />
       Create a Teams Meeting For Me
       </Header>
       <Message info>
        <h3>
        This process will open a new window where you may invite Army 
            attendees. After submission please copy the team link
            and paste it into the Team Link Input Box.
        </h3>
           
       </Message>
        <Button onClick={openPowerApps} size="massive" secondary
         content="Create a Teams Meeting For Me"/>
       </Segment>
       <Segment textAlign="center" color="teal">
       <Header icon color="teal">
       <Icon name="paperclip" />
       Paste Team Link
       </Header>
       <Message info>
        <h3>
         After your team is created paste the team link
        </h3>    
       </Message>
       <TextArea 
    placeholder='Paste the team link here' 
    rows={4} 
    style={{ width: '100%', borderColor: error ? 'red' : undefined }} 
    value={teamLink}
    onChange={(e, { value }) => setTeamLink(String(value))} // Explicitly convert value to string
/>
{error && <div style={{ color: 'red' }}>Please enter a team link.</div>}
       </Segment>
       <Segment clearing>
        <Button floated="right" primary onClick={handleSaveClick} size='large'content='Save and Close' type="button"/>
      </Segment>
      {/*
      <Segment>
        {myPowerAppUrl}
      </Segment>
    */}
    </SegmentGroup>
   }
   {section === 'addJoinLink' &&
   <SegmentGroup>
     <Segment textAlign="center" color="teal">
     <Header icon color="teal">
       <Icon name="paste" />
            Paste an Army Teams Join Link
       </Header>
       <Message info>
        <h3>
        After manually creating an Army Teams Meeting for <span>{title}</span> in Army Teams, or Army Outlook,  copy and paste 
        the Join Link into the Team Link Input Box.
        </h3>       
       </Message>
     </Segment>
     <Segment textAlign="center" color="teal">
       <Header icon color="teal">
       <Icon name="paperclip" />
       Paste Team Link
       </Header>
       <Message info>
        <h3>
         Paste the Army Teams Join Link
        </h3>    
       </Message>
       <TextArea 
    placeholder='Paste the team link here' 
    rows={4} 
    style={{ width: '100%', borderColor: error ? 'red' : undefined }} 
    value={teamLink}
    onChange={(e, { value }) => setTeamLink(String(value))} // Explicitly convert value to string
/>
{error && <div style={{ color: 'red' }}>Please enter a team link.</div>}
       </Segment>
       <Segment clearing>
        <Button floated="right" type="button" primary onClick={handleSaveClick} size='large'content='Save and Close'/>
      </Segment>
     </SegmentGroup>
   }
    </>)
}