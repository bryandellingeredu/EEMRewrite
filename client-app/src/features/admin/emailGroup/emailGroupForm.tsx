import { observer } from "mobx-react-lite";
import { NavLink, useHistory, useParams } from "react-router-dom";
import { Button, Confirm, Divider, Form, Header, Icon, Label, Message, Segment, SegmentGroup } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { Fragment, useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Login, PeoplePicker, UserType } from "@microsoft/mgt-react";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import { Providers, ProviderState } from "@microsoft/mgt";
import { EmailGroupMember } from "../../../app/models/emailGroupMember";
import { EmailGroupMemberDTO } from "../../../app/models/emailGroupMemberDTO";

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

export default observer(function EmailGroupForm() {
  const [isSignedIn] = useIsSignedIn();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { emailGroupStore } = useStore();
  const { emailGroups, loadEmailGroups} = emailGroupStore 
  const [loading, setLoading] = useState(true);
  const [emailGroupMembers, setEmailGroupMembers] = useState<EmailGroupMember[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [peoplePickerKey, setPeoplePickerKey] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (memberid: string) => {
    try {
      setOpenConfirm(false);
      setDeleting(true);
      agent.EmailGroups.delete(memberid, id ).then(() => {
        toast.success("Row has been deleted");
        setDeleting(false);
        setEmailGroupMembers(emailGroupMembers.filter((x) => x.id !== memberid));
      });
    } catch (error) {
      console.log(error);
      setDeleting(false);
      toast.error("An error occured during deleting please try again");
    }
  };

  const handleSelectionChanged = (event: any) => {
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
      const emailGroupMember: EmailGroupMemberDTO= {
        id: uuid(),
        email,
        displayName,
        groupId: id,
      };

      agent.EmailGroups.create(emailGroupMember)
        .then(() => {
          setEmailGroupMembers(
            [...emailGroupMembers,
               {id: emailGroupMember.id,
                email: emailGroupMember.email,
                displayName: emailGroupMember.displayName,
                emailGroups: [
                  {id: emailGroupMember.groupId,
                   name: emailGroups.find((x) => x.id === id)!.name
                  }
                  ]
                }
              ]);
          setSelectedPerson(null);
          setPeoplePickerKey(peoplePickerKey + 1);
          setEmail("");
          setDisplayName("");
          toast.success(" Save Successfull");
          setSaving(false);
        })
        .catch((error : any) => {
          console.error(error);
          toast.error(" Something Went Wrong During Save Please Try Again");
          setSaving(false);
        });
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!emailGroups || emailGroups.length === 0) {
      loadEmailGroups().then((groups) => {
        agent.EmailGroups.getEmailGroupMembers()
          .then((response) => {
            setEmailGroupMembers(response);
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
          });
      });
    } else {
      agent.EmailGroups.getEmailGroupMembers()
        .then((response) => {
          setEmailGroupMembers(response);
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
      <Divider horizontal>
            <Header as="h2">
              <Icon name="configure" />
              Manage Email Group
            </Header>
          </Divider>

      {!isSignedIn && (
        <>
          <Message
            size="massive"
            warning
            header="You Must Sign Into EDU"
            content="To manage email groups you must have an edu account,
        and you must signed in to your edu account."
          />
          <Login />
        </>
      )} 
        {isSignedIn && loading && (
        <LoadingComponent content="Loading Email Group Information" />
      )}
       {isSignedIn && !loading && 
        <>
      
          <SegmentGroup>
          <Segment clearing>
              <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/emailGroupTable`}
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
                Members Of {" "}
                {emailGroups.find((x) => x.id === id)?.name}
              </Header>
               
               {emailGroupMembers.filter((x) => x.emailGroups.map(x => x.id).includes(id)).length > 0 &&
                <Segment.Inline>
                  {emailGroupMembers.filter(
                      (x) => x.emailGroups.map(x => x.id).includes(id))
                      .map((member) => (
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
                          {member.displayName}
                        </Button>
                        <Confirm
                          header="You are about to delete this group member"
                          open={openConfirm}
                          onCancel={() => setOpenConfirm(false)}
                          onConfirm={() => handleDelete(member.id)}
                        />
                      </Fragment>
                    ))}
                </Segment.Inline>
               }
              {emailGroupMembers.filter((x) => x.emailGroups.map(x => x.id).includes(id)).length < 1 &&
                <Message warning>
                <Message.Header>
                  {" "}
                  {emailGroups.find((x) => x.id === id)?.name} Has no
                  Members
                </Message.Header>
                <p>Would you like to Add a member?</p>
              </Message>
              }

            </Segment>
            <Segment color="teal" clearing>
            <Header icon color="teal" textAlign="center">
                <Icon name="plus" />
                Add a New Group Member
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
                    placeholder="The Display Name for Group Member"
                    value={displayName}
                    onChange={handleDisplayNameInputChange}
                    label="Group Member Name:"
                    error={nameError}
                  />
                  {nameError && (
                    <Label basic color="red">
                      Group Member Name is Required
                    </Label>
                  )}
                </Form.Field>
                <Form.Field>
                  <Form.Input
                    placeholder="The Email for the Group Member"
                    value={email}
                    onChange={handleEmailInputChange}
                    label="Group Member Email:"
                    error={emailError}
                  />
                  {emailError && (
                    <Label basic color="red">
                      Group Member Email is Required
                    </Label>
                  )}
                </Form.Field>
                <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/emailGroupTable`}
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
                  Add Group Member
                </Button>
              </Form>
            </Segment>
          </SegmentGroup>
        </>
       }
    </>
  );
});
