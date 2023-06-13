import { Divider, Popup, Table } from "semantic-ui-react";
import { useHistory } from 'react-router-dom';
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
import USAHECMeetingSummaryByLocationRoomRow from "./usahecMeetingSummaryByLocationRoomRow";
import { Fragment } from "react";

interface TableData{
  id: string
  categoryId: string
  title: string
  usahecFacilityReservationType: string
  start : string
  end : string
  location: string
  actionOfficer: string
  createdBy: string
}

interface GroupedData {
  day: string;
  values: {
    location: string;
    events: TableData[];
  }[];
}

  interface Props {
    item: GroupedData;
  }

export default function USAHECMeetingSummaryByLocationDateRow({item} : Props){
    const history = useHistory();



    return (
      <Fragment>
 
     <Table.Row positive >
        <Table.Cell colSpan={8}>
            {format(new Date(item.day),  'EEEE, MMMM d, yyyy')}
         </Table.Cell>
   </Table.Row> 
   {
    item.values.sort((a, b) => a.location.localeCompare(b.location)).map(value => (
      <USAHECMeetingSummaryByLocationRoomRow key={uuid()} item={value} /> 
    ))}
       <Table.Row style={{backgroundColor: '#fcf3e9'}}>
    <Table.Cell colSpan={8}>
         </Table.Cell>
    </Table.Row>
    
   </Fragment>
    )
}