
import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Container, Header, Segment, Image, Button, Divider, Label, Grid, Icon } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import ValidationErrors from "../errors/ValidationErrors";
import { useEffect } from 'react';


export default observer(function HomePage(){
    const history = useHistory();
    const {userStore, graphUserStore, commonStore} = useStore();
    const {loadEDUGraphUser, armyProfile} = graphUserStore;
    const {redirectId, redirectCategoryId} = commonStore;
    const {signInEDUGraphUser, signInArmyUser, loadingInitial, errors} = userStore;
    const [loading, setLoading] = useState<boolean>(false);
    const loginCompleted = () => {
        setLoading(true);
        loadEDUGraphUser().then((graphUser) => {
          if(graphUser){
            signInEDUGraphUser(graphUser).then(() =>{
              history.push(`${process.env.PUBLIC_URL}/activityTable`);
            })
          }
        });
      };

      useEffect(() => {
        if(redirectId && redirectCategoryId && userStore.isLoggedIn) history.push(`${process.env.PUBLIC_URL}/activities/${redirectId}/${redirectCategoryId}`)
        if(!redirectId && userStore.isLoggedIn && armyProfile) history.push(`${process.env.PUBLIC_URL}/activityTable`);
      }, [redirectId, redirectCategoryId, userStore.isLoggedIn, armyProfile ])

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

     {userStore.isLoggedIn && !armyProfile &&
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
           
      {!userStore.isLoggedIn && 
        <>
          <Divider inverted />

          <Grid columns={3} divided >
          <Grid.Row>
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
            <Grid.Column>
            <Header as='h2' icon>
            <Icon name='graduation cap' style={{color: 'white'}} />
            <span style={{color: 'white'}}>Login EDU</span>
            <Header.Subheader>
            <span style={{color: 'orange'}}>I only have an EDU Account.</span>
            </Header.Subheader>
            </Header>
            {loading && <LoadingComponent content="logging in..." /> }
              {!loading &&
              <Login
                loginCompleted={loginCompleted}
                loginInitiated={() => setLoading(true)}
              />}
            </Grid.Column>
            <Grid.Column>
            <Header as='h2' icon>
            <Icon name='id badge' style={{color: 'white'}} />
            <span style={{color: 'white'}}>Login Army 365</span>
            <Header.Subheader>
            <span style={{color: 'orange'}}>I only have a CAC.</span>
            </Header.Subheader>
            </Header>
            <Button style={{backgroundColor: '#004080', color:'white'}} size='big' onClick={signInArmyUser} type='button'>
                  <Icon name='user outline' style={{color: 'white'}}/>
                  Sign In 
                </Button>
            </Grid.Column>        
          </Grid.Row>
          </Grid>
   </>
}

    </Container>
        </Segment>
    )
})