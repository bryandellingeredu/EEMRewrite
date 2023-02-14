import { observer } from "mobx-react-lite";
import { useStore } from "../../../app/stores/store";
import {
  Button,
  Confirm,
  Divider,
  Dropdown,
  Header,
  Icon,
  Message,
  Table,
} from "semantic-ui-react";
import { Fragment, useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { EmailGroupMember } from "../../../app/models/emailGroupMember";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { v4 as uuid } from "uuid";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

export default observer(function EmailGroupTable() {
  const [loading, setLoading] = useState(true);
  const [emailGroupMembers, setEmailGroupMembers] = useState<
    EmailGroupMember[]
  >([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const { emailGroupStore } = useStore();
  const { emailGroups, loadEmailGroups, loadingInitial } = emailGroupStore;

  const handleDelete = async (id: string) => {
    try {
      setOpenConfirm(false);
      setDeleting(true);
      agent.EmailGroups.delete(id).then(() => {
        toast.success("Row has been deleted");
        setDeleting(false);
        setEmailGroupMembers(emailGroupMembers.filter((x) => x.id !== id));
      });
    } catch (error) {
      console.log(error);
      setDeleting(false);
      toast.error("An error occured during deleting please try again");
    }
  };

  useEffect(() => {
    setLoading(true);
    agent.EmailGroups.getEmailGroupMembers()
      .then((response) => {
        setEmailGroupMembers(response);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!emailGroups || emailGroups.length < 1) loadEmailGroups();
    console.log("email groups");
    console.log(emailGroups);
  }, [emailGroups]);

  const handleOnChange = (e: any, data: any) => {
    setSelectedGroup(data.value);
    console.log(data.value);
  };

  return (
    <>
      <Divider horizontal>
        <Header as="h2">
          <Icon name="group" />
          Manage Email Groups
        </Header>
      </Divider>

      {loading && <LoadingComponent content="Loading Email Group Members..." />}

      {!loading && (!emailGroupMembers || emailGroupMembers.length < 1) && (
        <Message warning>
          <Message.Header>No Data Found</Message.Header>
          <p>There are no Email Group Members</p>
          <p>
            {" "}
            Would you like to{" "}
            <Button
              as={NavLink}
              to={`${process.env.PUBLIC_URL}/createEmailGroupMember`}
              positive
              content="Add an Email Group Member"
            />
          </p>
        </Message>
      )}

      {!loading && emailGroupMembers && emailGroupMembers.length > 0 && (
        <>
          {emailGroups && emailGroups.length > 0 && (
            <Dropdown
              clearable
              options={emailGroups.map((item, index) => ({
                key: index + 1,
                text: item.name,
                value: item.id,
              }))}
              selection
              search
              placeholder="Filter By Group"
              onChange={handleOnChange}
            />
          )}

          <Button
            size="huge"
            primary
            floated="right"
            style={{ marginBottom: "10px" }}
            icon
            labelPosition="left"
            as={NavLink}
            to={`${process.env.PUBLIC_URL}/createEmailGroupMember`}
          >
            <Icon name="user plus" />
            Add A New Email Group Member{" "}
          </Button>
          <Table celled structured>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Display Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Groups</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {emailGroupMembers
                .filter((x) =>
                  selectedGroup
                    ? x.emailGroups.map((y) => y.id).includes(selectedGroup)
                    : 1 === 1
                )
                .map((emailGroupMember) => (
                  <Fragment key={uuid()}>
                    <Table.Row>
                      <Table.Cell rowSpan={emailGroupMember.emailGroups.length}>
                        {emailGroupMember.displayName}
                      </Table.Cell>
                      <Table.Cell rowSpan={emailGroupMember.emailGroups.length}>
                        {emailGroupMember.email}
                      </Table.Cell>
                      <Table.Cell>
                        {emailGroupMember.emailGroups[0].name}
                      </Table.Cell>
                      <Table.Cell
                        rowSpan={emailGroupMember.emailGroups.length}
                        textAlign="center"
                      >
                        <Button
                          icon
                          color="green"
                          type="button"
                          as={NavLink}
                          to={`${process.env.PUBLIC_URL}/manageEmailGroupMember/${emailGroupMember.id}`}
                        >
                          <Icon name="edit" />
                          Edit
                        </Button>
                        <Button
                          icon
                          color="red"
                          type="button"
                          onClick={() => setOpenConfirm(true)}
                          loading={deleting}
                        >
                          <Icon name="delete" />
                          Delete
                        </Button>
                        <Confirm
                          header="You are about to delete this row"
                          open={openConfirm}
                          onCancel={() => setOpenConfirm(false)}
                          onConfirm={() => handleDelete(emailGroupMember.id)}
                        />
                      </Table.Cell>
                    </Table.Row>

                    {emailGroupMember.emailGroups
                      .filter((emailGroup, index) => index !== 0)
                      .map((emailGroup) => (
                        <Table.Row key={uuid()}>
                          <Table.Cell>{emailGroup.name}</Table.Cell>
                        </Table.Row>
                      ))}
                  </Fragment>
                ))}
            </Table.Body>
          </Table>
        </>
      )}
    </>
  );
});
