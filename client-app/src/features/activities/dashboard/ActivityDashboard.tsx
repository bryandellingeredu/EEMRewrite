import { observer } from "mobx-react-lite";
import { Grid} from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import { useStore } from "../../../app/stores/store";
import ActivityDetails from "../details/ActivityDetail";
import ActivityForm from "../form/ActivityForm";
import ActivityList from "./ActivityList";

interface Props{
    activities: Activity[];
    createOrEdit: (activity: Activity) => void;
    deleteActivity: (id: string) => void;
    submitting: boolean;

}

export default observer(function ActivityDashboard(
    {   activities,
        createOrEdit,
        deleteActivity,
        submitting
    }: Props){

        const {activityStore} = useStore();
        const {selectedActivity, editMode } = activityStore;

    return(
        <Grid>
            <Grid.Column width='10'>
               <ActivityList activities={activities}
                deleteActivity={deleteActivity}
                submitting={submitting}
                />
            </Grid.Column>
            <Grid.Column width='6'>
                {selectedActivity && !editMode && <ActivityDetails/>}
               {editMode &&
               <ActivityForm 
                createOrEdit={createOrEdit}
                submitting={submitting}
                />}
            </Grid.Column>
        </Grid>
    )
})