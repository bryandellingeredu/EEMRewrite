import { Button, Confirm, Divider, Form, Header, Icon, Label, Message, Segment, SegmentGroup } from "semantic-ui-react";
import { NavLink,  useParams } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { UserRole } from "../../../app/models/userRole";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";

export default function ManageRolesForm(){
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>({  roleId: '', roleName: '', userNames: []});
    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string>('');

    useEffect(() => {

        setLoading(true);
        agent.UserRoles.list()
        .then((response) => {
            setUserRole(response.find(x => x.roleId === id) || { roleId: '', roleName: '', userNames: [] });
          setLoading(false);
        })
       .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }, []);

    const handleSubmit = (event: any) => {
      event.preventDefault();
      let error = false;
  
      // Trim any leading or trailing spaces from the email
      let trimmedEmail = email.trim();
  
      // Regular expression for email ending with armywarcollege.edu or army.mil
      const regex = /^[^\s@]+@([^\s@]+\.)?(armywarcollege\.edu|army\.mil)$/i;
  
      if (!trimmedEmail || !regex.test(trimmedEmail)) {
          error = true;
          setEmailError(true);
      }
  
      if(!error){
          setSaving(true)
          agent.UserRoles.create(id, trimmedEmail).then(() =>{
              setEmail('');
              toast.success(" Save Successful");
              setSaving(false); 
              setUserRole({
                  ...userRole,
                  userNames: [...userRole.userNames, trimmedEmail]
              });
          })
          .catch((error : any) => {
              console.error(error);
              toast.error(" Something Went Wrong During Save Please Try Again");
              setSaving(false);
          });
      }
  }

   const handleDeleteButton = (userEmail: string) => {
        setOpenConfirm(true);
        setUserToDelete(userEmail);
    }


    const handleDelete = async () => {
        try {
          setOpenConfirm(false);
          setDeleting(true);
          agent.UserRoles.delete(id, userToDelete ).then(() => {
            toast.success("Role has been removed from user");
            setDeleting(false);
            setUserRole({
                ...userRole,
                userNames: userRole.userNames.filter((name) => name !== userToDelete)
            });
          });
        } catch (error) {
          console.log(error);
          setDeleting(false);
          toast.error("An error occured during deleting please try again");
        }
      };

      const handleEmailInputChange = (event: any) => {
        setEmail(event.target.value);
        setEmailError(false);
      };

      
  return(
    <>
         <Divider horizontal>
            <Header as="h2">
              <Icon name="configure" />
              Manage User Roles
            </Header>
          </Divider>

          {loading && <LoadingComponent content="Loading User Role..." />}
          {!loading &&
            <SegmentGroup>
              <Segment clearing>
              <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/manageRolesTable`}
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
                {userRole.roleName}
              </Header>
              {userRole.userNames.length > 0 &&
                     <Segment.Inline>
                     { userRole.userNames.map((member) => (
                         <Fragment key={uuid()}>
                           <Button
                             icon
                             labelPosition="left"
                             basic
                             color="teal"
                             size="large"
                             onClick={() => handleDeleteButton(member)}
                             loading={deleting}
                           >
                             <Icon name="x" color="red" />
                             {member}
                           </Button>
                           <Confirm
                             header="You are about to remove this role from this person"
                             open={openConfirm}
                             onCancel={() => setOpenConfirm(false)}
                             onConfirm={() => handleDelete()}
                           />
                         </Fragment>
                       ))}
                   </Segment.Inline>
              }
                 {userRole.userNames.length < 1 &&
                     <Message warning>
                     <Message.Header>
                       {" "}
                       {userRole.roleName} Has no
                       Members
                     </Message.Header>
                     <p>Would you like to Add a member?</p>
                   </Message>
              }
            </Segment>
            <Segment color="teal" clearing>
            <Header icon color="teal" textAlign="center">
                <Icon name="plus" />
                Add a New Email to a Role
              </Header>
              <Form onSubmit={handleSubmit}>
              <Form.Field>
                  <Form.Input
                    placeholder="The User Email you want to add to the Role"
                    value={email}
                    onChange={handleEmailInputChange}
                    label="User Email:"
                    error={emailError}
                  />
                  {emailError && (
                    <Label basic color="red">
                      User  Email is Required, it must not start with a space, and it must end with @army.mil or @armywarcollege.edu
                    </Label>
                  )}
                </Form.Field>
                <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/manageRolesTable`}
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
                  Add Email to Role
                </Button>
              </Form>
            </Segment>
               
            </SegmentGroup>
          }
    </>
  )
}