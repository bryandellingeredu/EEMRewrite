import { format } from "date-fns";
import { observer } from "mobx-react-lite";
import { Fragment } from "react";
import { Header} from "semantic-ui-react"
import { useStore } from "../../../app/stores/store";
import { faChurch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActivityListItem from "./ActivityListItem";

interface Props {
   filterDate: Date;
}

export default observer (function ActivityList({filterDate}: Props) {

    const {activityStore} = useStore();
    const {groupedActivities } = activityStore;
    return (
        <>
        {groupedActivities.map(([group, activities]) => (
           group === format(filterDate, 'dd MMM yyyy') &&
           <Fragment key={group}>
             <Header sub color='teal'>
                {group}
             </Header>        
                {activities.map(activity => (
                   <ActivityListItem key={activity.id} activity={activity} />
                ))}         
           </Fragment>
         
       ))}
       
        </>
      )})