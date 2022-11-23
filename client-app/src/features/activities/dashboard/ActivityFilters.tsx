import { Calendar } from "react-calendar";
import { Header, Menu } from "semantic-ui-react";

interface Props {
    setFilterDate: (date: Date) => void
}
export default function ActivityFilters({setFilterDate} : Props){
    return(
        <Calendar onChange={(date : Date) => setFilterDate(date)}/>
    )
}