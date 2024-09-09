import { Icon, Label } from "semantic-ui-react"

interface ResidentAndDistanceStudentCalendarCategory{
    id: number
    isSelected: boolean
    group: string
    title: string
    color: string
    visible: boolean
}

interface Props{
    studentCategory: ResidentAndDistanceStudentCalendarCategory
    handleLabelClick: (studentCategory: ResidentAndDistanceStudentCalendarCategory) => void;
    visible: boolean
}
export default function ResidentAndDistanceStudentCalendarComponent({studentCategory, handleLabelClick, visible } : Props){

    return(
      <>
    {visible && 
    <Label size="large"
    style={{backgroundColor: studentCategory.color, color: 'white', marginBottom: '5px'}}
    onClick={() => handleLabelClick(studentCategory)}
  >
    <Icon name={studentCategory.isSelected ? 'check square outline' : 'square outline'} size="large" />
    {studentCategory.title}
  </Label>
  }
  </>
)}
