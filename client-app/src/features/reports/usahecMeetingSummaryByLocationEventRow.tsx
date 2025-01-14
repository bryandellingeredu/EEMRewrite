import { Popup, Table } from "semantic-ui-react";
import { useHistory } from 'react-router-dom';
import { v4 as uuid } from "uuid";
import { format } from "date-fns";

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

  interface Props {
    item: TableData;
  }

export default function USAHECMeetingSummaryByLocationEventRow({item} : Props){
    const history = useHistory();

    const renderTextWithPopup = (text: string) => {
      if(!text) return '';
      return text.length > 50 ? (
          <Popup content={text} trigger={ <span>{`${text.substring(0, 50)}...`}</span>}  flowing hoverable />
      ) : text;
  }

    return (

      <Table.Row  onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.id}/${item.categoryId}`)}>
        <Table.Cell>
            {item.start}
         </Table.Cell>
         <Table.Cell>
            {item.end}
         </Table.Cell>
         <Table.Cell>
         {renderTextWithPopup(item.title)}
         </Table.Cell>
         <Table.Cell>
         {renderTextWithPopup(item.location)}
         </Table.Cell>
         <Table.Cell>
         {renderTextWithPopup(item.usahecFacilityReservationType)}
         </Table.Cell>
         <Table.Cell>
         {renderTextWithPopup(item.usahecContract)}
         </Table.Cell>
         <Table.Cell colSpan={2}>
         {renderTextWithPopup(item.description)}
         </Table.Cell>
   </Table.Row> 



    )
}