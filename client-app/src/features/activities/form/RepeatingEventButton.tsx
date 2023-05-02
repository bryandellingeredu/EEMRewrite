import { Button, Form, Icon, Popup } from "semantic-ui-react";
import RecurrenceInformation from "./RecurrenceInformation";
import { useStore } from "../../../app/stores/store";
import { Recurrence } from "../../../app/models/recurrence";
import RecurrenceMessage from "../recurrenceMessage/RecurrenceMessage";

interface Props{
    id: string
    manageSeries: string
    originalRoomEmails: string[]
    recurrenceInd: boolean
    recurrenceDisabled: boolean
    recurrence: Recurrence
    start: Date;
    setRecurrence: (recurrence: Recurrence) => void;
    setRecurrenceInd: (recurrenceInd: boolean) => void;
}

export default function RepeatingEventButton(
    {id, manageSeries, originalRoomEmails, recurrenceInd, recurrenceDisabled,
        recurrence, start, setRecurrence, setRecurrenceInd } : Props 
){
    const {modalStore} = useStore();
    const {openModal} = modalStore;
    return(
        <>
        <div style={{paddingTop: '25px'}} />
        {(!id || (manageSeries && manageSeries === "true")) && (
            <>
              {id && originalRoomEmails && originalRoomEmails.length > 0 && (
                <Popup
                  trigger={
                    <Form.Field >
                      <Button icon labelPosition="left" disabled>
                        Repeating Event
                        {!recurrenceInd && <Icon name="square outline" />}
                        {recurrenceInd && (
                          <Icon name="check square outline" />
                        )}
                      </Button>
                    </Form.Field>
                  }
                >
                  <Popup.Header>
                    Why can't I change how this series repeats?
                  </Popup.Header>
                  <Popup.Content>
                    This series has current room reservations. To change the
                    series you must first cancel the room reservation. To do
                    this choose "no room required" and save your work. you
                    will then be able to set the series and reserve a room.
                  </Popup.Content>
                </Popup>
              )}

              {!(
                id &&
                originalRoomEmails &&
                originalRoomEmails.length > 0
              ) && !recurrenceDisabled && (
                <Form.Field>
                  <Button
                   type="button"
                    icon
                    labelPosition="left"
                    onClick={() =>
                      openModal(
                        <RecurrenceInformation
                          recurrence={recurrence}
                          start={start}
                          setRecurrenceInd={setRecurrenceInd}
                          setRecurrence={setRecurrence}
                        />, 'large'
                      )
                    }
                  >
                    Repeating Event
                    {!recurrenceInd && <Icon name="square outline" />}
                    {recurrenceInd && <Icon name="check square outline" />}
                  </Button>
                </Form.Field>
              )}
            </>
          )}

           {recurrenceDisabled &&
            <Form.Field>
            <label>Recurrence Not Supported For Multi-Day Event:</label>
            <Button
                   type="button"
                    icon
                    labelPosition="left"
                    disabled
                  >
                    Repeating Event
                    {!recurrenceInd && <Icon name="square outline" />}
                  </Button>
            </Form.Field>
           }
           {recurrenceInd && recurrence &&
           <RecurrenceMessage values={recurrence} weeklyRepeatType={recurrence.weeklyRepeatType} monthlyDayType={recurrence.monthlyDayType} monthlyRepeatType={recurrence.monthlyRepeatType} />
           }
       </>
    )
}