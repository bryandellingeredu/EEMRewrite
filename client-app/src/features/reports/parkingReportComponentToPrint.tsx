import { PureComponent } from "react";
import { ParkingReportDTO } from "../../app/models/parkingReportDTO";
import { Table } from "semantic-ui-react";
import { v4 as uuid } from "uuid";
import ParkingReportRow from "./parkingReportRow";

interface Props {
    data: ParkingReportDTO[];
    month: string
  }

  export class ParkingReportComponentToPrint extends PureComponent<Props> {

    componentDidMount() {
        const { data } = this.props;
        const {month} = this.props     
      }

      render() {
        return (
            <div>
                 <h2 style={{textAlign: 'center'}}> Parking for the Month of {this.props.month} {this.props.data[0].year}</h2>
                 <Table compact selectable>
                 <Table.Header>
                 <Table.Row>
                 <Table.HeaderCell>Day/Date</Table.HeaderCell>
                 <Table.HeaderCell>Rank, Name, Title</Table.HeaderCell>
                 <Table.HeaderCell>Purpose</Table.HeaderCell>
                 <Table.HeaderCell>Parking Description</Table.HeaderCell>
                 </Table.Row>
                 </Table.Header>
                 <Table.Body>
                  {this.props.data.map(item => (
                    <ParkingReportRow key={uuid()} item={item} /> 
                  ))}
               </Table.Body>
                </Table> 
            </div>
        );
      }
  }