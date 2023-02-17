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
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Login, PeoplePicker } from "@microsoft/mgt-react";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import { Providers, ProviderState } from "@microsoft/mgt";
import { VTCCoordinator } from "../../../app/models/vtcCoordinator";

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

export default observer(function VTCCoordinatorForm() {
  const [isSignedIn] = useIsSignedIn();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { graphRoomStore } = useStore();
  const { graphRooms, loadGraphRooms } = graphRoomStore;
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState<VTCCoordinator[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [peoplePickerKey, setPeoplePickerKey] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      setOpenConfirm(false);
      setDeleting(true);
      agent.VTCCoordinators.delete(id).then(() => {
        toast.success("Row has been deleted");
        setDeleting(false);
        setCoordinators(coordinators.filter((x) => x.id !== id));
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
      const coordinator: VTCCoordinator = {
        id: uuid(),
        vtcCoordinatorEmail: email,
        vtcCoordinatorDisplayName: displayName,
        roomEmail: graphRooms.find((y) => y.id === id)!.emailAddress,
      };
      agent.VTCCoordinators.create(coordinator)
        .then(() => {
          setCoordinators([...coordinators, coordinator]);
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
        agent.VTCCoordinators.list()
          .then((response) => {
            setCoordinators(response);
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
          });
      });
    } else {
      agent.VTCCoordinators.list()
        .then((response) => {
          setCoordinators(response);
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
            content="To manage VTC Coordinators you must have an edu account,
        and you must signed in to your edu account."
          />
          <Login />
        </>
      )}

      {isSignedIn && loading && (
        <LoadingComponent content="Loading VTC Coordinator Information" />
      )}
      {isSignedIn && !loading && (
        <>
          <Divider horizontal>
            <Header as="h2">
              <Icon name="computer" />
              Manage VTC Coordinators
            </Header>
          </Divider>
          <SegmentGroup>
            <Segment clearing>
              <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/vtcCoordinatorTable`}
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
                VTC Coordinator/s For{" "}
                {graphRooms.find((x) => x.id === id)?.displayName}
              </Header>
              {!!coordinators.find(
                (x) =>
                  x.roomEmail ===
                  graphRooms.find((y) => y.id === id)?.emailAddress
              ) && (
                <Segment.Inline>
                  {coordinators
                    .filter(
                      (x) =>
                        x.roomEmail ===
                        graphRooms.find((x) => x.id === id)?.emailAddress
                    )
                    .map((coordinator) => (
                      <Fragment key={uuid()}>
                        <Button
                          icon
                          labelPosition="left"
                          basic
                          color="teal"
                          size="large"
                          onClick={() => setOpenConfirm(true)}
                          loading={deleting}
                        >
                          <Icon name="x" color="red" />
                          {coordinator.vtcCoordinatorDisplayName}
                        </Button>
                        <Confirm
                          header="You are about to delete this VTC Coordinator"
                          open={openConfirm}
                          onCancel={() => setOpenConfirm(false)}
                          onConfirm={() => handleDelete(coordinator.id)}
                        />
                      </Fragment>
                    ))}
                </Segment.Inline>
              )}
              {!coordinators.find(
                (x) =>
                  x.roomEmail ===
                  graphRooms.find((y) => y.id === id)?.emailAddress
              ) && (
                <Message warning>
                  <Message.Header>
                    {" "}
                    {graphRooms.find((x) => x.id === id)?.displayName} Has no
                    VTC Coordinators
                  </Message.Header>
                </Message>
              )}
            </Segment>
            <Segment color="teal" clearing>
              <Header icon color="teal" textAlign="center">
                <Icon name="plus" />
                Add a New VTC Coordinator
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
                  />
                </Form.Field>
                <Form.Field>
                  <Form.Input
                    placeholder="The Display Name for the VTC Coordinator"
                    value={displayName}
                    onChange={handleDisplayNameInputChange}
                    label="VTC Coordinator Name:"
                    error={nameError}
                  />
                  {nameError && (
                    <Label basic color="red">
                       Name is Required
                    </Label>
                  )}
                </Form.Field>
                <Form.Field>
                  <Form.Input
                    placeholder="The Email for the VTC Coordinator"
                    value={email}
                    onChange={handleEmailInputChange}
                    label="VTC Coordinator Email:"
                    error={emailError}
                  />
                  {emailError && (
                    <Label basic color="red">
                      Email is Required
                    </Label>
                  )}
                </Form.Field>
                <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/vtcCoordinatorTable`}
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
                  Add VTC Coordinator
                </Button>
              </Form>
            </Segment>
          </SegmentGroup>
        </>
      )}
    </>
  );
});
