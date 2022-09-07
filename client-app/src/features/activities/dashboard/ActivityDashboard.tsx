import { observer } from "mobx-react-lite";
import { Container, Grid} from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityDetails from "../details/ActivityDetail";
import ActivityForm from "../form/ActivityForm";
import ActivityList from "./ActivityList";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';

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
    const {selectedActivity, editMode } = activityStore;
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
        <Grid>
            <Grid.Column width='10'>
               <ActivityList />
            </Grid.Column>
            <Grid.Column width='6'>
               {selectedActivity && !editMode && <ActivityDetails/>}
               {editMode && <ActivityForm />}
            </Grid.Column>
        </Grid>
     }
    </>
    )
})