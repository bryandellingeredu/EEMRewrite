import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { Button, Dimmer, Divider, Header, Icon, Loader, Segment, SegmentGroup } from "semantic-ui-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import agent from "../../app/api/agent";
import { RoomReportEventsResponseDTO } from "../../app/models/roomReportEventsResponseDTO";
import Speedomter from "./speedometer";
interface Props{
    name: string
    used: number
    unused: number
    start: Date
    end: Date
}
export default observer(function RoomUsageDetailModal({name, used, unused, start, end} : Props) {
    const { modalStore, graphRoomStore } = useStore();
    const {closeModal} = modalStore;
    const { graphRooms, loadGraphRooms } = graphRoomStore;
    const [loading, setLoading] = useState(true)
    const [roomReportEventsResponseDTO, setRoomReportEventsResponseDTO] = useState<RoomReportEventsResponseDTO[]>([]);

    useEffect(() => {
        if (!graphRooms.length) loadGraphRooms();
        if(graphRooms.length && start && end && start <= end && name){
            const email = graphRooms.find(x => x.displayName === name)!.emailAddress
            agent.RoomReports.details(start, end, email).then((response) => {
                setLoading(false);
                setRoomReportEventsResponseDTO(response);
            });
        }
    }, [start, end, name, graphRooms.length, loadGraphRooms]); 

    const getPercentage = () => {
      const total = used + unused;
      const usedPercentage = total !== 0 ? ((used / total) * 100).toFixed(2) : "0.00";
      return parseFloat(usedPercentage);
    }
    return(
        <>
             <Button
            floated="right"
            icon
            size="mini"
            color="black"
            compact
            onClick={() => closeModal()}
          >
            <Icon name="close" />
          </Button>

    
            <Header as="h2" textAlign="center">    
              {name} Usage Details
              
              <Header.Subheader>
                <strong>From: </strong>{format(start, 'MM/dd/yyyy')}
                <strong> To: </strong>{format(end, 'MM/dd/yyyy')}
              </Header.Subheader>
              <Header.Subheader>
               <strong>Total: </strong> {used + unused} hours
               <strong> Used: </strong> {used} hours
               <strong> Unused: </strong> {unused} hours
               <strong> Percent Used: </strong> {getPercentage()} %
              </Header.Subheader>

            </Header>
            {loading && 
             <Segment style={{height: '200px'}}>
             <Dimmer active >
               <Loader inverted>Loading Data...</Loader>
             </Dimmer>
           </Segment>
            }
            <Speedomter percentage={getPercentage()}/>
            {!loading && roomReportEventsResponseDTO.length > 0 &&
              <SegmentGroup>
                 {roomReportEventsResponseDTO.map((item, index) => (
            <Segment key={index} color='teal'>
              <Header as='h3' content={item.subject} textAlign="center">
              </Header>
              <p>
                <span>{item.start.split('T')[0].split('-')[1]}/{item.start.split('T')[0].split('-')[2]}/{item.start.split('T')[0].split('-')[0]}</span>
                 <span>{' '} </span>
                 <span>{item.start.split('T')[1].split('.')[0]}</span>
                 <span> - </span>
                 <span>{item.end.split('T')[0].split('-')[1]}/{item.end.split('T')[0].split('-')[2]}/{item.end.split('T')[0].split('-')[0]}</span>
                 <span>{' '} </span>
                 <span>{item.end.split('T')[1].split('.')[0]}</span>
              </p>
              <p><strong>Status: </strong> {item.status} </p>
       
            </Segment>
          ))}
              </SegmentGroup>
            }
       
        </>
    )
})