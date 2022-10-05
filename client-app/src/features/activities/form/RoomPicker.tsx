import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import { Form, Label } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { useStore } from "../../../app/stores/store";
import LoadingComponent from '../../../app/layout/LoadingComponent';


interface Option{
    label: string
    value: string
    isDisabled: boolean
  }

  interface Props{
    start: Date
    end: Date
    setRoomEmails: (emails: string[]) => void
    roomEmails: string[]
  }

  export default observer(function RoomPicker({start, end, setRoomEmails, roomEmails} : Props) {
    const animatedComponents = makeAnimated();
    const { availabilityStore, graphRoomStore} = useStore();
    const {loadingInitial, loadSchedule  } = availabilityStore
    const { loadGraphRooms} =graphRoomStore
    const [roomOptions, setRoomOptions] = useState<Option[]> ([{label: '', value: '', isDisabled: false}]);
    const [dirty, setDirty] = useState<boolean> (false);

    const onChange = (selectedOptions: any) => {
        const values = selectedOptions.map((item: Option) => item.value);
        setRoomEmails(values);
      }

      const getValue = () => {
        if (roomOptions) {
            roomOptions.filter(option => roomEmails.indexOf(option.value) >= 0)
        } else {
          return [];
        }
      };
    
    useEffect(() => {
        debugger;
        const diff = Math.abs(+end - +start);
        var minutes = Math.floor((diff/1000)/60);
        if(minutes >= 15){
        loadSchedule(start, end).then(response =>{
          if(response){
          let o : Option[] = [];
          loadGraphRooms().then(graphRooms => {
            response.forEach( room =>  o.push(
              {label: graphRooms.find(x => x.emailAddress ===  room.scheduleId)?.displayName || room.scheduleId,
               value: room.scheduleId,
              isDisabled: room.scheduleItems.length > 0}));
             setRoomOptions(o);
          })       
        }
        })
      }        
      }, [start, end, loadSchedule ]);

    return(
        <>
        {(loadingInitial || graphRoomStore.loadingInitial) && <LoadingComponent content = 'Loading Rooms' />}
        {!loadingInitial &&  !graphRoomStore.loadingInitial &&
        <Form.Field error={dirty && roomEmails.length < 1}>
        <label>Room/s</label>
        <Select
        name = 'roomEmails'
        value={getValue()}
        onChange={(e) => onChange(e)}
        onBlur={() => setDirty(true)}
        placeholder= 'select rooms (you may select more than one)'
        options={roomOptions}
        //closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
      />
      {dirty && roomEmails.length < 1 &&
        <Label basic color='red'>Choose at least one room</Label>
      }
      </Form.Field>
  }
  </>  
    )
  })
