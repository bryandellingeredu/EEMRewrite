
import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Container, Header, Segment, Image, Button, Divider, Label, Grid, Icon } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import { useEffect } from 'react';
import { toast } from "react-toastify";
import { Providers, ProviderState } from "@microsoft/mgt";

function useIsEduSignedIn(): [boolean] {
  const [isSEduignedIn, setIsSEduignedIn] = useState(false);
  useEffect(() => {
    const updateState = () => {
      const provider = Providers.globalProvider;
      setIsSEduignedIn(provider && provider.state === ProviderState.SignedIn);
    };

    Providers.onProviderUpdated(updateState);
    updateState();

    return () => {
      Providers.removeProviderUpdatedListener(updateState);
    };
  }, []);
  return [isSEduignedIn];
}


export default observer(function HomePage(){
    const [isEduSignedIn] = useIsEduSignedIn();
    const history = useHistory();
    const {userStore, graphUserStore, commonStore} = useStore();
    const {loadEDUGraphUser, armyProfile} = graphUserStore;
    const {redirectId, redirectCategoryId, redirectToPage} = commonStore;
    const {signInEDUGraphUser, signInArmyUser, loadingInitial, errors} = userStore;
    const [loading, setLoading] = useState<boolean>(false);
    const loginCompleted = () => {
        setLoading(true);
        loadEDUGraphUser().then((graphUser) => {
          if(graphUser){
            signInEDUGraphUser(graphUser).then(() =>{
            })
          }
        });
      };

      useEffect(() => {
        if(redirectToPage && userStore.isLoggedIn){
          history.push(`${process.env.PUBLIC_URL}/${redirectToPage}`)
        } else if (userStore.isLoggedIn && armyProfile){
          history.push(`${process.env.PUBLIC_URL}/${redirectToPage}`)
        } 
      }, [redirectToPage, userStore.isLoggedIn, armyProfile ])

      useEffect(() => {
        if(redirectId && redirectCategoryId && userStore.isLoggedIn){
          history.push(`${process.env.PUBLIC_URL}/activities/${redirectId}/${redirectCategoryId}`)
        } else if (userStore.isLoggedIn && armyProfile){
          history.push(`${process.env.PUBLIC_URL}/activityTable`)
        } 
      }, [redirectId, redirectCategoryId, userStore.isLoggedIn, armyProfile ])

      const handleLoginInitiated = () =>{
        toast('Sign in with your edu account NOT your army account');
        setLoading(true)
      }

    return(
        <Segment inverted textAlign='center' vertical className='masthead'>
    <Container text>
    <Header as='h1' inverted>
                    <Image size='massive' src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt='logo' style={{ marginBottom: 12 }} />
                   The EEM
                </Header>
    <Header as ='h2' inverted content = 'Welcome to the Enterprise Event Manager '/>

    {userStore.isLoggedIn && armyProfile && 
        
        <Button as={Link} to={`${process.env.PUBLIC_URL}/activityTable`} size='huge' inverted>
        Go to Events
    </Button>
     }

     {userStore.isLoggedIn && !armyProfile && isEduSignedIn &&
     <>
      <Header as ='h3' inverted content = 'You are signed into your edu account. '/>
      <Header as ='h3' inverted content =  'Would you also like to sign into your army 365 account?' />
        <Button as={Link} to={`${process.env.PUBLIC_URL}/activityTable`} size='huge' inverted>
        No Thanks, Just Go to Events
    </Button>
    <Button 
         as={Link} to={`${process.env.PUBLIC_URL}/authenticatetoarmy`}
                 size='huge' inverted
                  type='button'>
                  Sure, Sign Me Into Army 365
                </Button>
    </>
     }

{/*
    <p>Logged into EEM: { userStore.isLoggedIn ? 'true' : 'false'}   Logged into Army: { armyProfile ? 'true' : 'false'}  Logged into EDU: { isEduSignedIn ? 'true' : 'false'}  </p>
*/}
           
      {(!userStore.isLoggedIn || (!armyProfile && !isEduSignedIn))  && 
        <>
          <Divider inverted />

          <Grid columns={2} divided >
          <Grid.Row>
            {/*
            <Grid.Column>
            <Header as='h2' icon>
              <Grid columns={2}>
                 <Grid.Column>
                 <Icon name='id badge' style={{color: 'white'}} />
                 </Grid.Column>
                 <Grid.Column>
                 <Icon name='graduation cap' style={{color: 'white'}} />
                 </Grid.Column>
              </Grid>                       
                <span style={{color: 'white'}}>Login With Both</span>
                <Header.Subheader>
                 <span style={{color: 'orange'}}>I have a CAC and an EDU.</span>
                </Header.Subheader>          
                </Header>
                <Button style={{backgroundColor: '#004080', color:'white'}}
                 size='big' as={Link} to={`${process.env.PUBLIC_URL}/loginBoth`}
                  type='button'>
                  <Icon name='user outline' style={{color: 'white'}}/>
                  Sign In 
                </Button>
            </Grid.Column>
      */}
            <Grid.Column>
            <Header as='h2' icon>
            <Icon name='graduation cap' style={{color: 'white'}} />
            <span style={{color: 'white'}}>Login EDU</span>
            <Header.Subheader>
            <span style={{color: 'orange'}}>Login with your edu account.</span>
            </Header.Subheader>
            </Header>
            {loading && <LoadingComponent content="logging in..." /> }
              {!loading &&
              <Login
                loginCompleted={loginCompleted}
                loginInitiated={handleLoginInitiated}
              />}
            </Grid.Column>
            <Grid.Column>
            <Header as='h2' icon  style={{paddingTop: '3px'}}>
            <Icon name='id badge' style={{color: 'white'}} />
            <span style={{color: 'white'}}>Login Army 365</span>
            <Header.Subheader>
            <span style={{color: 'orange'}}>login with your CAC.</span>
            </Header.Subheader>
            </Header>
            <div>
            <Button style={{backgroundColor: '#004080', color:'white'}} size='big' onClick={signInArmyUser} type='button'>
                  <Icon name='user outline' style={{color: 'white'}}/>
                  Sign In 
                </Button>
                </div>
            </Grid.Column>        
          </Grid.Row>
          </Grid>
   </>
}

    </Container>
        </Segment>
    )
})