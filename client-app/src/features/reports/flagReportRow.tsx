import { Divider, Table } from "semantic-ui-react";
import { FlagReportDTO } from "../../app/models/flagReportDTO";
import { useHistory } from 'react-router-dom';

interface Props {
    item: FlagReportDTO;
  }

  export default function FlagReportRow({item} : Props){
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
           <Table.Cell textAlign="center">
            {item.setupTime}
            <Divider/>
            {item.startTime}
           </Table.Cell>
           <Table.Cell>{item.flagDetails}</Table.Cell>
        </Table.Row>
    )
  }