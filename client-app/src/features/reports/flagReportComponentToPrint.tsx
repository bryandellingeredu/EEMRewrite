import { PureComponent } from "react";
import { FlagReportDTO } from "../../app/models/flagReportDTO";
import { Message, Table } from "semantic-ui-react";
import { v4 as uuid } from "uuid";
import FlagReportRow from "./flagReportRow";
import { format } from "date-fns";

interface Props {
    data: FlagReportDTO[];
    month: string
  }

  export class FlagReportComponentToPrint extends PureComponent<Props> {

    componentDidMount() {
        const { data } = this.props;
        const {month} = this.props
        
      }

      render() {
        return (
            <div>
            <h2 style={{textAlign: 'center'}}> FLAGS for the Month of {this.props.month} {this.props.data[0].year}</h2>
            <Table compact selectable>
               <Table.Header>
                <Table.Row>
                <Table.HeaderCell>Day/Date</Table.HeaderCell>
                <Table.HeaderCell>Rank, Name, Title</Table.HeaderCell>
                <Table.HeaderCell>Purpose</Table.HeaderCell>
                <Table.HeaderCell>Setup / Start Time</Table.HeaderCell>
                <Table.HeaderCell>Flag Description</Table.HeaderCell>
                </Table.Row>
               </Table.Header>
               <Table.Body>
               {this.props.data.map(item => (
                <FlagReportRow key={uuid()} item={item} /> 
              ))}
               </Table.Body>
            </Table>
            <Message info
            header={`As of ${format(new Date(), 'M/d/yyyy h:mm a')}`}
            list={[
              'No Flags in CCR / Bradley Auditorium / Mary Walker Room  / Seminar',
              'Rooms (due to tiles / low ceilings) / not during a VTC; No Flags for foreign nationals',
              'AHEC takes care of Flags on their end with the exception of International Flags',
              'Collins Hall takes care of Flags on their end with the exception of International Flags',
              'No Flags (even for foreign nationals) in CCR / Bradley Auditorium / Seminar Rooms  / during a VTC',
              'AHEC and Collins Hall manage Flags on their end with the exception of International Flags'
            ]}

            >
               
            </Message>
          </div>
        );
      }
  }