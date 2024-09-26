import { Button, Divider, Header, Icon, Image, Segment, Search, SegmentGroup, Message, Confirm, ButtonGroup, Loader, Dimmer, Input, Grid, TextArea } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useState, useEffect, Fragment} from "react";
import { UserEmail } from "../../../app/models/userEmail"
import agent from "../../../app/api/agent";
import { SearchProps } from "semantic-ui-react";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { setMaxListeners } from "events";

interface Props{
    attendees: UserEmail[];
    setAttendees:  (newAttendees: UserEmail[]) => void;
    setTeamMeeting: () => void;
    teamLink : string;
    teamLookup : string;
    deleteTeamMeeting: () => void;
    id: string;
    manageSeries: string;
    teamOwner: string;
    setTeamOwner: (newTeamOwner: string) => void;
    teamOwnerChangeIsDisabled: boolean;
    title: string
    hyperlinkEDUTeams: string
    updateHyperlinkEDUTeams: (newHyperlinkEDUTeams: string) => void;

  }

export default function TeamsInformationEDU(
  {attendees, setAttendees,  setTeamMeeting, teamLink, teamLookup, deleteTeamMeeting, id, manageSeries,
     teamOwner, setTeamOwner, teamOwnerChangeIsDisabled, title, hyperlinkEDUTeams, updateHyperlinkEDUTeams} : Props)
{
    const {modalStore} = useStore();
    const [section, setSection] = useState((teamLink || hyperlinkEDUTeams) ? 'showMeeting' : 'addMeeting');
    const [loadingEmails, setLoadingEmails] = useState(true);
    const [emails, setEmails] = useState<UserEmail[]>([]);
    const [attendeesCopy, setAttendeesCopy] = useState<UserEmail[]>([]);  // attendees is not causing modal to re render
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserEmail>({displayName: '', email: ''});
    const [error, setError] = useState(false);
    const [localHyperlinkEDUTeams, setLocalHyperlinkEDUTeams] = useState(hyperlinkEDUTeams);


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
  if(teamOwner) setSearchTerm2(teamOwner)
}, [teamOwner])

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

      const handleSearchChange2 = (e: React.MouseEvent<HTMLElement>, { value }: SearchProps) => {
        setSearchTerm2(value as string);
      };

      const handleResultSelect2 = (e: React.MouseEvent, { result }: SearchProps) => {
        setSearchTerm2(result.description);
      };


      const addNonEDUUser = () => {
        const displayNameElement = document.getElementById('displayName') as HTMLInputElement;
        const emailElement = document.getElementById('email') as HTMLInputElement;
      
        const displayName = displayNameElement ? displayNameElement.value : '';
        const email = emailElement ? emailElement.value : '';
    
        // Check for empty inputs
        if (displayName.trim() === '' || email.trim() === '') {
          console.log('Display Name and Email cannot be empty');
          return;
        }
    
        const isDuplicate = attendeesCopy.some(
          attendee => attendee.email === email
        );

        if (!isDuplicate) {
          const newAttendee = { displayName: displayName, email: email };
          setAttendees([...attendeesCopy, newAttendee]);
          setAttendeesCopy([...attendeesCopy, newAttendee]);
        } else {
          console.log('Attendee already exists');
        }
        if (displayNameElement) displayNameElement.value = '';
        if (emailElement) emailElement.value = '';
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
        if(teamLink) setUserToDelete(user);
    }

    const handleDeleteTeamConfirmClick = () =>{
      if(teamLink) deleteTeamMeeting();
      if(hyperlinkEDUTeams || localHyperlinkEDUTeams) updateHyperlinkEDUTeams('');
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
         window.open(teamLink || hyperlinkEDUTeams, "_blank");
         modalStore.closeModal();
      }

      const handleSaveHyperlinkEDUTeams = () => {
        if (!localHyperlinkEDUTeams) {
            setError(true);
        } else {
            setError(false);
            updateHyperlinkEDUTeams(localHyperlinkEDUTeams);
            toast.success('Team Link copied to the EEM', {
              position: toast.POSITION.TOP_CENTER
            });
            modalStore.closeModal();
        }
    };


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
      {!teamLink && !hyperlinkEDUTeams &&
        <Header.Content>
          Add an EDU Teams Meeting to this Event.
          <Header.Subheader>This will create an EDU Teams Meeting
          </Header.Subheader>
        </Header.Content>
      }
        {(teamLink || hyperlinkEDUTeams) && 
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
  navigator.clipboard.writeText(teamLink || hyperlinkEDUTeams)
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

      {teamLink && 
         <Button color='teal'
         onClick={() => setSection('addAttendees')}
         >
           View / Edit Team Invites
         </Button>
      }
  
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
     onClick={() => setSection('typeOfMeeting')}
    >I Want to Add an EDU Teams Meeting</Button>
    <Button.Or />
    <Button  onClick={() => modalStore.closeModal()}>Cancel</Button>
  </Button.Group>
</Segment>
   }

   {section === 'typeOfMeeting' && 
     <Segment textAlign="center">
        <Button.Group size="massive">
        <Button.Group size="massive">
         <Button
           positive
     onClick={() => setSection('addOwner')}
    >Auto Create Teams Meeting</Button>
    <Button.Or />
    <Button  onClick={() => setSection('addHyperlink')}>
    Add Existing Teams Link
      </Button>
  </Button.Group>
        </Button.Group>
     </Segment>
   }

   {section === 'addHyperlink' &&
     <SegmentGroup>
     <Segment textAlign="center" color="teal">
     <Header icon color="teal">
       <Icon name="paste" />
            Paste an EDU Teams Join Link
       </Header>
       <Message info>
        <h3>
        After manually creating an EDU Teams Meeting for <span>{title}</span> in EDU Teams, or EDU Outlook,  copy and paste 
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
         Paste the EDU Teams Join Link
        </h3>    
       </Message>
       <TextArea 
    placeholder='Paste the team link here' 
    rows={4} 
    style={{ width: '100%', borderColor: error ? 'red' : undefined }} 
    value={localHyperlinkEDUTeams}
    onChange={(e, { value }) => setLocalHyperlinkEDUTeams(String(value))} // Explicitly convert value to string
/>
{error && <div style={{ color: 'red' }}>Please enter a team link.</div>}
       </Segment>
       <Segment clearing>
        <Button floated="right" type="button" primary onClick={handleSaveHyperlinkEDUTeams} size='large'content='Save and Close'/>
      </Segment>
     </SegmentGroup>
   }


    {section === 'addOwner'  && 
    <SegmentGroup >
      <Segment >
        <Header as ='h2' textAlign="center">
          <Header.Content>
          EDU Team Meeting Owner
          </Header.Content>
        <Header.Subheader >
          Enter a valid EDU email to be the owner of this Team Meeting. 
        </Header.Subheader>
        </Header>
      
      </Segment>
      
  <Segment textAlign="center" color='teal' >
  <Search
          icon='user'
           iconPosition='left'
            label={{ tag: true, content: 'Add an EDU Teams Owner' }}
    labelPosition='right'
        fluid
        input={{ fluid: true }}
        loading={loadingEmails}
        disabled={loadingEmails}
        placeholder={loadingEmails ? 'Loading...' : 'Add an EDU Teams Owner...'}
        onSearchChange={handleSearchChange2}
        results={source.filter(result =>
          result.title.toLowerCase().includes(searchTerm2.toLowerCase()) ||
          result.description.toLowerCase().includes(searchTerm2.toLowerCase())
        )}
        value={searchTerm2}
        onResultSelect={handleResultSelect2}
      />

  </Segment>
       <Segment clearing>
     <Button size="massive" floated="right"
      loading={loadingEmails && !searchTerm2}
      disabled={ !searchTerm2.endsWith('armywarcollege.edu') }
      positive
      onClick={() => {setTeamOwner(searchTerm2); setSection('needAttendees')}}
     >Continue</Button>
 </Segment>
 </SegmentGroup>
    }


    {section === 'needAttendees' && 
      <Segment textAlign="center"  >
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
      <Segment color='teal'>
      <Header icon color="teal" textAlign="center">
      <Icon name="envelope" />
      <span> Invite Non EDU users, Enter a Display Name, and an Email </span>
      </Header>
      <Grid>
        <Grid.Row>
          <Grid.Column width={7}>
            <Input
              icon='user'
              iconPosition='left'
              label={{ tag: true, content: 'Name' }}
              labelPosition='right'
              placeholder='Enter Display Name'
              id="displayName"
              fluid
            />
          </Grid.Column>
          <Grid.Column width={7}>
            <Input
              icon='envelope'
              iconPosition='left'
              label={{ tag: true, content: 'Email' }}
              labelPosition='right'
              placeholder='Enter Email'
              id="email"
              fluid
            />
          </Grid.Column>
          <Grid.Column width={2}>
            <Button 
              type="button" 
              circular 
              icon='plus' 
              onClick={addNonEDUUser}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      </Segment>
      <Segment clearing>
        <Button floated="right" primary onClick={handleSaveClick} size='large'content='Save and Close' />
      </Segment>
      </SegmentGroup>
     }
        </>
    )
}