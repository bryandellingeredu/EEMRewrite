import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import {useEffect, useState} from "react";
import { observer } from "mobx-react-lite";
import ActivityDetailedHeader from "./ActivityDetailedHeader";
import ActivityDetailedInfo from "./ActivityDetailedInfo";
import ActivityDetailedSideBar from "./ActivityDetailedSideBar";
//import ActivityDetailedSideBar from "./ActivityDetailedSideBar";

export default observer (function ActivityDetails() {

    const{activityStore, commonStore} = useStore();
    const {setRedirectId, setRedirectCategoryId} = commonStore
    const {selectedActivity: activity, loadActivity, loadingInitial} = activityStore
    const { id, categoryId, backToCalendarId } = useParams<{
       id: string, categoryId: string, backToCalendarId?: string }>();
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const handleReloadTrigger = () => setReloadTrigger(true);

    useEffect(() => {
      setRedirectId('');
      setRedirectCategoryId('');
      if(id){
        activityStore.loadActivity(id, categoryId);
      } 
    },[id, categoryId, loadActivity, activityStore, reloadTrigger])

    if (loadingInitial || !activity) return <LoadingComponent/>;

    return(
      <Grid>
         <Grid.Column width={10}>
            <ActivityDetailedHeader
             activity={activity}
              setReloadTrigger={handleReloadTrigger}
              backToCalendarId={backToCalendarId}
              />
            <ActivityDetailedInfo activity={activity}/>
         </Grid.Column>
         <Grid.Column width={6}>
         { <ActivityDetailedSideBar activity={activity}/> }
         </Grid.Column>
      </Grid>
    )
})