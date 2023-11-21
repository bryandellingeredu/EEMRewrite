import { Button, Icon } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import TeamsInformationArmy from "./TeamsInformationArmy";

interface Props{
    allDayEvent: boolean
    start: Date
    end: Date
    title: string
    armyTeamLink: string
    updateArmyTeamLink : (newTeamLink: string) => void;
    recurrenceInd: boolean
}
export default function TeamsButtonArmy({allDayEvent, start, end, title, armyTeamLink, updateArmyTeamLink, recurrenceInd}: Props){
    const {modalStore} = useStore();
    const {openModal} = modalStore;
    return <Button
    secondary
    type="button"
    icon
    labelPosition="left"
    onClick={() =>
        openModal(
          <TeamsInformationArmy
           allDayEvent = {allDayEvent}
           start = {start}
           end = {end}
           title = {title}
           armyTeamLink = {armyTeamLink}
           updateArmyTeamLink = {updateArmyTeamLink}
           recurrenceInd={recurrenceInd}
          
          />, 'large'
        )
      }
    >
        Army Teams Meeting
        {(armyTeamLink && armyTeamLink.length> 0)  ?
         <Icon name="check square outline" size='large'/> :
          <Icon name="square outline" size='large' />}
    </Button>

}