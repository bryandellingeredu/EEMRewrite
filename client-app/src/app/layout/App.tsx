import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import {  Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../api/agent';
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const providerStateChanged = () => activityStore.loadActivites();

  useEffect(() => {
    activityStore.loadActivites()
    }, [activityStore])

  Providers.onProviderUpdated(providerStateChanged);

 

  function handleCreateorEditActivty(activity: Activity){
  setSubmitting(true);
  if(activity.id){
    agent.Activities.update(activity).then(() =>{
    setSubmitting(false);
    setActivities([...activities.filter(x => x.id !== activity.id), activity]);
    setSelectedActivity(activity);
    setEditMode(false);
    setSelectedActivity(activity);
  })
  } else {
    agent.Activities.create(activity).then(response=>{
      const newActivity = {...response, category: activity.category, bodyPreview: activity.bodyPreview};
      setActivities([...activities, newActivity]);
      setSelectedActivity(newActivity);
      setEditMode(false);
      setSubmitting(false);
  })}}

  function handleDeleteActivity(id: string){
    setSubmitting(true);
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(x => x.id !== id)])
      setSubmitting(false);
    })
    
  }


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
        <ActivityDashboard
         activities={activityStore.activities}
         createOrEdit = {handleCreateorEditActivty}
         deleteActivity = {handleDeleteActivity}
         submitting = {submitting}
          />
      </Container>
      }
    </>
  );
}

export default observer(App);
