import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { NavLink, useHistory, useParams } from "react-router-dom";
import { Fragment, useEffect, useRef, useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { toast } from "react-toastify";
import { Button, Confirm, Divider, Header, Icon, Message, Segment, SegmentGroup, Modal, List } from "semantic-ui-react";
import { RoomDelegate } from "../../app/models/roomDelegate";
import { GraphRoom } from "../../app/models/graphRoom";
import agent from "../../app/api/agent";
import { v4 as uuid } from "uuid";
import { Formik, Form, useFormikContext, FormikHelpers } from "formik";
import { ArmyWarCollegeUser } from "../../app/models/armyWarCollegeUser";
import MyDataList from "../../app/common/form/MyDataList";
import * as Yup from "yup";

interface FormValues {
    email: string
    name: string
}

const emptyGraphRoom : GraphRoom = {
    address: {
        city: '',
        countryOrRegion: '',
        postalCode: '',
        state: '',
        street: ''
    },
    displayName: '',
    phone: '',
    id: '',
    emailAddress: '',
    capacity: '',
    bookingType: '',
    tags: [],
    building: '',
    floorNumber: null,
    floorLabel: '',
    label: '',
    audioDeviceName: '',
    videoDeviceName: '',
    displayDeviceName: '',
    isWheelChairAccessible: '',
    thumbURL: '',
    picURL: ''
    };

export default observer( function RequestRoomDelegateChanges () {
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { id } = useParams<{ id: string }>();
    const { graphRoomStore } = useStore();
    const { graphRooms, loadGraphRooms } = graphRoomStore;
    const [loading, setLoading] = useState(true);
    const [roomDelegates, setRoomDelegates] = useState<RoomDelegate[]>([]);
    const [graphRoom, setGraphRoom] = useState<GraphRoom>(emptyGraphRoom);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [armyWarCollegeUsers, setArmyWarCollegeUsers] = useState<ArmyWarCollegeUser[]>([]);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const [isButtonAnimated, setButtonAnimated] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const history = useHistory(); 

    const handleButtonSubmit = () => {
      setModalOpen(true);
    };
  
    const handleModalClose = () => {
      setModalOpen(false);
    };

    useEffect(() => {
       agent.UserRoles.listArmyWarCollegeUsers().then((response : ArmyWarCollegeUser[]) => {
        debugger;
        setArmyWarCollegeUsers(response);
       })
    }, [])

    useEffect(() => {
        setLoading(true);
        if (!graphRooms || graphRooms.length === 0) {
          loadGraphRooms().then((rooms) => {
            const room : GraphRoom = (rooms.find(x => x.id === id) || emptyGraphRoom);
           setGraphRoom(room);
           agent.RoomDelegates.list()
          .then((response) => {
            setRoomDelegates(response.filter(x => x.roomEmail === room.emailAddress));
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            toast.error('an error occured loading room delegates')
            setLoading(false);
          });
      });

        } else {
            const room : GraphRoom = (graphRooms.find(x => x.id === id) || emptyGraphRoom);
            setGraphRoom(room);
            agent.RoomDelegates.list()
            .then((response) => {
             setRoomDelegates(response.filter(x => x.roomEmail === room.emailAddress));
              setLoading(false);
            })
            .catch((error) => {
              console.error(error);
              toast.error('an error occured loading room delegates')
              setLoading(false);
            });    
        }
      }, [id]);

      const handleDelete =  (id: string) => {
          setOpenConfirm(false);
          setRoomDelegates(roomDelegates.filter((x) => x.id !== id));
        };

        function handleFormSubmit(values : FormValues, {resetForm, setFieldValue}: FormikHelpers<FormValues> ) {        
            // Check if either the email or name is empty
            if(values.email !== '' && values.name !== '') {
                setRoomDelegates(
                    [...roomDelegates,
                    {id: uuid(), delegateEmail: values.email, delegateDisplayName: values.name, roomEmail: graphRoom.emailAddress}
                    ]);
                toast.success('Delegate added', {
                    position: toast.POSITION.TOP_CENTER
                });
            }
        
            // Clear the form fields
            resetForm();
            setTimeout(() => {
                setFieldValue('name', '');
                setFieldValue('email', '');
            }, 0);
        }
        const FormObserver: React.FC = () => {
            const { values, setFieldValue, submitForm } = useFormikContext<FormValues>();
            useEffect(() => {
              // Find the user object that has the entered display name
              const user = armyWarCollegeUsers.find(x => x.displayName === values.name);
          
              // If such a user exists and the name is not empty, update the email field with the user's email
              if(user && values.name) {
                setFieldValue('email', user.email);
              }
          
              if(values.name && values.email) {
                setButtonAnimated(true);

              }else{
                setButtonAnimated(false);
              }

              if (values.name || values.email){
                setButtonDisabled(true);
            } else {
                setButtonDisabled(false);
            }
        
            }, [values.name, values.email]); // react to changes in the name field
          
            return null;
          };
          
          const validationSchema = Yup.object({
            name: Yup.string().required("The User Name is required"),
            email: Yup.string()
              .email("Invalid email address")
              .matches(/@armywarcollege\.edu$/, "Email must end with @armywarcollege.edu")
              .required("The Email is required"),
          });

          const handleIconClick = () => {
            if (nameInputRef.current) {
              nameInputRef.current.focus();
              toast.success('Start typing a name in the EDU User Name field', {
                position: toast.POSITION.TOP_CENTER
            });
            }
          };

          const sendEmailToAdmins = () => {

            setSubmitting(true);
          
            agent.RoomDelegates.requestChanges(roomDelegates)
              .then((response) => {
                toast.success('Your Request was sent. You will be notified when the request is complete', {
                  position: toast.POSITION.TOP_CENTER
              });
          
                // Wait for a second, then navigate to the new page
                setTimeout(() => {
                  history.push(`${process.env.PUBLIC_URL}/rooms`);
                }, 1000);
              })
              .catch((error) => {
                console.error(error);
                toast.error('An error occurred sending your request');
                setSubmitting(false);
              });
          };

    return(
        <>
           <Divider horizontal>
            <Header as="h2">
              <Icon name="configure" />
              Request Room Delegate Changes
            </Header>
          </Divider>
          {(loading || armyWarCollegeUsers.length < 1) &&  <LoadingComponent content="Loading Room Delegate Information" />}
          {!loading && armyWarCollegeUsers.length > 1 &&
          <SegmentGroup>
          <Segment clearing>
          <Button
                floated="left"
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/rooms`}
                icon
                labelPosition="left"
                basic
                color="teal"
                size="large"
              >
                <Icon name="backward" />
                Back To Rooms
              </Button>
              </Segment>
              <Segment textAlign="center" color="teal">
  <Header style={{ color: 'teal', fontSize: '1.5em' }}>
  Modify Room Delegates. Submit your changes using the orange button when done
    <Header.Subheader style={{ color: 'teal', fontSize: '1.2em' }}>
    Your request will be reviewed by the administrators. You'll be notified of the decision by email.
    </Header.Subheader>
  </Header>
</Segment>
              <Segment textAlign="center" color="teal">
              <Header icon color="teal">
                <Icon name="user" />
                Room Delegates for{" "}
                {graphRoom.displayName}
                {roomDelegates.length > 0 &&
                <Header.Subheader>
                    Click the red 'X' to remove a delegate
                </Header.Subheader>
                }
              </Header>
      
              <Segment.Inline>
                  {roomDelegates
                    .map((delegate) => (
                      <Fragment key={uuid()}>
                        <Button
                          icon
                          labelPosition="left"
                          basic
                          color="teal"
                          size="large"
                          onClick={() => setOpenConfirm(true)}
                        >
                          <Icon name="x" color="red" />
                          {delegate.delegateDisplayName}
                        </Button>
                        <Confirm
                          header="You are asking for this room delegate to be removed"
                          open={openConfirm}
                          onCancel={() => setOpenConfirm(false)}
                          onConfirm={() => handleDelete(delegate.id)}
                        />
                      </Fragment>
                    ))}
                    {roomDelegates.length < 1 && 
                    <Message warning>
                    <Message.Header>
                    No delegates found for {graphRoom.displayName}. Would you like to add one
                    </Message.Header>
                  </Message>
                    }
                </Segment.Inline>
                </Segment>
                <Segment color="teal" clearing>
                <Header  color="teal" textAlign="center">
                Add a New Delegate
                    <Header.Subheader>
                    Enter the User Name and Email, then click 'Add Room Delegate'. Repeat the process to add more
                </Header.Subheader>
                </Header>
                <Formik initialValues={{email: '', name: '' }} onSubmit={(values, actions) => handleFormSubmit(values, actions)}
                validationSchema={validationSchema}>
                  {({handleSubmit}) => (
                     <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                    <MyDataList
                      name="name"
                      placeholder="EDU User Name"
                      label="EDU User Name: (Pick from the list or type your own)"
                      dataListId="eduUserNames"
                      options={armyWarCollegeUsers.map(x => x.displayName)}
                      innerRef={nameInputRef}
                    />
                    <MyDataList
                      name="email"
                      placeholder="EDU Email"
                      label="EDU Email: (Pick from the list or type your own)"
                      dataListId="eduemails"
                      options={armyWarCollegeUsers.map(x => x.email)}
                    />
                       <Button
                            floated="right"
                             positive
                            type="submit"
                            content="Add Room Delegate"
                            className={isButtonAnimated ? "pulse-animation" : ''}
                        />
                      <FormObserver />

                     </Form>
                   )}
                </Formik>
            </Segment>
            
            <Segment color="teal" clearing textAlign="center">
            <Button
                 as={NavLink}
                 to={`${process.env.PUBLIC_URL}/rooms`}
                color='grey'
                content='Cancel'
                size='huge'/>
                <Button
                color='orange'
                content='Submit Delegate Changes'
                size='huge'
                disabled={isButtonDisabled}
                onClick={handleButtonSubmit}/>
            </Segment>
          </SegmentGroup>
         }
           <Modal open={isModalOpen} onClose={handleModalClose}>
        <Modal.Header>
          <Header>
          Delegate Changes Summary
            <Header.Subheader>
              You will be notified by email when these changes have been applied.
            </Header.Subheader>
          </Header>
        </Modal.Header>
        <Modal.Content>
         <Segment>

          {roomDelegates.length < 1 && 
          <Header>
                    <Message error>
                    <Message.Header>
                    You must choose at least one room delegate for {graphRoom.displayName}
                    </Message.Header>
                  </Message>
              </Header>
            }
            {roomDelegates.length > 0 && 
            <>
              <Header>
                You are requesting the following room delegates for {graphRoom.displayName}
            </Header>
            <List celled>
                {roomDelegates.map((delegate) => (
                  <List.Item key={uuid()}>
                  <Icon name="user" />
                  <List.Content>
                  <List.Header>{delegate.delegateDisplayName}</List.Header>
                  {delegate.delegateEmail}
                  </List.Content>
                  </List.Item>
                 ))}
              </List>
                 </>
        
            }

         
         
         </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={handleModalClose} disabled={submitting}>
            Cancel
          </Button>
          {roomDelegates.length > 0 && 
          <Button positive onClick={sendEmailToAdmins} type='button' loading={submitting} disabled={submitting}>
          Submit Delegate Changes
          </Button>
          }
        </Modal.Actions>
      </Modal>
        </>
    )
})