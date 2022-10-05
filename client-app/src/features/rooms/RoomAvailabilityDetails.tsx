import { observer } from "mobx-react-lite";
import { Grid, Icon, Segment } from "semantic-ui-react";
import { GraphScheduleItem } from "../../app/models/graphScheduleItem";
import { useStore } from "../../app/stores/store";

interface Props{
    item: GraphScheduleItem
}

export default observer (function RoomAvailabilityDetails({item}: Props){
    const {commonStore} = useStore();
    return( 
        <Segment >
             <Grid>
                 <Grid.Column width={1}>
                    {item.status === 'Busy' && 
                     <Icon size='large' color='red' name='calendar times outline' />
                    }
                     {item.status === 'Tentative' && 
                     <Icon size='large' color='yellow' name='warning sign' />
                    }
                 </Grid.Column>
                 <Grid.Column width={2}>
                     {item.status}
                 </Grid.Column>
                 <Grid.Column width={6}>
                 { commonStore.formatDate(item.start.dateTime, item.end.dateTime)}
                 </Grid.Column>
                 <Grid.Column width={6}>
                 { item.subject}
                 </Grid.Column>
             </Grid>
         </Segment>    
    )
})