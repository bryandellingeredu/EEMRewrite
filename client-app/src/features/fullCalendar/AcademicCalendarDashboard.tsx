import { observer } from "mobx-react-lite";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import AcademicCalendar from "./AcademicCalendar";
import { Message } from "semantic-ui-react";
import { Login } from "@microsoft/mgt-react";

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

  
export default observer(function AcademicCalendarDashboard(){


    const [isSignedIn] = useIsSignedIn();


    return(
          <>
             
              {isSignedIn &&  <AcademicCalendar/>}
     {!isSignedIn &&
     <>
         <Message size='massive'
         warning
         header='You Must Sign Into EDU'
         content='To view the Student Calendar Academic Year 2023 you must have an edu account,
         you must be a member of the academic calendar group,
        and you must sign in to your edu account. Please Logout and then sign in to the EEM with edu account'/>
       </>
     }
    </>
    )
})