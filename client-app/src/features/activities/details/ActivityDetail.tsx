import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import {useEffect} from "react";
import { observer } from "mobx-react-lite";
import ActivityDetailedHeader from "./ActivityDetailedHeader";
import ActivityDetailedInfo from "./ActivityDetailedInfo";
import ActivityDetailedSideBar from "./ActivityDetailedSideBar";

export default observer (function ActivityDetails() {

    const{activityStore} = useStore();
    const {selectedActivity: activity, loadActivity, loadingInitial} = activityStore
    const {id} = useParams<{id: string}>();
    const {email} = useParams<{email: string}>();

    useEffect(() => {
      if(id){
        activityStore.loadActivity(id);
      } 
    },[id, loadActivity])

    if (loadingInitial || !activity) return <LoadingComponent/>;

    return(
      <Grid>
         <Grid.Column width={10}>
            <ActivityDetailedHeader activity={activity}/>
            <ActivityDetailedInfo activity={activity}/>
         </Grid.Column>
         <Grid.Column width={6}>
         {/* <ActivityDetailedSideBar attendees={null}/> */}
         </Grid.Column>
      </Grid>
    )
})