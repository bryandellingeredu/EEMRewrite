import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';

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
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);


  const getActivities = () => {
    if (Providers.globalProvider.state === ProviderState.SignedIn) {
      const provider = Providers.globalProvider;
      let graphClient = provider.graph.client;
      graphClient.api('/groups/88d59881-7b15-4adc-a756-5d10681cf99d/calendar/events')
        .get()
        .then(response => {
          console.log(response);
          setActivities(
            response.value.map((activity: Activity) => (
              { ...activity,
                category: 'Academic Calendar',  
                bodyPreview: activity.bodyPreview.split('\r')[0] }))
          );
        })
    }
  }

  const providerStateChanged = () => { getActivities(); }

  useEffect(() => { getActivities(); }, [])

  Providers.onProviderUpdated(providerStateChanged);

  function handleSelectActivity(id: string){
    setSelectedActivity(activities.find(x => x.id === id))
  }

  function handleCancelSelectActivity(){
    setSelectedActivity(undefined);
  }

  function handleFormOpen(id?: string){
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  }

  function handleFormClose(){
    setEditMode(false);
  }

  function handleCreateorEditActivty(activity: Activity){
   activity.id 
    ? setActivities([...activities.filter(x => x.id !== activity.id), activity])
    : setActivities([...activities, {...activity, id: uuid()}]);
    setEditMode(false);
    setSelectedActivity(activity);
  }

  function handleDeleteActivity(id: string){
    setActivities([...activities.filter(x => x.id !== id)])
  }


  return (
    <>
      <Container style={{ marginTop: '7em' }}>
        <Navbar openForm={handleFormOpen} />
      </Container>
      {isSignedIn &&
        <ActivityDashboard
         activities={activities}
         selectedActivity={selectedActivity}
         selectActivity = {handleSelectActivity}
         cancelSelectActivity = {handleCancelSelectActivity}
         editMode = {editMode}
         openForm = {handleFormOpen}
         closeForm = {handleFormClose}
         createOrEdit = {handleCreateorEditActivty}
         deleteActivity = {handleDeleteActivity}
          />
      }
    </>
  );
}

export default App;
