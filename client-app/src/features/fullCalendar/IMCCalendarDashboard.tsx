import { observer } from "mobx-react-lite";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Divider, Header, Icon, Message, Segment } from "semantic-ui-react";
import { Login } from "@microsoft/mgt-react";
import IMCCalendarWithAcademicEvents from "./IMCCalendarWithAcademicEvents";
import IMCCalendarWithoutAcademicEvents from "./IMCCalendarWithoutAcademicEvents";
import IMCLegend from "./IMCLegend";

function useIsSignedIn(): [boolean] {
    const [isSignedIn, setIsSignedIn] = useState(true);
    useEffect(() => {
      const updateState = () => {
        const provider = Providers.globalProvider;
        setIsSignedIn(provider && provider.state === ProviderState.SignedIn);
      };
  
      Providers.onProviderUpdated(updateState);
      updateState();
  
      return () => {
        Providers.removeProviderUpdatedListener(updateState);
      }
    }, []);
    return [isSignedIn];
  }

  
export default observer(function IMCCalendarDashboard(){


    const [isSignedIn] = useIsSignedIn();


    return(
          <>     
 <Divider horizontal>
    <Header as='h2'>
      <Icon name='calendar' />
      Integrated Master Calendar
    </Header>
  </Divider>
  <IMCLegend />

    {isSignedIn &&  <IMCCalendarWithAcademicEvents/>}

     {!isSignedIn &&
     <>
       <Segment color='orange'>
       <Header as='h2'>
    <Icon name='warning sign' color='orange' />
    <Header.Content>You are not seeing academic calendar events</Header.Content>
  </Header>
         <p>To view  academic calendar events in the IMC Calendar you must have an edu account,
         you must be a member of the academic calendar group,
        and you must sign in to your edu account.</p>
        <Login/>
       </Segment>
        <IMCCalendarWithoutAcademicEvents/> 
       </>
     }
    </>
    )
})