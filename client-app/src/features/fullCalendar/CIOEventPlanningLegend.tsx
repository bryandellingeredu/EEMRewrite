import { useState} from "react";
import { Label } from "semantic-ui-react";

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
        </div>
    )
}