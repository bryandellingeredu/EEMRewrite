import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import {  Container } from 'semantic-ui-react';
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import LoadingComponent from './LoadingComponent';
import { useStore } from '../stores/store';
import { observer } from 'mobx-react-lite';

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

function App() {
  const {activityStore} = useStore();
  const [isSignedIn] = useIsSignedIn();
  const providerStateChanged = () => activityStore.loadActivites();

  useEffect(() => {
    activityStore.loadActivites()
    }, [activityStore])

  Providers.onProviderUpdated(providerStateChanged);
 
  return (
    <>
      <Container style={{ marginTop: '7em' }}>
        <Navbar />
      </Container>
      {isSignedIn && activityStore.loadingInitial
       &&<LoadingComponent content = 'Loading App'/>
      }
      {isSignedIn && !activityStore.loadingInitial &&      
       <Container style={{marginTop: '7em'}}> 
        <ActivityDashboard/>
      </Container>
      }
    </>
  );
}

export default observer(App);
