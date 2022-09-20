import { observer } from "mobx-react-lite";
import { Grid} from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityList from "./ActivityList";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
  
export default observer(function ActivityDashboard(){
    const {activityStore} = useStore();
    const{loadingInitial, cslEvents, academicEvents} = activityStore
    const providerStateChanged = () => activityStore.loadActivites();
   // const [isSignedIn] = useIsSignedIn();

  
  useEffect(() => {
    if(!cslEvents.length || !academicEvents.length) activityStore.loadActivites()
    }, [activityStore])

  Providers.onProviderUpdated(providerStateChanged);
    return(
          <>
              {loadingInitial
                 &&<LoadingComponent content = 'Loading App'/>
              }
              {!loadingInitial &&          
        <Grid>
            <Grid.Column width='10'>
               <ActivityList />
            </Grid.Column>
            <Grid.Column width='6'>
            <h2>Filters</h2>
            </Grid.Column>
        </Grid>
     }
    </>
    )
})