import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import DatePicker, {ReactDatePickerProps} from "react-datepicker";
import { Button, ButtonGroup, Dimmer, DropdownProps, Form, FormField, Header, HeaderSubheader, Icon, Input, Loader, Select, } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { GraphScheduleItem } from "../../app/models/graphScheduleItem";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";

interface Option {
    text: string;      // Display text for the option
    value: string;     // Value of the option
    disabled?: boolean; // Optional: Whether the option is disabled
  }

  const loadingMessages = [
    'Loading Rooms, aligning satellites...',
    'Loading Rooms, configuring the flux capacitor...',
    'Loading Rooms, calibrating quantum oscillators...',
    'Loading Rooms, warming up the warp drive...',
    'Loading Rooms, stabilizing antimatter containment field...',
    'Loading Rooms, initializing holographic projections...',
    'Loading Rooms, synchronizing with the International Space Station...',
    'Loading Rooms, deploying nano-robots for room service...',
    'Loading Rooms, encrypting messages with quantum cryptography...',
    'Loading Rooms, generating artificial gravity...',
    'Loading Rooms, tuning the universal translator...',
    'Loading Rooms, plotting course through the asteroid belt...',
    'Loading Rooms, collecting dark matter samples...',
    'Loading Rooms, adjusting the time dilation compensators...',
    'Loading Rooms, testing the teleportation device...',
    'Loading Rooms, feeding the Schrödingers cat...',
    'Loading Rooms, bending spacetime continuum...',
    'Loading Rooms, charging the photon beams...',
    'Loading Rooms, preparing the Alcubierre drive...',
    'Loading Rooms, simulating alternate realities...',
    'Loading Rooms, activating the cloaking device...',
    'Loading Rooms, programming the AI butler...',
    'Loading Rooms, constructing virtual reality landscapes...',
    'Loading Rooms, mining asteroids for rare minerals...',
    'Loading Rooms, fabricating room keys from unobtanium...',
    'Loading Rooms, splicing genes for the perfect concierge...',
    'Loading Rooms, brewing zero-gravity coffee...',
    'Loading Rooms, cloning the housekeeping staff...',
    'Loading Rooms, reversing the polarity...',
    'Loading Rooms, setting up the interdimensional gateway...',
    'Loading Rooms, launching microsatellites for better WiFi...',
    'Loading Rooms, digitizing guest experiences...',
    'Loading Rooms, calibrating neutrino detectors...',
    'Loading Rooms, engaging the inertial dampeners...',
    'Loading Rooms, refining the perpetual motion machines...',
    'Loading Rooms, implementing the multiverse booking system...',
    'Loading Rooms, enhancing the molecular fabricators...',
    'Loading Rooms, optimizing the tachyon emitter...',
    'Loading Rooms, exploring parallel universes for extra rooms...',
    'Loading Rooms, establishing a link with the future self...',
    'Loading Rooms, navigating through the time streams...',
    'Loading Rooms, updating the universal constants database...',
    'Loading Rooms, forging keys to new dimensions...',
    'Loading Rooms, harmonizing sonic screwdrivers...',
    'Loading Rooms, decrypting the language of dolphins...',
    'Loading Rooms, recharging the crystal skulls...',
    'Loading Rooms, summoning intergalactic bellhops...',
    'Loading Rooms, drafting laws of robotics...',
    'Loading Rooms, concocting a potion for eternal youth...',
    'Loading Rooms, unraveling the mysteries of the universe...'
  ];

  const roundToNext15Min = (date : Date) => {
    const minutes = 15;
    const ms = 1000 * 60 * minutes;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  }

  const isToday = (date : Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};


