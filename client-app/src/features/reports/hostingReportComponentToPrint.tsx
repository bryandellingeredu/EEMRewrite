import { PureComponent } from 'react';
import { ActivityFormValues } from '../../app/models/activity';
import { convertFromRaw, EditorState } from 'draft-js';
import HostingReportPDF from './hostingReportPDF';
import { Card } from 'semantic-ui-react';

interface Props {
  activity: ActivityFormValues;
}

export class HostingReportComponentToPrint extends PureComponent<Props> {

  render() {
    const { activity } = this.props
    return (
      <Card.Group  itemsPerRow={1} fluid>
    <HostingReportPDF  activity={activity} />
    </Card.Group>
    );
  }
}