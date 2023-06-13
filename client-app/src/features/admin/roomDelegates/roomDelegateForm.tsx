import { observer } from "mobx-react-lite";
import { NavLink, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Divider,
  Form,
  Header,
  Icon,
  Label,
  Message,
  Segment,
  SegmentGroup,
  Confirm,
} from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { Fragment, useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { RoomDelegate } from "../../../app/models/roomDelegate";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Login, PeoplePicker, UserType } from "@microsoft/mgt-react";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import { Providers, ProviderState } from "@microsoft/mgt";

function useIsSignedIn(): [boolean] {
  const [isSignedIn, setIsSignedIn] = useState(true);
  useEffect(() => {
    const updateState = () => {
      const provider = Providers.globalProvider;
      setIsSignedIn(provider && provider.state === ProviderState.SignedIn);
    };

    Providers.onProviderUpdated(updateState);
    updateState();

    return () => {
      Providers.removeProviderUpdatedListener(updateState);
    };
  }, []);
  return [isSignedIn];
}

interface PeoplePickerSelection {
  selectedPeople: any[];
}

export default observer(function RoomDelegateForm() {
  const [isSignedIn] = useIsSignedIn();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { graphRoomStore } = useStore();
  const { graphRooms, loadGraphRooms } = graphRoomStore;
  const [loading, setLoading] = useState(true);
  const [roomDelegates, setRoomDelegates] = useState<RoomDelegate[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [peoplePickerKey, setPeoplePickerKey] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string>('');

     const handleDeleteButton = (userId: string) => {
        setOpenConfirm(true);
        setUserToDelete(userId);
    }

  const handleDelete = async () => {
    try {
      setOpenConfirm(false);
      setDeleting(true);
      agent.RoomDelegates.delete(userToDelete).then(() => {
        toast.success("Row has been deleted");
        setDeleting(false);
        setRoomDelegates(roomDelegates.filter((x) => x.id !== userToDelete));
      });
    } catch (error) {
      console.log(error);
      setDeleting(false);
      toast.error("An error occured during deleting please try again");
    }
  };

  const handleSelectionChanged = (event: any) => {
    console.log(event.detail[0]);
    if (event.detail[0]) {
      setDisplayName(event.detail[0].displayName);
      setEmail(event.detail[0].scoredEmailAddresses[0].address);
      setSelectedPerson(event.detail[0]);
      setNameError(false);
      setEmailError(false);
    } else {
      setDisplayName("");
      setEmail("");
      setSelectedPerson(null);
    }
  };

  const handleDisplayNameInputChange = (event: any) => {
    setDisplayName(event.target.value);
    setNameError(false);
  };

  const handleEmailInputChange = (event: any) => {
    setEmail(event.target.value);
    setEmailError(false);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    let error = false;
    if (!displayName) {
      error = true;
      setNameError(true);
    }
    if (!email) {
      error = true;
      setEmailError(true);
    }
    if (!error) {
      setSaving(true);
      const roomDelegate: RoomDelegate = {
        id: uuid(),
        delegateEmail: email,
        delegateDisplayName: displayName,
        roomEmail: graphRooms.find((y) => y.id === id)!.emailAddress,
      };
      agent.RoomDelegates.create(roomDelegate)
        .then(() => {
          setRoomDelegates([...roomDelegates, roomDelegate]);
          setSelectedPerson(null);
          setPeoplePickerKey(peoplePickerKey + 1);
          setEmail("");
          setDisplayName("");
          toast.success(" Save Successfull");
          setSaving(false);
        })
        .catch((error) => {
          console.error(error);
          toast.error(" Something Went Wrong During Save Please Try Again");
          setSaving(false);
        });
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!graphRooms || graphRooms.length === 0) {
      loadGraphRooms().then((grooms) => {
        agent.RoomDelegates.list()
          .then((response) => {
            setRoomDelegates(response);
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
          });
      });
    } else {
      agent.RoomDelegates.list()
        .then((response) => {
          setRoomDelegates(response);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }
  }, []);

  return (
    <>
      {!isSignedIn && (
        <>
          <Message
            size="massive"
            warning
            header="You Must Sign Into EDU"
            content="To manage room delegates you must have an edu account,
        and you must signed in to your edu account."
          />
          <Login />
        </>
      )}

      {isSignedIn && loading && (
        <LoadingComponent content="Loading Room Delegate Information" />
      )}
      {isSignedIn && !loading && (
        <>
          <Divider horizontal>
            <Header as="h2">
              <Icon name="configure" />
              Manage Room Delegates
            </Header>
          </Divider>
          <SegmentGroup>
            <Segment clearing>
              <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/roomDelegateTable`}
                icon
                labelPosition="left"
                basic
                color="teal"
                size="large"
              >
                <Icon name="backward" />
                Back To Table
              </Button>
            </Segment>

            <Segment textAlign="center" color="teal">
              <Header icon color="teal">
                <Icon name="user" />
                Room Delegate/s For{" "}
                {graphRooms.find((x) => x.id === id)?.displayName}
              </Header>
              {!!roomDelegates.find(
                (x) =>
                  x.roomEmail ===
                  graphRooms.find((y) => y.id === id)?.emailAddress
              ) && (
                <Segment.Inline>
                  {roomDelegates
                    .filter(
                      (x) =>
                        x.roomEmail ===
                        graphRooms.find((x) => x.id === id)?.emailAddress
                    )
                    .map((delegate) => (
                      <Fragment key={uuid()}>
                        <Button
                          icon
                          labelPosition="left"
                          basic
                          color="teal"
                          size="large"
                          onClick={() => handleDeleteButton(delegate.id)}
                          loading={deleting}
                        >
                          <Icon name="x" color="red" />
                          {delegate.delegateDisplayName}
                        </Button>
                        <Confirm
                          header="You are about to delete this room delegate"
                          open={openConfirm}
                          onCancel={() => setOpenConfirm(false)}
                          onConfirm={() => handleDelete()}
                        />
                      </Fragment>
                    ))}
                </Segment.Inline>
              )}
              {!roomDelegates.find(
                (x) =>
                  x.roomEmail ===
                  graphRooms.find((y) => y.id === id)?.emailAddress
              ) && (
                <Message warning>
                  <Message.Header>
                    {" "}
                    {graphRooms.find((x) => x.id === id)?.displayName} Has no
                    Room Delegates
                  </Message.Header>
                  <p>Would you like to Add a room delegate?</p>
                </Message>
              )}
            </Segment>
            <Segment color="teal" clearing>
              <Header icon color="teal" textAlign="center">
                <Icon name="plus" />
                Add a New Room Owner
              </Header>
              <Form onSubmit={handleSubmit}>
                <Form.Field>
                  <label>
                    Use the People Picker Below, or Type Your Own Values:
                  </label>
                  <PeoplePicker
                    selectionMode="single"
                    selectionChanged={handleSelectionChanged}
                    key={peoplePickerKey}
                    userType={UserType.user}
                  />
                </Form.Field>
                <Form.Field>
                  <Form.Input
                    placeholder="The Display Name for the Room Delegate"
                    value={displayName}
                    onChange={handleDisplayNameInputChange}
                    label="Room Delegate Name:"
                    error={nameError}
                  />
                  {nameError && (
                    <Label basic color="red">
                      Room Delegate Name is Required
                    </Label>
                  )}
                </Form.Field>
                <Form.Field>
                  <Form.Input
                    placeholder="The Email for the Room Delegate"
                    value={email}
                    onChange={handleEmailInputChange}
                    label="Room Delegate Email:"
                    error={emailError}
                  />
                  {emailError && (
                    <Label basic color="red">
                      Room Delegate Email is Required
                    </Label>
                  )}
                </Form.Field>
                <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/roomDelegateTable`}
                icon
                labelPosition="left"
                basic
                color="teal"
                size="large"
              >
                <Icon name="backward" />
                Back To Table
              </Button>
                <Button
                  type="submit"
                  color="teal"
                  floated="right"
                  size='large'
                  icon
                labelPosition="right"
                  loading={saving}
                >
                    <Icon name="add" />
                  Add Room Delegate
                </Button>
              </Form>
            </Segment>
          </SegmentGroup>
        </>
      )}
    </>
  );
});
