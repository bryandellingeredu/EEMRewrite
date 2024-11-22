
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
    const {userStore, graphUserStore, commonStore, navbarStore} = useStore();
    const {loadEDUGraphUser, armyProfile} = graphUserStore;
    const {redirectId, redirectCategoryId, redirectToPage} = commonStore;
    const {signInEDUGraphUser, signInArmyUser, loadingInitial, errors} = userStore;
    const {navbarType} = navbarStore
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
        if (userStore.isLoggedIn && (armyProfile || isEduSignedIn)) {
          history.push(`${process.env.PUBLIC_URL}/internationfellowscalendar`);
        }
      }, [userStore.isLoggedIn, armyProfile, isEduSignedIn, history]);



      const handleLoginInitiated = () =>{
        setLoading(true)
      }

    return(
      <>
      {navbarType !== 'eem' && <LoadingComponent content='Loading...'/>}
      {navbarType === 'eem' && 
        <Segment inverted textAlign='center' vertical className='masthead'
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh', // Ensures full viewport height
        }}
        >
    <Container text>
    <Header as='h4' inverted>
        <Image size='small' src={`${process.env.PUBLIC_URL}/assets/logo2.png`} alt='logo' style={{ marginBottom: 12 }} />
                   International Fellows Calendar
      </Header>


    {userStore.isLoggedIn && armyProfile && 
        
        <Button as={Link} to={`${process.env.PUBLIC_URL}/internationfellowscalendar`} size='huge' inverted>
        Go to Events
    </Button>
     }

     {userStore.isLoggedIn && !armyProfile && isEduSignedIn &&
      <Button as={Link} to={`${process.env.PUBLIC_URL}/internationfellowscalendar`} size='huge' inverted>
        Go to Events
    </Button>
     }

{/*
    <p>Logged into EEM: { userStore.isLoggedIn ? 'true' : 'false'}   Logged into Army: { armyProfile ? 'true' : 'false'}  Logged into EDU: { isEduSignedIn ? 'true' : 'false'}  </p>
*/}
           
      {(!userStore.isLoggedIn || (!armyProfile && !isEduSignedIn))  && 
        <>
          <Divider inverted />

          <Grid columns={2} divided >
          <Grid.Row>
            <Grid.Column>
            <Header as='h4' icon>
            <Icon name='graduation cap' style={{color: 'white'}} />
            <span style={{color: 'white'}}>Login EDU</span>
         
            </Header>
            {loading && <LoadingComponent content="logging in..." /> }
              {!loading && navbarType === 'eem' &&
              <Login
                loginCompleted={loginCompleted}
                loginInitiated={handleLoginInitiated}
              />}
            </Grid.Column>
            <Grid.Column>
            <Header as='h4' icon  style={{paddingTop: '3px'}}>
            <Icon name='id badge' style={{color: 'white'}} />
            <span style={{color: 'white'}}>Login Army 365</span>
         
            </Header>
            <div>
            <Button style={{backgroundColor: '#004080', color:'white', paddingTop: '18px', paddingBottom: '18px'}} size='medium' onClick={signInArmyUser} type='button'>
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
}
        </>
    )
})