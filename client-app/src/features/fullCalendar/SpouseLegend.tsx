import { useState} from "react";
import { Label } from "semantic-ui-react";

interface Legend{
    id: string
    color: string
    name: string
}

export default function SpouseLegend(){
    const [spouseLegend, setSpouseLegend] = useState<Legend[]>(
        [
            {id: '1', color:  '#8A3324', name: 'ACS'},    
            {id: '2', color: '#C2B280', name: 'Chapel'},
            {id: '3', color: '#FF8C00', name: 'Dunham'},
            {id: '4', color: '#301934', name: 'Fitness'},
            {id: '5', color: '#E75480', name: 'MSFP'},
            {id: '6', color: '#8B0000', name: 'MWR'},
            {id: '7', color: '#006400', name: 'USAWC'},
        ]
    );
    return(
        <div>
             {spouseLegend.map(item => (
        <Label key={item.id} size='big' style={{backgroundColor: item.color, color: 'white', marginBottom: '5px'}} content = {item.name} />
      ))}
        </div>
    )
}