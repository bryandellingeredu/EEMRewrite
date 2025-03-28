import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState} from "react";
import { Icon, Label } from "semantic-ui-react";

interface Legend{
    id: string
    color: string
    name: string
}



export default function CIOEventPlanningLegend(){
    const [cioEventPlanningLegend, setCIOEventPlanningLegend] = useState<Legend[]>(
        [
            {id: '1', color: '#F2BA49', name: 'Pending'},
            {id: '2', color: '#006633', name: 'Ready'},
            {id: '3', color: '#FF3333', name: 'Closed'},
        ]
    );
    return(
        <div>
             {cioEventPlanningLegend.map(item => (
        <Label key={item.id} size='big' style={{backgroundColor: item.color, color: 'white', marginBottom: '5px'}} content = {item.name} />
      ))}
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