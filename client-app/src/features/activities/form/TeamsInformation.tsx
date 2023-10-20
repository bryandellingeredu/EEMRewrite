import { Button, Divider, Header, Icon, Image, Segment, Search, SegmentGroup, Message, Confirm, ButtonGroup, Loader, Dimmer } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useState, useEffect, Fragment } from "react";
import { UserEmail } from "../../../app/models/userEmail"
import agent from "../../../app/api/agent";
import { SearchProps } from "semantic-ui-react";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import LoadingComponent from "../../../app/layout/LoadingComponent";

interface Props{
    attendees: UserEmail[];
    setAttendees:  (newAttendees: UserEmail[]) => void;
    setTeamMeeting: () => void;
    teamLink : string;
    teamLookup : string;
    deleteTeamMeeting: () => void;
    id: string;
    manageSeries: string;
  }

export default function TeamsInformation(
  {attendees, setAttendees,  setTeamMeeting, teamLink, teamLookup, deleteTeamMeeting, id, manageSeries} : Props)
{
    const {modalStore} = useStore();
    const [section, setSection] = useState(teamLink ? 'showMeeting' : 'addMeeting');
    const [loadingEmails, setLoadingEmails] = useState(true);
    const [emails, setEmails] = useState<UserEmail[]>([]);
    const [attendeesCopy, setAttendeesCopy] = useState<UserEmail[]>([]);  // attendees is not causing modal to re render
    const [searchTerm, setSearchTerm] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserEmail>({displayName: '', email: ''});

    const uniqueDisplayName = new Set();
const uniqueEmail = new Set();
const uniqueEmails : UserEmail[]= [];

emails.forEach(email => {
  if (!uniqueDisplayName.has(email.displayName) && !uniqueEmail.has(email.email)) {
    uniqueDisplayName.add(email.displayName);
    uniqueEmail.add(email.email);
    uniqueEmails.push(email);
  }
});

const source = uniqueEmails.map(email => ({
  title: email.displayName,
  description: email.email,
}));

    useEffect(() => {
        agent.EduEmails.list()
          .then((result) => {
            setEmails(result);
            setLoadingEmails(false);
          })
          .catch((error) => {
            console.error("Error fetching emails:", error);
            setLoadingEmails(false);
          });
          setAttendeesCopy(attendees);
      }, []);

      const handleSearchChange = (e: React.MouseEvent, { value }: SearchProps) => {
        setSearchTerm(value as string);
      };

 

      const handleResultSelect = (e: React.MouseEvent, { result }: SearchProps) => {
        if (!attendeesCopy.some(att => att.email === result.description)) {
          setAttendees([...attendeesCopy, { displayName: result.title, email: result.description }]);
          setAttendeesCopy([...attendeesCopy, { displayName: result.title, email: result.description }]);
        }
        setSearchTerm('');
      };

      const handleDeleteButton = (user: UserEmail) => {
        setOpenConfirm(true);
        setUserToDelete(user);
    }

    const handleDeleteTeamConfirmClick = () =>{
      deleteTeamMeeting();
      modalStore.closeModal();
    }

    const handleSaveClick = () =>{
        setTeamMeeting();
        modalStore.closeModal()
    }

    const handleDelete = () => {
        setOpenConfirm(false);
        const filteredAttendees = attendeesCopy.filter((user) => user.email !== userToDelete.email);
        setAttendees(filteredAttendees);
        setAttendeesCopy(filteredAttendees);
      };

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
      <Image  src={`${process.env.PUBLIC_URL}/assets/teams.svg`}  />
      {!teamLink && 
        <Header.Content>
          Add an EDU Teams Meeting to this Event.
          <Header.Subheader>This will create an EDU Teams Meeting, You Can Not Create
            an Army Teams Meeting from the EEM.
          </Header.Subheader>
        </Header.Content>
      }
        {teamLink && 
        <Header.Content>
          EDU Teams Meeting
          <Header.Subheader>View and Edit this Teams Meeting</Header.Subheader>
        </Header.Content>
      }
      </Header>

      <Divider />
      {section === 'deleteMeeting' &&
        <Segment textAlign="center">
          <Button.Group size="massive">
        <Button
         color = 'red'
         onClick={handleDeleteTeamConfirmClick}
        >
          {id && manageSeries && manageSeries === "true" ?
          'I Am Sure I Want To Delete All Teams Meeting for this Series' :
          'I Am Sure I Want To Delete This Teams Meeting'}
          </Button>
        <Button.Or />
        <Button  onClick={() => setSection('showMeeting')}>Cancel</Button>
      </Button.Group>
    </Segment>
      }
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
         <Button color='teal'
         onClick={() => setSection('addAttendees')}
         >
           View / Edit Team Invites
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
     onClick={() => setSection('needAttendees')}
    >I Want to Add a Teams Meeting</Button>
    <Button.Or />
    <Button  onClick={() => modalStore.closeModal()}>Cancel</Button>
  </Button.Group>
</Segment>
   }
    {section === 'needAttendees' && 
      <Segment textAlign="center">
      <Button.Group size="massive">
    <Button
     positive
     onClick={() => setSection('addAttendees')}
    >I Want to Invite People</Button>
    <Button.Or />
    <Button  onClick={handleSaveClick}>I Do not Need to Invite People</Button>
  </Button.Group>
</Segment>
   }
    {section === 'addAttendees' && 
    <SegmentGroup>
         <Segment textAlign="center" color="teal">
         <Header icon color="teal">
                <Icon name="user" />
                Invited EDU Users
              </Header>
         </Segment>
         {attendeesCopy.length < 1 &&
                     <Message warning>
                     <Message.Header>
                      This EDU Teams Meeting has no Invited Users
                       
                     </Message.Header>
                     <p>Would you like to Invite an EDU user?</p>
                   </Message>
              }
              {attendeesCopy.length > 0 &&
                 <Segment.Inline>
                       { attendeesCopy.map((user) => (
                          <Fragment key={uuid()}>
                          <Button
                            icon
                            labelPosition="left"
                            basic
                            color="teal"
                            size="large"
                            onClick={() => handleDeleteButton(user)}
                          >
                            <Icon name="x" color="red" />
                            {`${user.displayName} (${user.email})`}
                          </Button>
                          <Confirm
                            header="You are about to remove this person from the teams meeting invites"
                            open={openConfirm}
                            onCancel={() => setOpenConfirm(false)}
                            onConfirm={() => handleDelete()}
                          />
                        </Fragment>
                      ))}
                 </Segment.Inline>
              }
   <Segment color='teal'>
  
    <>
    <Header icon color="teal" textAlign="center">
      {loadingEmails ? (
        <>
        <Icon name="circle notched" className="spin" />
        <span> Loading EDU Users and Distribution Lists...</span>
        </>
      ) : (
        <>
        <Icon name="plus" />
        <span> Invite EDU users, Start Typing in the Search Box then Select </span>
        </>
      )}
     
    </Header>
        
    <Search
        fluid
        input={{ fluid: true }}
        loading={loadingEmails}
        disabled={loadingEmails}
        placeholder={loadingEmails ? 'Loading...' : 'Search for an Edu Attendee...'}
        onSearchChange={handleSearchChange}
        results={source.filter(result =>
          result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.description.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        value={searchTerm}
        onResultSelect={handleResultSelect}
      />
      </>
        

      </Segment>
      <Segment clearing>
        <Button floated="right" primary onClick={handleSaveClick} size='large'content='Save and Close'/>
      </Segment>
      </SegmentGroup>
     }
        </>
    )
}