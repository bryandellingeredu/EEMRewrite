import { observer } from "mobx-react-lite";
import { Grid} from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityList from "./ActivityList";
import { useState, useEffect } from 'react';
import { Providers } from '@microsoft/mgt';
import ActivityFilters from "./ActivityFilters";
  
export default observer(function ActivityDashboard(){
    const {activityStore} = useStore();
    const{loadingInitial, academicEvents} = activityStore
    const providerStateChanged = () => activityStore.loadActivites();
   const [filterDate, setFilterDate] = useState<Date>(new Date());

   function handleSetFilterDate(date: Date){
    setFilterDate(date);
   }
  
  useEffect(() => {
      activityStore.loadActivites()
    }, [])

  Providers.onProviderUpdated(providerStateChanged);
    return(
          <>
              {loadingInitial
                 &&<LoadingComponent content = 'Loading Events'/>
              }
              {!loadingInitial &&          
        <Grid>
            <Grid.Column width='10'>
               <ActivityList filterDate = {filterDate}/>
            </Grid.Column>
            <Grid.Column width='6'>
            <ActivityFilters setFilterDate = {handleSetFilterDate}/>
            </Grid.Column>
        </Grid>
     }
    </>
    )
})