
import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Header, Segment, Image, Button, Divider } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import LoginForm from "../users/LoginForm";
import RegisterForm from "../users/RegisterForm";

export default observer(function HomePage(){
    const {userStore, modalStore, graphUserStore} = useStore();
    const {loadUser} = graphUserStore;
    const {signInGraphUser} = userStore;
    const [loading, setLoading] = useState<boolean>(false);
    const loginCompleted = () => {
        setLoading(true);
        loadUser().then((graphUser) => {
          if(graphUser){
            signInGraphUser(graphUser);
          }
        });
      };
    return(
        <Segment inverted textAlign='center' vertical className='masthead'>
    <Container text>
    <Header as='h1' inverted>
                    <Image size='massive' src='/assets/logo.png' alt='logo' style={{ marginBottom: 12 }} />
                   The EEM
                </Header>
    <Header as ='h2' inverted content = 'Welcome to the Enterprise Event Manager '/>
    {userStore.isLoggedIn ? (

        <Button as={Link} to='/activities' size='huge' inverted>
        Go to Events
    </Button>
           
    ) : (
        <>
          <Divider inverted />
        <Header as ='h4' inverted content = 'Sign in with your edu account '/>
        {loading && <LoadingComponent content="logging in..." /> }
        {!loading &&
        <Login
           loginCompleted={loginCompleted}
           loginInitiated={() => setLoading(true)}
         />}
        <Divider inverted />
        <Header as ='h4' inverted content = 'Or if you do not have an edu account login with an email and password'/>
        <Divider inverted />
        <Button onClick={() => {modalStore.openModal(<LoginForm />, 'tiny')}} size='huge' inverted>
        Login
    </Button>
       <Button onClick={() => {modalStore.openModal(<RegisterForm/>, 'tiny')}} size='huge' inverted>
       Register
   </Button>
   </>
    )}
   
    </Container>
        </Segment>
    )
})