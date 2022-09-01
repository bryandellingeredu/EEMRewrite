import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Container, List } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';


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
  const [isSignedIn] = useIsSignedIn();
  const [activities, setActivities] = useState<Activity[]>([]);

  const getActivities = () => {
    if (Providers.globalProvider.state === ProviderState.SignedIn) {
      const provider = Providers.globalProvider;
      let graphClient = provider.graph.client;
      graphClient.api('/groups/88d59881-7b15-4adc-a756-5d10681cf99d/calendar/events')
      .get()
        .then(response => {
          console.log(response); 
          setActivities(response.value);
        })
    }
  }

  const providerStateChanged = () => {
    console.log('provider State Changed');
    getActivities();
  }

  useEffect(() => {
    console.log('use effect');
    getActivities();
  }, [])

  Providers.onProviderUpdated(providerStateChanged);

  return (
  <>
      <Container style={{marginTop: '7em'}}>
        <Navbar/>
      </Container>     
      {isSignedIn &&
      
       <ActivityDashboard activities={activities}/>
      
      }
   </>
  );
}

export default App;
