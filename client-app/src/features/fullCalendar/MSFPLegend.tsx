import { useState} from "react";
import { Label } from "semantic-ui-react";

interface Legend{
    id: string
    color: string
    name: string
}



export default function MSFPLegend(){
    const [msfpLegend, setMSFPLegend] = useState<Legend[]>(
        [
            {id: '1', color: '#00008B', name: 'Leadership & Readiness'},
            {id: '2', color: '#FF8C00', name: 'Personal Finance Management'},
            {id: '3', color: '#8B0000', name: 'Personal Growth and Fitness'},
            {id: '4', color: '#006400', name: 'Family Growth & Resiliency'},
            {id: '5', color: '#00008B', name: 'TS-SCI'},
        ]
    );
    return(
        <div>
             {msfpLegend.map(item => (
        <Label key={item.id} size='big' style={{backgroundColor: item.color, color: 'white', marginBottom: '5px'}} content = {item.name} />
      ))}
        </div>
    )
}