import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Icon, Label } from "semantic-ui-react";

export default function GenericLegend(){
    return(
        <div>
                  <Label style={{ marginBottom: '5px'}} color='grey'>
      <Icon name='redo alternate' /> Repeating Event
      </Label>
      <Label style={{ marginBottom: '5px'}} color='grey'>
      <Icon name='tv' /> Teams Meeting
      </Label>
      <Label style={{ marginBottom: '5px'}} color='grey'>
      <FontAwesomeIcon icon={faCalendarPlus} className="fa-calendar-plus"  style={{ marginRight: '8px' }} />From Other Calendar
      </Label>
        </div>
    )
}