import { Recurrence } from "../../../app/models/recurrence"
import { observer } from 'mobx-react-lite';
import { Button, Divider, Header, Icon } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import RecurrenceMessage from "./RecurrenceMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";

interface Props {
    recurrence: Recurrence
    title: string
}

export default observer(function RecurrenceMessageWrapper({ recurrence, title } : Props) {

    const { modalStore } = useStore();

    return (
        <>
 <Button
 floated="right"
 icon
 size="mini"
 color="black"
 compact
 onClick={() => modalStore.closeModal()}
>
 <Icon name="close" />
</Button>
<Header as="h2">
<FontAwesomeIcon icon={faRepeat}  />
 <Header.Content>
   Recurrence Information
   <Header.Subheader>Information about how often {title} will repeat</Header.Subheader>
 </Header.Content>
</Header>
<Divider />
<RecurrenceMessage
                  values={recurrence}
                  weeklyRepeatType={recurrence.weeklyRepeatType}
                  monthlyDayType={recurrence.monthlyDayType}
                  monthlyRepeatType={recurrence.monthlyRepeatType}
                />
</>
)
})