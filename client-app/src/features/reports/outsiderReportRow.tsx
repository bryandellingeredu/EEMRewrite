import { Popup, Table } from "semantic-ui-react";
import { useHistory } from 'react-router-dom';

interface TableData{
    id: string
    categoryId: string
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    organizationName: string
    hostingReportStatus: string
    createdBy: string
    outsiderReportDirectorate : string
    outsiderReportEngagement : string
    outsiderReportUSAWCGraduate: string
    outsiderReportDV: string
    outsiderReportNumOfPeople: string
  }

  interface Props {
    item: TableData;
  }

export default function OutsiderReportRow({item} : Props){
    const history = useHistory();

    const renderTextWithPopup = (text: string) => {
        if(!text) return '';
        return text.length > 25 ? (
            <Popup content={text} trigger={ <span>{`${text.substring(0, 25)}...`}</span>}  flowing hoverable />
        ) : text;
    }

    return (
        <Table.Row  onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.id}/${item.categoryId}`)}>
        <Table.Cell>
           {renderTextWithPopup(item.title)}
         </Table.Cell>
         <Table.Cell>{item.start}</Table.Cell>
         <Table.Cell>{item.end}</Table.Cell>
         <Table.Cell>
           {renderTextWithPopup(item.location)}
         </Table.Cell>
         <Table.Cell>{item.hostingReportStatus || 'Draft'}</Table.Cell>
         <Table.Cell>
           {renderTextWithPopup(item.actionOfficer)}
         </Table.Cell>  
         <Table.Cell>
           {renderTextWithPopup(item.outsiderReportDirectorate)}
         </Table.Cell>  
         <Table.Cell>
           {renderTextWithPopup(item.outsiderReportEngagement)}
         </Table.Cell> 
         <Table.Cell>
           {renderTextWithPopup(item.outsiderReportUSAWCGraduate)}
         </Table.Cell> 
         <Table.Cell>
           {renderTextWithPopup(item.outsiderReportDV)}
         </Table.Cell>  
         <Table.Cell colSpan = '2'>
            {item.outsiderReportNumOfPeople}
        </Table.Cell>          

   </Table.Row> 
    )
}