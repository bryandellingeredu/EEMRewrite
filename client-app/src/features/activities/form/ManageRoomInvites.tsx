import { observer } from "mobx-react-lite";
import { useStore } from "../../../app/stores/store";
import { Button, Confirm, Divider, Grid, Header, Icon, Input, Message, Search, SearchProps, Segment, SegmentGroup } from "semantic-ui-react";
import { UserEmail } from "../../../app/models/userEmail";
import { Fragment, useEffect, useState } from "react";
import agent from "../../../app/api/agent";

interface Props {
  roomAttendees: UserEmail[];
  setRoomAttendees: (newRoomAttendees: UserEmail[]) => void;
  setRoomAttendeesChangedTrue: () => void;
}

export default observer(function ManageRoomInvites({ roomAttendees, setRoomAttendees, setRoomAttendeesChangedTrue }: Props) {
  const { modalStore } = useStore();
  const { closeModal } = modalStore;
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emails, setEmails] = useState<UserEmail[]>([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserEmail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roomAttendeesChanged, setRoomAttendeesChanged] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm); // Updates the debounced value after 300ms
    }, 300);
  
    return () => clearTimeout(handler); // Cleanup function to reset timer
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm === '') {
      setFilteredResults([]);
      return;
    }
  
    const uniqueEmails = Array.from(new Map(emails.map((email) => [email.email.toLowerCase(), email])).values());
  
    const results = uniqueEmails
      .filter((email) => 
        email.displayName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        email.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      .map((email) => ({
        key: email.email,
        title: email.displayName,
        description: email.email,
      }));
  
    setFilteredResults(results.length > 0 ? results : []);
  }, [debouncedSearchTerm, emails]);
  


  // ✅ Local state for attendees
  const [localRoomAttendees, setLocalRoomAttendees] = useState<UserEmail[]>(roomAttendees);

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
  }, []);

  const handleDeleteButton = (user: UserEmail) => {
    setOpenConfirm(true);
    setUserToDelete(user);
  };

  const handleDelete = () => {
    if (userToDelete) {
      setLocalRoomAttendees((prev) => prev.filter((user) => user.email !== userToDelete.email));
      setRoomAttendeesChanged(true)
    }
    setOpenConfirm(false);
  };

  const [filteredResults, setFilteredResults] = useState<{ title: string; description: string }[]>([]);

  const handleSearchChange = (e: React.SyntheticEvent, data: SearchProps) => {
    setSearchTerm(data.value?.trim() || "");
  };

  const handleResultSelect = (e: React.MouseEvent, { result }: SearchProps) => {
    if (!localRoomAttendees.some((att) => att.email === result.description)) {
      setLocalRoomAttendees((prev) => [...prev, { displayName: result.title, email: result.description }]);
      setRoomAttendeesChanged(true);
    }
    setSearchTerm("");
  };

  const addNonEDUUser = () => {
    const displayNameElement = document.getElementById("displayName") as HTMLInputElement;
    const emailElement = document.getElementById("email") as HTMLInputElement;

    const displayName = displayNameElement?.value.trim() || "";
    const email = emailElement?.value.trim() || "";

    if (displayName === "" || email === "") {
      console.log("Display Name and Email cannot be empty");
      return;
    }

    setLocalRoomAttendees((prev) => [...prev, { displayName, email }]);
    setRoomAttendeesChanged(true);
  };

  const handleSaveClick = () => {
    setRoomAttendees(localRoomAttendees); 
    if(roomAttendeesChanged) setRoomAttendeesChangedTrue();
    closeModal();
  };

  return (
    <>
      <Button floated="right" icon size="mini" color="black" compact onClick={closeModal}>
        <Icon name="close" />
      </Button>

      <Divider horizontal color="teal">
        <Header as="h2">
          <Icon name="calendar plus" />
          Invite People To Your Event
        </Header>
      </Divider>

      <SegmentGroup>
        <Segment textAlign="center" color="teal">
          <Header icon color="teal">
            <Icon name="user" />
            Invited Users
          </Header>
        </Segment>

        {localRoomAttendees.length < 1 && (
          <Message warning>
            <Message.Header>This Room Reservation has no Invited Users</Message.Header>
            <p>Would you like to invite someone ?</p>
          </Message>
        )}

        {localRoomAttendees.length > 0 && (
          <Segment.Inline>
            {localRoomAttendees.map((user) => (
              <Fragment key={user.email}>
                <Button icon labelPosition="left" basic color="teal" size="large" onClick={() => handleDeleteButton(user)}>
                  <Icon name="x" color="red" />
                  {`${user.displayName} (${user.email})`}
                </Button>
                <Confirm
                  header="You are about to remove this person from the teams meeting invites"
                  open={openConfirm}
                  onCancel={() => setOpenConfirm(false)}
                  onConfirm={handleDelete}
                />
              </Fragment>
            ))}
          </Segment.Inline>
        )}

        <Segment color="teal">
          <Header icon color="teal" textAlign="center">
            {loadingEmails ? (
              <>
                <Icon name="circle notched" className="spin" />
                <span> Loading EDU Users and Distribution Lists...</span>
              </>
            ) : (
              <>
                <Icon name="plus" />
                <span> Send Invites to armywarcollege.edu emails, start typing in the search box then select </span>
              </>
            )}
          </Header>

          <Search
            fluid
            input={{ fluid: true }}
            loading={loadingEmails}
            disabled={loadingEmails}
            placeholder={loadingEmails ? "Loading..." : "Search for an Edu Attendee..."}
            onSearchChange={handleSearchChange}
            results={filteredResults}
            value={searchTerm}
            onResultSelect={handleResultSelect}
          />
        </Segment>

        <Segment color="teal">
          <Header icon color="teal" textAlign="center">
            <Icon name="envelope" />
            <span> Send Invites to army.mil emails, enter a Display Name and their army.mil email </span>
          </Header>

          <Grid>
            <Grid.Row>
              <Grid.Column width={7}>
                <Input icon="user" iconPosition="left" label={{ tag: true, content: "Name" }} labelPosition="right" placeholder="Enter Display Name" id="displayName" fluid />
              </Grid.Column>
              <Grid.Column width={7}>
                <Input icon="envelope" iconPosition="left" label={{ tag: true, content: "Email" }} labelPosition="right" placeholder="Enter Email" id="email" fluid />
              </Grid.Column>
              <Grid.Column width={2}>
                <Button type="button" circular icon="plus" onClick={addNonEDUUser} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        <Segment clearing>
          <Button floated="right" primary onClick={handleSaveClick} size="large" content="Save and Close" />
        </Segment>
      </SegmentGroup>
    </>
  );
});
