import { Button, Divider, Header, Icon, Table } from "semantic-ui-react";
import { Fragment, useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { UserRole } from "../../../app/models/userRole";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { NavLink, useHistory } from "react-router-dom";
import { v4 as uuid } from "uuid";

export default function ManageRolesTable(){
    const [loading, setLoading] = useState(true);
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const history = useHistory();

    const handleCellClick = (roleId: string) => {
      history.push(`${process.env.PUBLIC_URL}/manageRoleForm/${roleId}`);
    };


    useEffect(() => {

        setLoading(true);
        agent.UserRoles.list()
        .then((response) => {
         setUserRoles(response);
          setLoading(false);
        })
       .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }, []);

    return (
        <>
           <Divider horizontal>
            <Header as="h2">
                <Icon name='users' />     
              Manage User Roles
            </Header>
          </Divider>
          {loading && <LoadingComponent content="Loading User Roles..." />}
          {!loading &&
            <Table celled structured>
                 <Table.Header>
                    <Table.Row>
                    <Table.HeaderCell>Role</Table.HeaderCell>
                    <Table.HeaderCell>User Email</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                    </Table.Row>
                 </Table.Header>
                 <Table.Body>
  {userRoles.map((item, index1) =>(
    <Fragment key={item.roleId}>
         <Table.Row positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0} onClick={() => handleCellClick(item.roleId)}>
            <Table.Cell rowSpan={item.userNames.length > 0 ? item.userNames.length : 1} >
                {item.roleName}
            </Table.Cell>
            {item.userNames.length > 0 ? (
              <>
                <Table.Cell>
                {item.userNames[0]}
                </Table.Cell>
                <Table.Cell
                 rowSpan={item.userNames.length}
                     positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
                    textAlign="center"
                  >
                     <Button
                     size='tiny'
                     basic color={(index1 + 1) % 2 === 0 ? 'brown' : 'red'}
                      icon
                      type="button"
                      as={NavLink}
                      to={`${process.env.PUBLIC_URL}/manageUserRoleForm/${item.roleId}`}
                    >
                      <Icon name="edit" />
                      Edit
                   </Button>
                    </Table.Cell>
             </>
            ) : (
              <>
                <Table.Cell>
                No users
                </Table.Cell>
                <Table.Cell
                 positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
                    textAlign="center"
                  >
                     <Button
                     size='tiny'
                     basic color={(index1 + 1) % 2 === 0 ? 'brown' : 'red'}
                      icon
                      type="button"
                      as={NavLink}
                      to={`${process.env.PUBLIC_URL}/manageUserRoleForm/${item.roleId}`}
                    >
                      <Icon name="edit" />
                      Edit
                   </Button>
                    </Table.Cell>
             </>
            )}
         </Table.Row>
         {item.userNames.filter((userName, index2) => index2 !== 0)
          .map((userName, index2) => (
            <Table.Row key={uuid()}
            positive={(index1 + 1) % 2 === 0} negative={(index1 + 1) % 2 !== 0}
            >
                <Table.Cell>{userName}</Table.Cell>
            </Table.Row>
          ))}
        </Fragment>
      ))}
 </Table.Body>


            </Table>
          }
        </>
    )
}