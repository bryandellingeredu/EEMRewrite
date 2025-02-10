import Select  from "react-select";
import makeAnimated from "react-select/animated";
import { Form, Input, Label } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { useStore } from "../../../app/stores/store";
import { Recurrence } from "../../../app/models/recurrence";
import agent from "../../../app/api/agent";
import { GraphScheduleItem } from "../../../app/models/graphScheduleItem";
import { Activity } from "../../../app/models/activity";
import { GraphScheduleResponse } from "../../../app/models/graphScheduleResponse";
import { toast } from "react-toastify";
import { useRef } from 'react';

interface Option {
  label: string;
  value: string;
  isDisabled: boolean;
}

interface OptionType {
  value: string;
  label: string;
}

interface Props {
  id: string;
  start: Date;
  end: Date;
  setRoomEmails: (emails: string[]) => void;
  roomEmails: string[];
  recurrenceInd: boolean;
  recurrence: Recurrence;
  unlockDateInput: () => void;
  lockDateInput: () => void;
  roomRequired: boolean,
  roomOptionRegistryId: string
  setSvtcSchedule: (schedule : GraphScheduleResponse[]) => void;
}

export default observer(function RoomPicker({
  id,
  start,
  end,
  setRoomEmails,
  roomEmails,
  recurrence,
  recurrenceInd,
  unlockDateInput,
  lockDateInput,
  roomRequired,
  roomOptionRegistryId,
  setSvtcSchedule
}: Props) {
  const animatedComponents = makeAnimated();
  const { availabilityStore, graphRoomStore, commonStore, activityStore} = useStore();
  const { loadingInitial, loadSchedule, loadSVTCSchedule } = availabilityStore;
  const { loadGraphRooms, addUpdateRoomOptions } = graphRoomStore;
  const { getTempRoomEmails, getTempRoomAttendees} = activityStore
  const [roomOptions, setRoomOptions] = useState<Option[]>([
    { label: "", value: "", isDisabled: false },

  ]);
  const [dirty, setDirty] = useState<boolean>(false);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const isFirstRun = useRef(true);

  const handleBuildingChange = (selectedOption: OptionType | null) => {
    setSelectedBuilding(selectedOption ? selectedOption.value : '');
  };

  const onChange = (selectedOptions: any) => {
    const values = selectedOptions.map((item: Option) => item.value);
    setRoomEmails(values);
  };


  useEffect(() => {
    loadSVTCSchedule(start).then((response) => {
      if(response)  setSvtcSchedule(response);
    });
  },[start]);

  useEffect(() => {
    const diff = Math.abs(+end - +start);
    var minutes = Math.floor(diff / 1000 / 60);
    if (minutes >= 15 && start < end) {
      if (recurrenceInd) {
        if(roomRequired) lockDateInput();
        recurrence.activityStart = start;
        recurrence.activityEnd = end;
        agent.Activities.listPossibleByRecurrence(recurrence).then( (activities) => {
          loadSchedule(activities[0].start, activities[activities.length - 1].end).then((schedule) => { 
            if(schedule){
            loadGraphRooms().then((graphRooms) => {
              let o: Option[] = []; 
              schedule.forEach((room) =>
              o.push({
                label:
                  graphRooms.find((x) => x.emailAddress === room.scheduleId)
                    ?.displayName || room.scheduleId,
                value: room.scheduleId,
                isDisabled: getIsRecurrenceDisabled(room, activities)
              })
            );
            setRoomOptions(o);
            addUpdateRoomOptions(roomOptionRegistryId, o);
            unlockDateInput();

            });

          } else{
            unlockDateInput();
          }        
          });
        });
      } else {
        if(roomRequired) lockDateInput();
        loadSchedule(start, end).then((schedule) => {
          if (schedule) {
            let o: Option[] = [];
            loadGraphRooms().then((graphRooms) => {
              schedule.forEach((room) =>
                o.push({
                  label:
                    graphRooms.find((x) => x.emailAddress === room.scheduleId)
                      ?.displayName || room.scheduleId,
                  value: room.scheduleId,
                  isDisabled: getIsDisabled(start, end, room.scheduleItems)
                })
              );
              setRoomOptions(o);
              addUpdateRoomOptions(roomOptionRegistryId, o);
              if(o && o.length > 0 && getTempRoomEmails(id) ){
                setTempRoomEmails(o, getTempRoomEmails(id));
              }
              unlockDateInput();
            });
          }
        });
      }
    }
  }, [start, end, loadSchedule, loadGraphRooms, recurrenceInd, recurrence]);

  function setTempRoomEmails(o: Option[], tRoomEmails: string[] | undefined,) {
 
    // If tRoomEmails are provided, proceed with the logic
    if (tRoomEmails) {
      const disabledTempRoomEmails: string[] = [];
      const enabledTempRoomEmails = tRoomEmails.filter(email => {
        const option = o.find(option => option.value === email);
        if (option && !option.isDisabled) {
          return true;
        } else {
          disabledTempRoomEmails.push(email);  // Add email to disabled list if not enabled
          return false;
        }
      });
  
      // Update the roomEmails state with only the enabled emails
      setRoomEmails(enabledTempRoomEmails);
  
      // Show a toast for any disabled emails
      if (disabledTempRoomEmails.length > 0 && !isFirstRun.current) {
        toast.error(
          <>
            <h4>Room(s) {disabledTempRoomEmails.join(', ')} are not available for that time.</h4>
            <p>Please pick a different time or a different room.</p>
          </>,
          {
            position: "top-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: 'red', color: 'white' }
          }
        );
      }
      if (disabledTempRoomEmails.length > 0 && isFirstRun.current) {
        setRoomEmails(tRoomEmails);
      }
      
    }
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
  }
  }
  





  function getIsRecurrenceDisabled(room: GraphScheduleResponse, activities: Activity[]){
       let result = false;
       if(!room || !room.scheduleItems ||  room.scheduleItems.length <1) return result
       room.scheduleItems.forEach(scheduledItem => {
          activities.forEach(activity => {
            const conflict =  
            (new Date(activity.start) < new Date(scheduledItem.end.dateTime) && new Date(scheduledItem.start.dateTime) < new Date(activity.end)) ||
            (new Date(scheduledItem.start.dateTime) > new Date(activity.start) && new Date(scheduledItem.end.dateTime) < new Date(activity.end)) ||
            (new Date(activity.start) > new Date(scheduledItem.start.dateTime) &&  new Date(activity.end) < new Date(scheduledItem.end.dateTime)) ||
            (new Date(activity.start) === new Date(scheduledItem.start.dateTime) && new Date(activity.end) === new Date(scheduledItem.end.dateTime));
            if(conflict){
              console.log('room', room.scheduleId)
              console.log('schedule', room.scheduleItems)
              result = true;
            }
            return result;
          })
       });
       return result;
  }


  function getIsDisabled(start: Date, end: Date, scheduledItems: GraphScheduleItem[]){
    if (!scheduledItems || scheduledItems.length < 1) return false;
    let result = false;
    scheduledItems.forEach((item) =>{
      const itemStart = new Date(item.start.dateTime);
      const itemEnd = new Date(item.end.dateTime);

      if (
        (new Date(start) < new Date(itemEnd) && new Date(itemStart) < new Date(end)) ||
        (new Date(itemStart) > new Date(start)  &&  new Date(itemEnd) < new Date(end)) ||
        (new Date(start) > new Date(itemStart) && new Date(end) < new Date(itemEnd)) ||
        (new Date(start) === new Date(itemStart) && new Date(end) === new Date(itemEnd))
      ) {
        console.log('scheduled items')
        console.log(scheduledItems);
        result = true;
      }
    });
    return result;
  }

  return (

      <>
      {roomEmails.length < 1 && 
      <Form.Field>
        <label> Filter By Building</label>
        <Select
  name="building"
  placeholder="filter rooms by building"
  isClearable
  onChange={(e) => handleBuildingChange(e)}
  options={Array.from(
    new Set(
      graphRoomStore.graphRooms
        .filter(room => room.building !== null)
        .map(room => room.building)
    )
  )
    .map(building => ({
      value: building,
      label: building,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))}
/>
      </Form.Field>
}

{
  (loadingInitial || graphRoomStore.loadingInitial ) &&
  <Form.Field>
    <label>Room/s:</label>
    <Input loading icon='user' iconPosition='left' placeholder='Loading Rooms this can sometimes take awhile...' value='' style={{ cursor: 'not-allowed' }} />
  </Form.Field>
}

{!(loadingInitial || graphRoomStore.loadingInitial) && 
        <Form.Field error={dirty && roomEmails.length < 1}>
          <label>Room/s:</label>
          <Select
            name="roomEmails"
            value={roomOptions.filter(function (option) {
              return roomEmails.includes(option.value);
            })}
            onChange={(e) => onChange(e)}
            onBlur={() => setDirty(true)}
            placeholder="select rooms (you may select more than one)"
            //options={roomOptions}
            options={
              selectedBuilding
                ? roomOptions.filter(option =>
                    graphRoomStore.graphRooms.some(
                      room => room.building === selectedBuilding && room.displayName === option.label
                    )
                  )
                : roomOptions
            }
            //closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
          />
          {dirty && roomEmails.length < 1 && (
            <Label basic color="red">
              Choose at least one room
            </Label>
          )}
        </Form.Field>
      }
        </>


  );
});