export default observer( function BookRoom (){
  const { navbarStore} = useStore();
    const {setPage} = navbarStore
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [startDate, setStartDate] = useState(roundToNext15Min(new Date(new Date().getTime() + 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState(roundToNext15Min(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)));
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('Student Reservation');
    const [description, setDescription] = useState('Collaborative Session');
    const [selectedRoom, setSelectedRoom] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { availabilityStore, graphRoomStore} = useStore();
    const { loadSchedule } = availabilityStore;
    const { loadGraphRooms } = graphRoomStore;
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [roomOptions, setRoomOptions] = useState<Option[]>([
        { text: "", value: "", disabled: false },
    
      ]);

      const [loadingMessage, setLoadingMessage] = useState('Loading rooms...');

      useEffect(() => {
        if (loadingRooms || roomOptions.length < 0) {
            const intervalId = setInterval(() => {
                // Pick a random message from the array
                const randomIndex = Math.floor(Math.random() * loadingMessages.length);
                setLoadingMessage(loadingMessages[randomIndex]);
            }, 2000);

            // Clear interval on cleanup
            return () => clearInterval(intervalId);
        }
    }, [loadingRooms, roomOptions.length]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
        }
    }, [description])

    useEffect(() => {
        populateRoomDropDown();
    }, [startDate, endDate])

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

      const handleSubmit= async () => {
        setIsDirty(true);
        if(startDate && endDate && title && description && selectedRoom){
          setSaving(true);
            try{
             await agent.PocketCalendar.reserveRoom(startDate, endDate, title, description, selectedRoom)
             setShowConfirmation(true);
             setIsDirty(false);
            }catch(error){
              toast.error('An error occurred while reserving the room');
            }finally{
                setLoadingRooms(false);
                setSaving(false);
            }
         }
      }

    const populateRoomDropDown = async() => {
        setLoadingRooms(true);
        try{
            const schedule = await loadSchedule(startDate, endDate);
            if (schedule){
               const graphRooms = await loadGraphRooms()
               if(graphRooms && graphRooms.length > 0){
                let o: Option[] = []; 
                schedule.forEach((room) =>
                o.push({
                  text:
                    graphRooms.find((x) => x.emailAddress === room.scheduleId)
                      ?.displayName || room.scheduleId,
                  value: room.scheduleId,
                  disabled: getIsDisabled(startDate, endDate, room.scheduleItems)
                 })
                );
                setRoomOptions(o);
               }
            }

        }catch(error){
            console.log(error);
        }finally{
            setLoadingRooms(false);
        }
    }

    const filterPassedTime = (time: Date): boolean => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
      
        return currentDate.getTime() < selectedDate.getTime();
      };

      const calculateMinTime = () => {
        const midnight = new Date();
        midnight.setHours(0, 0, 0, 0);
        if (startDate.toDateString() === endDate.toDateString()) {
            return startDate;
        } else {
            return midnight;
        }
    };

    const calculateMinTimeForStart = () => {
      const today = new Date();
      if (isToday(startDate)) {
          return new Date(today.setMinutes(0));
      }
      return new Date(today.setHours(0, 0, 0, 0)); // Reset to midnight for future dates
  };


  return (
    <>
    {showConfirmation &&
    <>
      <Header as='h2' icon>
      <Icon name='check' color='teal' />
      Room Reservation Successful
      <HeaderSubheader>
        You will receive a confirmation email in your outlook mailbox. Your room reservation will
        appear on your Outlook Calendar, the EEM, and the room kiosk
      </HeaderSubheader>
    </Header>
    <Button floated="right" primary content='OK' size='huge' onClick={() => setPage('calendar')} />
    </>
    
    }
    {!showConfirmation && 
   <Form onSubmit={handleSubmit}>
        <Header textAlign="center" content='Room Reservation' />
    <FormField required error={!startDate && isDirty}>
        <label>Start</label>
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => {
            if (date) { 
                setStartDate(date);
                setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
            }
          }}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          minTime={calculateMinTimeForStart()}
          maxTime={new Date(new Date().setHours(23, 45, 0, 0))}
          filterTime={filterPassedTime}
          onFocus={e => e.target.blur()} 
        />
    </FormField>
    <FormField required error={!endDate && isDirty}>
        <label>End</label>
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => {
            if (date) { 
                setEndDate(date);
            }
          }}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          minTime={calculateMinTime()}
          maxTime={new Date(new Date().setHours(23, 45, 0, 0))}
          filterTime={filterPassedTime}
          onFocus={e => e.target.blur()} 
        />
    </FormField>
    <FormField required error={!title && isDirty}>
        <label>Purpose</label>
        <Input
         value={title}
         onChange={
            (event: React.ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)
           }
        />
    </FormField>
    <FormField required error={!description && isDirty}>
    <label>Description</label>
    <textarea
         ref={textareaRef}
        value={description}
        onChange={
            (event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)
        }
        style={{ width: '100%', overflow: 'hidden' }}
    />
    </FormField>
    <FormField required error={!selectedRoom && isDirty}>
      <label>Choose a room</label>  
      {(loadingRooms || roomOptions.length < 0) &&  <Loader active inline content={loadingMessage} />}
      {!loadingRooms && roomOptions.length > 0 &&
     <Select
     options={roomOptions}
     placeholder="Select a room"
     search
     clearable
     onChange={(e, data: DropdownProps) => {
      if (typeof data.value === 'string') setSelectedRoom(data.value)}
      }
   />
       }
    </FormField>
    <FormField>
      <ButtonGroup floated="right">
        <Button type='button' secondary content='Cancel' onClick={() => setPage('calendar')}/>
        <Button type='submit' primary content='Reserve Room' loading={saving} disabled={(loadingRooms || roomOptions.length < 0)}/>
      </ButtonGroup>
    </FormField>
   </Form>
      }
      </>
  )
})