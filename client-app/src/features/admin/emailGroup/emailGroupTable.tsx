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
import {useEffect, useState, Fragment } from "react";
import agent from "../../../app/api/agent";
import { EmailGroupMember } from "../../../app/models/emailGroupMember";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { EmailGroup } from "../../../app/models/emailGroup";
import { NavLink } from "react-router-dom";
import { useHistory } from "react-router-dom";

interface GroupEmailData {
  id: string
  name: string
  emailGroupMembers: EmailGroupMember[]
}


export default observer(function EmailGroupTable() {
  const [loading, setLoading] = useState(true);
  const [emailGroupMembers, setEmailGroupMembers] = useState<  EmailGroupMember[]>([]);
  const [groupEmailTableData, setGroupEmailTableData] = useState<GroupEmailData[]>([]);
  const { emailGroupStore } = useStore();
  const { emailGroups, loadEmailGroups, loadingInitial } = emailGroupStore;
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const history = useHistory();

  const handleCellClick = (groupId: string) => {
    history.push(`${process.env.PUBLIC_URL}/manageEmailGroupForm/${groupId}`);
  };

  function createTableData(response: EmailGroupMember[], groups: EmailGroup[] ){
    const result =  groups.map(group => {
     return {
       id: group.id,
       name: group.name,
       emailGroupMembers: response
       .filter(emailGroupMember => emailGroupMember.emailGroups
        .map(x => x.id).includes(group.id))
     };
   });
   setGroupEmailTableData(result);
 }


  useEffect(() => {
    setLoading(true);
    if(!emailGroups || emailGroups.length === 0){
      loadEmailGroups().then((groups) => {
        agent.EmailGroups.getEmailGroupMembers()
         .then((response) => {
          setEmailGroupMembers(response)
          createTableData(response, groups)
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
        setEmailGroupMembers(response)
        createTableData(response, emailGroups)
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
    }
  }, []);

  
  const handleOnGroupChange = (e: any, data: any) => {
    setSelectedGroup(data.value);
  }

  const handleOnMemberChange = (e: any, data: any) => {
    setSelectedMember(data.value);
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

      <Dropdown
              clearable
              options={emailGroups.map((group) => ({
                key: group.id,
                text: group.name,
                value: group.id,
              }))}
              selection
              search
              placeholder="Filter By Group"
              onChange={handleOnGroupChange}
            />

<Dropdown
  clearable
  options={emailGroupMembers
    .reduce((acc, member) => {
      if (!acc.find((item) => item.value === member.email)) {
        acc.push({
          key: member.email,
          text: member.displayName,
          value: member.email,
        });
      }
      return acc;
    }, [] as { key: string; text: string; value: string }[])
    .sort((a, b) => {
      return a.text.localeCompare(b.text);
    })}
  selection
  search
  placeholder="Filter By Delegate"
  onChange={handleOnMemberChange}
/>

    <Table celled structured>
      <Table.Header>
        <Table.Row >
          <Table.HeaderCell>Group</Table.HeaderCell>
          <Table.HeaderCell>Display Name</Table.HeaderCell>
          <Table.HeaderCell>Email</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            groupEmailTableData
            .filter((x) => selectedGroup ? x.id === selectedGroup : 1 === 1)
            .filter((x) => selectedMember ? x.emailGroupMembers.map((y) => y.email)
            .includes(selectedMember) : 1 === 1)
            .map((group, index1) => (
              <Fragment key={group.id}>
                  <Table.Row positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
                  onClick={() => handleCellClick(group.id)}>
                  <Table.Cell rowSpan={group.emailGroupMembers.length || 1} >
                     {group.name} {index1 + 1}
                  </Table.Cell>
                  <Table.Cell>
                   {group.emailGroupMembers && group.emailGroupMembers.length > 0 && group.emailGroupMembers[0].displayName}
                  </Table.Cell>
                  <Table.Cell>
                   {group.emailGroupMembers && group.emailGroupMembers.length > 0 && group.emailGroupMembers[0].email}
                  </Table.Cell>
                  <Table.Cell
                     rowSpan={group.emailGroupMembers.length || 1}
                         positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
                        textAlign="center"
                      >
                         <Button
                         size='tiny'
                         basic color={(index1 + 1) % 2 === 0 ? 'brown' : 'red'}
                          icon
                          type="button"
                          as={NavLink}
                          to={`${process.env.PUBLIC_URL}/manageEmailGroupForm/${group.id}`}

                        >
                          <Icon name="edit" />
                          Edit
                       </Button>
                        </Table.Cell>
                  </Table.Row>
                  {group.emailGroupMembers
                    .filter((emailGroupMember, index2) => index2 !== 0)
                    .map((emailGroupMember, index2) => (
                      <Table.Row
                        key={emailGroupMember.id}
                        positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
                      >
                         <Table.Cell>{emailGroupMember.displayName}</Table.Cell>
                         <Table.Cell>{emailGroupMember.email}</Table.Cell>
                      </Table.Row>
                    ))}
              </Fragment>
            ))}        
        </Table.Body>
    </Table>     
    </>
)});