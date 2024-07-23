import { Popup, Table } from "semantic-ui-react";
import { useHistory } from 'react-router-dom';
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
import USAHECMeetingSummaryByLocationEventRow from "./usahecMeetingSummaryByLocationEventRow";

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
  description: string
  usahecContract: string
}

interface LocationData {
    location: string;
    events: TableData[];
}

  interface Props {
    item: LocationData;
  }

export default function USAHECMeetingSummaryByLocationRoomRow({item} : Props){
    const history = useHistory();

    return (
    <>
     <Table.Row negative >
        <Table.Cell colSpan={8}>
            {item.location}
         </Table.Cell>
   </Table.Row> 
   {
  item.events
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .map(value => (
      <USAHECMeetingSummaryByLocationEventRow key={uuid()} item={value} />
    ))
}
   </>
    )
}