import { Fragment, PureComponent } from 'react';
import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, EditorState } from 'draft-js';
import { Card, Grid, Header } from 'semantic-ui-react';
import { format } from 'date-fns';
import { HostingReport } from '../../app/models/hostingReport';
import { Activity } from '../../app/models/activity';
import HostingReportPDF from './hostingReportPDF';
import { v4 as uuid } from "uuid";


interface Props {
    hostingReports: Activity[];
  }

  export class HostingReportPDFComponentToPrint extends PureComponent<Props> {

    render() {
        const { hostingReports } = this.props;
        return (
            <div>
              { hostingReports.map(item => (
                <Fragment key={uuid()} >
                  <Card.Group  itemsPerRow={1}>
                        <HostingReportPDF  activity={item} key={uuid()} /> 
                  </Card.Group>
                   <div className="page-break"></div> 
                   </Fragment>            
              ))}
            </div>
          )
  }}

