import { observer } from "mobx-react-lite";
import { Grid, Icon, Segment } from "semantic-ui-react";
import { GraphScheduleItem } from "../../app/models/graphScheduleItem";

interface Props{
    item: GraphScheduleItem
}

export default observer (function RoomAvailabilityDetails({item}: Props){

    const formatDate = (start: string, end: string) => {
        const months = ["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
        const startdt = new Date(start);
        const enddt = new Date(end);
        const startmonth = months[startdt.getMonth()];
        const endmonth = months[enddt.getMonth()];
        const startday = startdt.getDate().toString().padStart(2,'0');
        const endday = enddt.getDate().toString().padStart(2,'0');
        const starthour = startdt.getHours().toString().padStart(2,'0');
        const endhour = enddt.getHours().toString().padStart(2,'0');
        const startminute = startdt.getMinutes().toString().padStart(2,'0');
        const endminute = startdt.getMinutes().toString().padStart(2,'0');
        const startFormattedDay = `${startmonth} ${startday}`;
        const endFormattedDay = `${endmonth} ${endday}`;
        if(startFormattedDay === endFormattedDay){
            return `${startFormattedDay} ${starthour} : ${startminute} - ${endhour} : ${endminute} `;
        } else{
            return `${startFormattedDay} ${starthour} : ${startminute} - ${endFormattedDay} ${endhour} : ${endminute} `;
        }
      
    }
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
                 { formatDate(item.start.dateTime, item.end.dateTime)}
                 </Grid.Column>
                 <Grid.Column width={6}>
                 { item.subject}
                 </Grid.Column>
             </Grid>
         </Segment>    
    )
})