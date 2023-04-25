import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Form, Label } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Recurrence } from "../../../app/models/recurrence";
import agent from "../../../app/api/agent";
import { GraphScheduleItem } from "../../../app/models/graphScheduleItem";
import { Activity } from "../../../app/models/activity";
import { GraphScheduleResponse } from "../../../app/models/graphScheduleResponse";

interface Option {
  label: string;
  value: string;
  isDisabled: boolean;
}

interface Props {
  start: Date;
  end: Date;
  setRoomEmails: (emails: string[]) => void;
  roomEmails: string[];
  recurrenceInd: boolean;
  recurrence: Recurrence;
}

export default observer(function RoomPicker({
  start,
  end,
  setRoomEmails,
  roomEmails,
  recurrence,
  recurrenceInd,
}: Props) {
  const animatedComponents = makeAnimated();
  const { availabilityStore, graphRoomStore, commonStore } = useStore();
  const { loadingInitial, loadSchedule } = availabilityStore;
  const { loadGraphRooms } = graphRoomStore;
  const [roomOptions, setRoomOptions] = useState<Option[]>([
    { label: "", value: "", isDisabled: false },
  ]);
  const [dirty, setDirty] = useState<boolean>(false);

  const onChange = (selectedOptions: any) => {
    debugger;
    const values = selectedOptions.map((item: Option) => item.value);
    setRoomEmails(values);
  };



  useEffect(() => {
    console.log('starting use effect');
    const diff = Math.abs(+end - +start);
    var minutes = Math.floor(diff / 1000 / 60);
    if (minutes >= 15 && start < end) {
      if (recurrenceInd) {
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

            });
          }         
          });
        });
      } else {
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
            });
          }
        });
      }
    }
  }, [start, end, loadSchedule, loadGraphRooms, recurrenceInd, recurrence]);

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
      {(loadingInitial || graphRoomStore.loadingInitial) && (
        <LoadingComponent content="Loading Rooms, This Sometimes Takes Awhile..." />
      )}
      {!loadingInitial && !graphRoomStore.loadingInitial && (
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
            options={roomOptions}
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
      )}
    </>
  );
});
