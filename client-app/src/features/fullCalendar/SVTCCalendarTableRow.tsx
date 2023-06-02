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
    vtcClassification: string
    distantTechPhoneNumber: string
    requestorPOCContactInfo: string
    dialInNumber: string
    siteIDDistantEnd: string
    gosesInAttendance: string
    seniorAttendeeNameRank: string
    additionalVTCInfo: string
    vtcStatus: string
  }

  interface Props {
    item: TableData;
  }

  export default function SVTCCalendarTableRow({item} : Props){
    const history = useHistory();

    const renderTextWithPopup = (text: string) => {
        if(!text) return '';
        return text.length > 25 ? (
            <Popup content={text} trigger={ <span>{`${text.substring(0, 25)}...`}</span>}  flowing hoverable />
        ) : text;
    }

    return (
        <Table.Row 
        positive={item.vtcStatus === 'Confirmed'}
        negative={item.vtcStatus === 'Cancelled'}
         onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.id}/${item.categoryId}`)}>
        <Table.Cell>
           {renderTextWithPopup(item.title)}
         </Table.Cell>
         <Table.Cell>{item.start}</Table.Cell>
         <Table.Cell>{item.end}</Table.Cell>
         <Table.Cell>
           {renderTextWithPopup(item.location)}
         </Table.Cell>
         <Table.Cell>
           {renderTextWithPopup(item.actionOfficer)}
         </Table.Cell> 
         <Table.Cell>{item.vtcClassification}</Table.Cell>
         <Table.Cell> {renderTextWithPopup(item.distantTechPhoneNumber)}</Table.Cell>
         <Table.Cell> {renderTextWithPopup(item.requestorPOCContactInfo)}</Table.Cell>
         <Table.Cell> {renderTextWithPopup(item.dialInNumber)}</Table.Cell>
         <Table.Cell> {renderTextWithPopup(item.siteIDDistantEnd)}</Table.Cell>
         <Table.Cell> {renderTextWithPopup(item.seniorAttendeeNameRank)}</Table.Cell>
         <Table.Cell> {renderTextWithPopup(item.additionalVTCInfo)}</Table.Cell>
         <Table.Cell colSpan = '2'>{item.vtcStatus}</Table.Cell>
        </Table.Row>
    )
  }