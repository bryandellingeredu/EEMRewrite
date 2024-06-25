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
            {id: '1', color: '#C2B280', name: 'Chapel'},    
            {id: '2', color: '#FF8C00', name: 'Dunham'},
            {id: '3', color: '#8B0000', name: 'MWR'},
            {id: '4', color: '#006400', name: 'USAWC Event'},
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