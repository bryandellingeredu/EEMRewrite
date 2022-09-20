import { observer } from "mobx-react-lite";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";
import AcademicCalendar from "./AcademicCalendar";
import { Message } from "semantic-ui-react";
import { Login } from "@microsoft/mgt-react";

function useIsSignedIn(): [boolean] {
    const [isSignedIn, setIsSignedIn] = useState(false);
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
    const {activityStore} = useStore();
    const{loadingInitial, academicEvents} = activityStore
    const providerStateChanged = () => activityStore.loadActivites();
    const [isSignedIn] = useIsSignedIn();

  
  useEffect(() => {
    if(!academicEvents.length) activityStore.loadActivites()
    }, [activityStore])

  Providers.onProviderUpdated(providerStateChanged);
    return(
          <>
              {isSignedIn && loadingInitial
                 &&<LoadingComponent content = 'Loading App'/>
              }
              {isSignedIn && !loadingInitial &&          
       <AcademicCalendar/>
     }
     {!isSignedIn && !loadingInitial && !academicEvents.length &&
     <>
         <Message size='massive'
         warning
         header='You Must Sign Into EDU'
         content='To view the academic calendar you must have an edu account,
         you must be a member of the academic calendar group,
        and you must sign in to your edu account.'/>
        <Login/> 
       </>
     }
    </>
    )
})