
import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Header, Segment, Image, Button, Divider } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import ValidationErrors from "../errors/ValidationErrors";


export default observer(function HomePage(){
    const {userStore, graphUserStore} = useStore();
    const {loadUser} = graphUserStore;
    const {signInGraphUser, signInCacUser, loadingInitial, errors} = userStore;
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
                    <Image size='massive' src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt='logo' style={{ marginBottom: 12 }} />
                   The EEM
                </Header>
    <Header as ='h2' inverted content = 'Welcome to the Enterprise Event Manager '/>
    {userStore.isLoggedIn ? (

        <Button as={Link} to={`${process.env.PUBLIC_URL}/activityTable`} size='huge' inverted>
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
         { process.env.REACT_APP_SERVER_TYPE === 'CAC' && 
         <>
        <Divider inverted />
        <Header as ='h4'
         inverted content = 'Or if you do not have an edu account login with your CAC'/>
        <Divider inverted />
        <Button onClick={signInCacUser} loading = {loadingInitial}>
           Sign In With CAC
        </Button>
       {errors && errors.length > 0 && <ValidationErrors errors={errors}/>}
        </>
    }
      {/* <Button onClick={() => {modalStore.openModal(<LoginForm />, 'tiny')}} size='huge' inverted>
        Login
    </Button>
       <Button onClick={() => {modalStore.openModal(<RegisterForm/>, 'tiny')}} size='huge' inverted>
       Register
        </Button>*/}
   </>
    )}
   
    </Container>
        </Segment>
    )
})