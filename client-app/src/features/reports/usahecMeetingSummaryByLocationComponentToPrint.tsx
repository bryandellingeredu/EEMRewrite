import { PureComponent } from 'react';
import { Table } from 'semantic-ui-react';
import { v4 as uuid } from "uuid";
import USAHECMeetingSummaryByLocationDateRow from './usahecMeetingSummaryByLocationDateRow';

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

interface GroupedData {
  day: string;
  values: {
    location: string;
    events: TableData[];
  }[];
}

interface Props {
    groupedData: GroupedData[];
  }

  export class USAHECMeetingSummaryByLocationComponentToPrint extends PureComponent<Props> {

    render() {
        const { groupedData } = this.props;
        return (
          <Table celled >
              <Table.Header>
                  <Table.Row>
                  <Table.HeaderCell>Start</Table.HeaderCell>
                  <Table.HeaderCell>End</Table.HeaderCell>
                  <Table.HeaderCell>Meeting Title</Table.HeaderCell>
                  <Table.HeaderCell>Room</Table.HeaderCell>
                  <Table.HeaderCell>Reservation Type</Table.HeaderCell>
                  <Table.HeaderCell>USAHEC Contract</Table.HeaderCell>
                  <Table.HeaderCell colSpan={2}>Description</Table.HeaderCell>               
                  </Table.Row>
              </Table.Header>
          
              {groupedData.map(item => (
                <Table.Body style={{ pageBreakInside: 'avoid'}}>
                <USAHECMeetingSummaryByLocationDateRow key={uuid()} item={item} />
                </Table.Body> 
              ))}
            
          </Table>
          )
  }}

