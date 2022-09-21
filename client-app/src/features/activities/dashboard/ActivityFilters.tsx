import { Calendar } from "react-calendar";
import { Header, Menu } from "semantic-ui-react";

interface Props {
    setFilterDate: (date: Date) => void
}
export default function ActivityFilters({setFilterDate} : Props){
    return(
        <>
        
        <Menu vertical size='large' style={{width: '100%', marginTop: 25}}>
          <Header icon='filter' attached color='teal' content='Filters' />
          <Menu.Item content='Academic Calendar' />
          <Menu.Item content="CSL Calendar" />
        </Menu>
        <Header />
        <Calendar onChange={(date : Date) => setFilterDate(date)}/>
        </>
    )
}