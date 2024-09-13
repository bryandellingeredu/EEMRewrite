import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState} from "react";
import { Icon, Label } from "semantic-ui-react";

interface Legend{
    id: string
    color: string
    name: string
}



export default function ExecLegend(){
    const [msfpLegend, setMSFPLegend] = useState<Legend[]>(
        [
            {id: '1', color: '#ffa14e', name: 'Class Lectures NTL/EL'},
            {id: '2', color: '#800080', name: 'CSL'},
            {id: '3', color: '#0579cc', name: 'DV Visits'},
            {id: '4', color: '#819e43', name: 'Events'},
            {id: '5', color: '#d1c9a2', name: 'Graduation & Service B-Day Celebrations'},
            {id: '6', color: '#058a8a', name: 'Off-Sites & Outreach'},
            {id: '7', color: '#ffcc05', name: 'SLDS'},
            {id: '8', color: '#e6a19f', name: 'Socials'},
        ]
    );
    return(
        <div>
             {msfpLegend.map(item => (
        <Label key={item.id} size='big' style={{backgroundColor: item.color, color: 'white', marginBottom: '5px'}} content = {item.name} />
      ))}
           <Label style={{ marginBottom: '5px'}} color='grey' size='big'>
      <Icon name='redo alternate' /> Repeating Event
      </Label>
      <Label style={{ marginBottom: '5px'}} color='grey' size='big'>
      <Icon name='tv' /> Teams Meeting
      </Label>
      <Label style={{ marginBottom: '5px'}} color='grey' size='big'>
      <FontAwesomeIcon icon={faCalendarPlus} className="fa-calendar-plus"  style={{ marginRight: '8px' }} />From Other Calendar
      </Label>
        </div>
    )
}