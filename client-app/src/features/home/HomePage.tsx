
import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Container, Header, Segment, Image, Button, Divider, Label } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import ValidationErrors from "../errors/ValidationErrors";
import { useEffect } from 'react';


export default observer(function HomePage(){
    const history = useHistory();
    const {userStore, graphUserStore, commonStore} = useStore();
    const {loadEDUGraphUser} = graphUserStore;
    const {redirectId, redirectCategoryId} = commonStore;
    const {signInEDUGraphUser, signInArmyUser, loadingInitial, errors} = userStore;
    const [loading, setLoading] = useState<boolean>(false);
    const loginCompleted = () => {
        setLoading(true);
        loadEDUGraphUser().then((graphUser) => {
          if(graphUser){
            signInEDUGraphUser(graphUser);
          }
        });
      };

      useEffect(() => {
        if(redirectId && redirectCategoryId && userStore.isLoggedIn) history.push(`${process.env.PUBLIC_URL}/activities/${redirectId}/${redirectCategoryId}`)
      }, [redirectId, redirectCategoryId, userStore.isLoggedIn ])

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
        <Header as ='h2' inverted content = 'Sign in with your EDU account (this is the preffered option).  Make sure you choose your EDU account. '/>

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
         inverted content = 'Or if you do not have an edu account login with your Army 365 Account.  make sure you choose your Army 365 Account'/>
        <Divider inverted />
        <Button onClick={signInArmyUser} >
           Sign In With Army 365 Account
        </Button>
       {errors && errors.length > 0 && <Label color='red' content='an error occured during log in please try again' />}
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