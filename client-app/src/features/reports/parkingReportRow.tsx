import { Table } from "semantic-ui-react";
import { ParkingReportDTO } from "../../app/models/parkingReportDTO";
import { useHistory } from 'react-router-dom';

interface Props {
    item: ParkingReportDTO;
  }

  export default function ParkingReportRow({item} : Props){
    const history = useHistory();
    return (
      <Table.Row  onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.activityId}/${item.categoryId}`)}>
            <Table.Cell> {item.startDate}</Table.Cell>
           <Table.Cell>
            <strong>{item.rank} {' '} {item.name}</strong>  
            <p>{item.title}</p>
           </Table.Cell>
           <Table.Cell>
            <strong>{item.purposeOfVisit}</strong>
            <br /><strong>LOCATION: </strong>{item.location}
            <br /><strong>POC: </strong>{item.actionOfficer}
           </Table.Cell>
           <Table.Cell>{item.parkingDetails}</Table.Cell>
        </Table.Row>
    )
  }