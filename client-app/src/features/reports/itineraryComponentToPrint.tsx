import { PureComponent } from 'react';
import { ActivityFormValues } from '../../app/models/activity';
import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, EditorState } from 'draft-js';

interface Props {
  activity: ActivityFormValues;
}

export class ItineraryComponentToPrint extends PureComponent<Props> {
  state = {
    editorState: EditorState.createEmpty()
  };

  componentDidMount() {
    const { activity } = this.props;

    if (activity.hostingReport?.guestItinerary) {
      this.setState({
        editorState: EditorState.createWithContent(
          convertFromRaw(
            JSON.parse(activity.hostingReport!.guestItinerary)
          )
        )
      });
    } else {
      this.setState({
        editorState: EditorState.createEmpty()
      });
    }
  }

  render() {
    const { editorState } = this.state;
    return (
        <div>
        <h2 style={{textAlign: 'center'}}> Itinerary for {this.props.activity.title}</h2>
        <Editor
          editorState={editorState}
          toolbarClassName='hide-toolbar'
        />
      </div>
    );
  }
}