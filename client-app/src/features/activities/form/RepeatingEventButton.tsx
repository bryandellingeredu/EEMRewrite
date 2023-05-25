import { Button, Divider, Form, Icon, Message, Popup } from "semantic-ui-react";
import RecurrenceInformation from "./RecurrenceInformation";
import { useStore } from "../../../app/stores/store";
import { Recurrence } from "../../../app/models/recurrence";
import RecurrenceMessage from "../recurrenceMessage/RecurrenceMessage";
import { ReactNode } from 'react';

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
    handleRecurringClose: () => void;
    handleRecurringOpen: () => void;
    popupRecurringOpen: boolean;
    renderConfirmModal: () => ReactNode;
    handleSetConfirmModalOpen: () => void;
    cancellingRooms: boolean
  
}

export default function RepeatingEventButton(
    {id, manageSeries, originalRoomEmails, recurrenceInd, recurrenceDisabled,
        recurrence, start, setRecurrence, setRecurrenceInd,
        handleRecurringClose, handleRecurringOpen, popupRecurringOpen,
        renderConfirmModal, handleSetConfirmModalOpen, cancellingRooms} : Props 
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
                  open={popupRecurringOpen}
                  onOpen={handleRecurringOpen}
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
                     <Button
            floated="right"
            icon
            size="mini"
            color="black"
            compact
            onClick={() => handleRecurringClose()}
          >
            <Icon name="close" />
          </Button>
                    Why can't I change how this series repeats?
                  </Popup.Header>
                  <Popup.Content>
                    This series has current room reservations. To change the
                    series you must first cancel the room reservations.
                         <Divider />
                      <Button type='button' primary
                        onClick={() => {handleSetConfirmModalOpen()}}
                         loading={cancellingRooms}>
                        Cancel Room Reservation
                      </Button> 
                      {renderConfirmModal()}
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
           {recurrenceInd && recurrence && (!id || (manageSeries && manageSeries === "true")) &&
      
           <RecurrenceMessage values={recurrence} weeklyRepeatType={recurrence.weeklyRepeatType} monthlyDayType={recurrence.monthlyDayType} monthlyRepeatType={recurrence.monthlyRepeatType} />
           }
           {recurrenceInd && recurrence && id && (!manageSeries || manageSeries !== "true" ) &&
          <div style={{
            padding: '1em',
            margin: '1em 0',
            border: '1px solid #d4a017',
            backgroundColor: '#ffffcc',
            color: '#9f6000'
        }}>
            <h2>Warning you are updating an event outside of its series!</h2>
            <h3>Any updates will only effect this event not the entire series. To update the entire series hit cancel and choose update entire series.</h3>
        </div>
           }
           
       </>
    )
}

