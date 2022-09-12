import { observer } from "mobx-react-lite";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import Calendar from "./Calendar";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/store";

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

  
export default observer(function ActivityDashboard(){
    const {activityStore} = useStore();
    const{loadingInitial} = activityStore
    const providerStateChanged = () => activityStore.loadActivites();
    const [isSignedIn] = useIsSignedIn();

  
  useEffect(() => {
    activityStore.loadActivites()
    }, [activityStore])

  Providers.onProviderUpdated(providerStateChanged);
    return(
          <>
              {isSignedIn && loadingInitial
                 &&<LoadingComponent content = 'Loading App'/>
              }
              {isSignedIn && !loadingInitial &&          
       <Calendar/>
     }
    </>
    )
})