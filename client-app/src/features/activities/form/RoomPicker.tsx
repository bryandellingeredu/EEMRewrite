import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Form, Label } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Recurrence } from "../../../app/models/recurrence";
import agent from "../../../app/api/agent";

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
  const { availabilityStore, graphRoomStore } = useStore();
  const { loadingInitial, loadSchedule } = availabilityStore;
  const { loadGraphRooms } = graphRoomStore;
  const [roomOptions, setRoomOptions] = useState<Option[]>([
    { label: "", value: "", isDisabled: false },
  ]);
  const [dirty, setDirty] = useState<boolean>(false);

  const onChange = (selectedOptions: any) => {
    const values = selectedOptions.map((item: Option) => item.value);
    setRoomEmails(values);
  };

  const convertUTCtoEST = (utcDate: Date): Date => {
    const offset = utcDate.getTimezoneOffset();
    const estDate = new Date(utcDate.getTime() - offset * 60 * 1000);
    return estDate;
  };

  useEffect(() => {
    console.log('loading rooms')
    const diff = Math.abs(+end - +start);
    var minutes = Math.floor(diff / 1000 / 60);
    if (minutes >= 15 && start < end) {
      if (recurrenceInd) {
        recurrence.activityStart = start;
        recurrence.activityEnd = end;
        agent.Activities.listPossibleByRecurrence(recurrence).then(
          (activities) => {
            if (activities && activities.length) {
              const activitiesWithEstDates: any = [];
              activities.forEach((activity) => {
                activitiesWithEstDates.push({
                  ...activity,
                  estStart: convertUTCtoEST(new Date(activity.start)),
                  estEnd: convertUTCtoEST(new Date(activity.end)),
                });
              });
              console.log("activitiesWithEstDates");
              console.log(activitiesWithEstDates);
              const utcStartDate = new Date(activities[0].start);
              const utcEndDate = new Date(
                activities[activities.length - 1].end
              );
              const estStartDate = convertUTCtoEST(utcStartDate);
              const estEndDate = convertUTCtoEST(utcEndDate);
              loadSchedule(estStartDate, estEndDate).then((schedule) => {
                loadGraphRooms().then((graphRooms) => {
                  let o: Option[] = [];
                  schedule!.forEach((room) =>
                    o.push({
                      label:
                        graphRooms.find(
                          (x) => x.emailAddress === room.scheduleId
                        )?.displayName || room.scheduleId,
                      value: room.scheduleId,
                      isDisabled: false,
                    })
                  );
                  setRoomOptions(o);
                  const filteredSchedule = schedule?.filter(
                    (x) => x.scheduleItems && x.scheduleItems.length
                  );
                  if (filteredSchedule && filteredSchedule.length) {
                    filteredSchedule.forEach((schedule) => {
                      schedule.scheduleItems.forEach((item) => {
                        const itemStart = new Date(item.start.dateTime);
                        const itemEnd = new Date(item.end.dateTime);
                        console.log("item start");
                        console.log(itemStart);
                        console.log("item end");
                        console.log(itemEnd);
                        activitiesWithEstDates.forEach((element: any) => {
                          if (
                            (element.estStart <= itemEnd &&
                              itemStart <= element.estEnd) ||
                            (itemStart >= element.estStart &&
                              itemEnd <= element.estEnd) ||
                            (element.estStart >= itemStart &&
                              element.estEnd <= itemEnd)
                          ) {
                            setRoomOptions([
                              ...o.filter(
                                (x) => x.value !== schedule.scheduleId
                              ),
                              {
                                ...o.find(
                                  (x) => x.value === schedule.scheduleId
                                ),
                                isDisabled: true,
                              } as Option,
                            ]);
                          }
                        });
                      });
                    });
                  }
                });
              });
            }
          }
        );
      } else {
        loadSchedule(start, end).then((response) => {
          if (response) {
            let o: Option[] = [];
            loadGraphRooms().then((graphRooms) => {
              response.forEach((room) =>
                o.push({
                  label:
                    graphRooms.find((x) => x.emailAddress === room.scheduleId)
                      ?.displayName || room.scheduleId,
                  value: room.scheduleId,
                  isDisabled: room.scheduleItems.length > 0,
                })
              );
              setRoomOptions(o);
            });
          }
        });
      }
    }
  }, [start, end, loadSchedule, loadGraphRooms, recurrenceInd, recurrence]);

  return (
    <>
      {(loadingInitial || graphRoomStore.loadingInitial) && (
        <LoadingComponent content="Loading Rooms" />
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
