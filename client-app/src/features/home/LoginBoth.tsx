import { observer } from "mobx-react-lite";
import { Button, Container, Divider, Grid, Header, Icon, Message, Segment, Step } from "semantic-ui-react";
import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Login, Providers, ProviderState } from "@microsoft/mgt-react";
import { useStore } from "../../app/stores/store";

function useIsEDUSignedIn(): [boolean] {
  const [isSEDUignedIn, setIsEDUSignedIn] = useState(false);
  useEffect(() => {
    const updateState = () => {
      const provider = Providers.globalProvider;
      setIsEDUSignedIn(provider && provider.state === ProviderState.SignedIn);
    };

    Providers.onProviderUpdated(updateState);
    updateState();

    return () => {
      Providers.removeProviderUpdatedListener(updateState);
    }
  }, []);
  return [isSEDUignedIn];
}

export default observer(function LoginBoth(){
  const history = useHistory();
    const [isEDUSignedIn] = useIsEDUSignedIn();
    const {graphUserStore, userStore} = useStore();
    const { armyProfile , loadEDUGraphUser} = graphUserStore;
    const {signInEDUGraphUser} = userStore;
    const [loading, setLoading] = useState<boolean>(false);
    const [active, setActive] = useState<string>("step1");
    const [step3Complete, setStep3Complete] = useState<boolean>(false);
    const handleStep1Click = () => {
        setActive("step1");
      };
    const handleStep2Click = () => {
        setActive("step2");
      };
   const handleStep3Click = () => {
        setActive("step3");
      };
  

      useEffect(() => {
        if(isEDUSignedIn && !!!armyProfile) setActive('step2');
        if(!!armyProfile &&  isEDUSignedIn) setActive('step3');
      }, [armyProfile, isEDUSignedIn ]);

      const loginToEEM = () => {
        setLoading(true);
        loadEDUGraphUser().then((graphUser) => {         
          if(graphUser){
            signInEDUGraphUser(graphUser).then(() => {
              history.push(`${process.env.PUBLIC_URL}/activityTable`);
             });    
           }
        });
      };


 return(
    <>
    <Header as="h2">
    <Icon name="check circle" color='teal' />
    <Header.Content>    
      Login to Both
      <Header.Subheader>Login to both Your Army 365 account,  and your .edu account</Header.Subheader>
    </Header.Content>
  </Header>
  <Divider />

  {active}

  <Step.Group ordered widths={3}>
  <Step
          completed={isEDUSignedIn}
          active={active === "step1"}
          link
          onClick={handleStep1Click}
        >
          <Step.Content>
            <Step.Title>Sign in to EDU</Step.Title>
            <Step.Description>Sign in to your .edu account</Step.Description>
          </Step.Content>
  </Step>
  <Step
          completed={!!armyProfile}
          active={active === "step2"}
          link
          onClick={handleStep2Click}
        >
          <Step.Content>
            <Step.Title>Sign in to Army</Step.Title>
            <Step.Description>
              Sign in to your Army 365 Account
            </Step.Description>
          </Step.Content>
        </Step>
        <Step
          completed={step3Complete}
          active={active === "step3"}
          link
          onClick={handleStep3Click}
        >
          <Step.Content>
            <Step.Title>Login to the EEM</Step.Title>
            <Step.Description>Login to the EEM Application</Step.Description>
          </Step.Content>
        </Step>
        
  </Step.Group>

  {active === "step1" && 
  <>
   <Message style={{textAlign: 'center'}} size='massive' color='orange'>
        <Header as ='h1' color='orange' >
        {isEDUSignedIn ? 'You are signed into EDU' : 'Sign into EDU'} 
     </Header>
     <p></p>
     <Header as ='h3' color='orange'>
     {isEDUSignedIn ? 'You are already signed into your edu account. please go to the next step' : 'Make sure you sign in with your EDU Account NOT your army 365 account'}
     
     </Header>
        <p></p>

        {loading && <LoadingComponent content="logging in..." /> }
              {!loading && !isEDUSignedIn && <Login />}
     <Grid>
        <Grid.Row>
            <Grid.Column>

        <Button 
     icon
     labelPosition="right"
     floated="right"
     type="button"
     onClick={handleStep2Click}
     color="orange"
   >
     Next
     <Icon name="arrow right" />
   </Button>
   </Grid.Column>
   </Grid.Row>
   </Grid>
     </Message>
    
   </>
  }


  {active === "step2" && 
  <>
   <Message style={{textAlign: 'center'}} size='massive' color='teal'>
        <Header as ='h1' color='teal' >
           {armyProfile ? 'You are signed into Army' : 'Sign into Army 365'} 
     </Header>
     <p></p>
     <Header as ='h3' color='teal'>
     {armyProfile ? 'You are already signed into Army 365. Please go to the next step.' : 'Make sure you sign in with your Army 365 Account NOT your .edu account'}
     </Header>
        <p></p>
      {!armyProfile &&
        <Button style={{backgroundColor: '#004080', color:'white'}}
         as={Link} to={`${process.env.PUBLIC_URL}/authenticatetoarmy`}
                 size='big'
                  type='button'>
                  <Icon name='user outline' style={{color: 'white'}}/>
                  Sign In 
                </Button>
      }
     <Grid>
        <Grid.Row>
            <Grid.Column>
            <Button 
     icon
     labelPosition="left"
     floated="left"
     type="button"
     onClick={handleStep1Click}
     color="teal"
   >
     Previous
     <Icon name="arrow left" />
   </Button>
        <Button 
     icon
     labelPosition="right"
     floated="right"
     type="button"
     onClick={handleStep3Click}
     color="teal"
   >
     Next
     <Icon name="arrow right" />
   </Button>
   </Grid.Column>
   </Grid.Row>
   </Grid>
     </Message>
    
   </>
  }
 
    {active === "step3" && 
  <>
   <Message style={{textAlign: 'center'}} size='massive' color='violet'>
        <Header as ='h1' color='violet' >
            Sign into the EEM
     </Header>
     <p></p>
     <Header as ='h3' color='violet'>
     After You have signed in to both Army and Edu you may login to the application
     </Header>
        <p></p>

    {!armyProfile &&
    <>
    <Header as ='h4' color='violet'>
     You have not signed into Army 365. please complete step 1
     </Header>
     <p></p>
     </>
}
    {armyProfile && 
        <Button style={{backgroundColor: '#004080', color:'white'}}
         onClick={loginToEEM}
                 size='big'
                  type='button'
                  loading={loading}>
                  <Icon name='user outline' style={{color: 'white'}}/>
                  Log In 
                </Button>
      }
     <Grid>
        <Grid.Row>
            <Grid.Column>
            <Button 
     icon
     labelPosition="left"
     floated="left"
     type="button"
     onClick={handleStep1Click}
     color="violet"
   >
     Previous
     <Icon name="arrow left" />
   </Button>
   </Grid.Column>
   </Grid.Row>
   </Grid>
     </Message>
    
   </>
  }
  </>
 )
});
