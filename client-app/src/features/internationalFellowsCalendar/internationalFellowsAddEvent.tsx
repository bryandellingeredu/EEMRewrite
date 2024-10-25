import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Checkbox, Divider, Dropdown, DropdownProps, Form, FormField, Header, Input, Modal } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import { useStore } from "../../app/stores/store";
import agent from "../../app/api/agent";
import { GraphScheduleResponse } from "../../app/models/graphScheduleResponse";
import { format } from "date-fns";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import { IFAddEventRequest } from "../../app/models/ifAddEventRequest";

const uniforms = [
  'Uniform Required: Special Event--Class A/Army Service Uniform (ASU) or comparable uniform for other services; Civilians: Traditional Business--gentlemen: matching suit, dress shirt, tie and leather dress shoes; ladies: suit or jacket with coordinating skirt/slacks or a dress, and dress shoes.',
  'Service Dress (Class B)--Military: Class B/Army Service Uniform (ASU) (rank and name plate required, no jacket, tie required if wearing long sleeve shirt/no tie with short sleeve shirt) or comparable uniform for other services; Civilians: Business--gentlemen: sports jacket with dress slacks, dress shirt, and no tie, and leather dress shoes;ladies: jacket or business top with skirt or slacks or a dress, and dress shoes.',
  'Smart Business: gentlemen: sports jacket with dress slacks, dress shirt and tie, and leather dress shoes; ladies: jacket with skirt or slacks or a dress, and dress shoes. Or Class B/ASU or comparable attire for other services is an authorized equivalent standard of dress. Tuesday is "tieless Tuesday" no tie is required with suit.',
  'Business Casual: gentlemen: slacks, dress shirt or collared polo shirt/buttoned shirt and/or sweater, leather shoes, boat shoes, or loafers (no sneakers); ladies: skirt or slacks with top or casual dress and casual shoes. Class B/ASU or comparable attire for other services is an authorized equivalent standard of dress.',
  'Combat and Functional: Military--Army Combat Uniform or comparable attire for other services (flight suits authorized); Civilians: Business Casual--gentlemen: slacks, dress shirt or collared polo shirt/buttoned shirt, and/or sweater, leather shoes, boat shoes, or loafers (no sneakers); ladies: skirt or slacks with top or casual dress, and casual shoes.',
  'Bliss Auditorium, random seating.',
  'Seminar Rooms, Root Hall. ',
  'Bliss Auditorium, assigned seating by seminar.',
  'Wil Washcoe Auditorium (WWA).',
  'Attendance voluntary.',
  'Spouses invited to attend, the name tag must be displayed.',
  'Meet in accordance with instructions in Electives syllabi and previously issued course and classroom assignment instructions.',
]

interface Props {
    setShowFormFalse: () => void;
    refreshData: () => void;
}
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
}
export default observer (function InternationalFellowsAddEvent({setShowFormFalse, refreshData} : Props){
    const {graphRoomStore, availabilityStore} = useStore();
    const { loadGraphRooms, graphRooms } = graphRoomStore;
    const [isDirty1, setIsDirty1] = useState(false);
    const [isDirty2, setIsDirty2] = useState(false);
    const [startDate, setStartDate] = useState(roundToNext15Min(new Date(new Date().getTime() + 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState(roundToNext15Min(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)));
    const [title, setTitle] = useState('');
    const [primaryLocation, setPrimaryLocation] = useState('');
    const [actionOfficer, setActionOfficer] = useState('');
    const [actionOfficerPhone, setActionOfficerPhone] = useState('');
    const [description, setDescription] = useState('');
    const [studentCalendarUniform, setStudentCalendarUniform] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef2 = useRef<HTMLTextAreaElement>(null);
    const [formPage, setFormPage] = useState('one');
    const [needRoom, setNeedRoom] = useState(false);
    const [studentAttendanceMandatory, setStudentAttendanceMandatory]  = useState(false);
    const [eventTypeStudent, setEventTypeStudent] = useState(false);
    const [internationalFellowsStaffEventPrivate, setInternationalFellowsStaffEventPrivate] = useState(false);
    const [internationalFellowsStaffEventCategory, setInternationalFellowsStaffEventCategory] = useState('');
    const [studentCalendarPresenter, setStudentCalendarPresenter] = useState('');
    const [selectedRoomEmail, setSelectedRoomEmail] = useState(''); 
    const [selectedUniform, setSelectedUniform] = useState('');
    const [studentCalendarNotes, setStudentCalendarNotes] = useState('');
    const [busyEvents, setBusyEvents] = useState<GraphScheduleResponse[]>([]);
    const [showBusyModal, setShowBusyModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleAttendanceToggle = () => {
        setStudentAttendanceMandatory(!studentAttendanceMandatory);
    }
    
    const handlePrivateToggle = () => {
        setInternationalFellowsStaffEventPrivate(!internationalFellowsStaffEventPrivate)
    }
    const handleRoomToggle = () => {
        setNeedRoom(!needRoom);
      };

    const handleEventTypeToggle =() => {
        setEventTypeStudent(!eventTypeStudent)
    }
    const handleSubmit= async (event: React.FormEvent<HTMLFormElement>) => {
      if(formPage === 'three'){
      event.preventDefault();
      setSaving(true);
      if(needRoom && selectedRoomEmail){
        try{
          const graphScheduleRequest = await availabilityStore.getGraphScheduleRequest(startDate, endDate, [selectedRoomEmail] )
          const response : GraphScheduleResponse[] = await agent.GraphSchedules.list(graphScheduleRequest);
          const isFree = response.every(schedule => schedule.availabilityView.split('').every(char => char === "0"));
          if(!isFree){
            setSaving(false);
            setBusyEvents(response);
            setShowBusyModal(true);
            return;
          }
        }catch(error){
          setSaving(false);
          console.log(error);
        }
      }
      const request : IFAddEventRequest = {
        startDate, endDate, title, description, actionOfficer, actionOfficerPhone, needRoom, selectedRoomEmail,
        primaryLocation, eventTypeStudent, internationalFellowsStaffEventPrivate, internationalFellowsStaffEventCategory,
        studentAttendanceMandatory, studentCalendarPresenter, studentCalendarUniform, studentCalendarNotes
      };
      try{
        await agent.IFCalendar.addEvent(request);
        setSaving(false);
        clearAttributes();
        setShowFormFalse();
        refreshData();
      }catch(error){
          setSaving(false);
          console.log(error);
        }
    }
  }

    useEffect(() =>{
        if(graphRooms.length < 1) loadGraphRooms();
    }, [graphRooms.length])

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
        }
    }, [description, formPage])

    useEffect(() => {
      const textarea = textareaRef2.current;
      if (textarea) {
          textarea.style.height = 'auto'; // Reset height to recalculate
          textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
      }
  }, [studentCalendarNotes, formPage])

    const calculateMinTimeForStart = () => {
        const today = new Date();
        if (isToday(startDate)) {
            return new Date(today.setMinutes(0));
        }
        return new Date(today.setHours(0, 0, 0, 0)); // Reset to midnight for future dates
    };

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

    const handleContinue1 = () =>{
        setIsDirty1(true);
        if(startDate && endDate && description && title){
            setFormPage('two')
        } 
    }

    const handleContinue2 = () =>{
        setIsDirty2(true);
        if(actionOfficer && actionOfficerPhone )
        {
            if(needRoom && selectedRoomEmail) setFormPage('three');
            if(!needRoom && primaryLocation) setFormPage('three');
        } 
    }

    const handleRoomChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        if (typeof data.value === 'string') {
            setSelectedRoomEmail(data.value);  // Only set if it's a string
          } else {
            setSelectedRoomEmail('');  // Handle undefined or other types
          }  // data.value is the emailAddress of the selected room
      };

    const handleStaffCategoryChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        if (typeof data.value === 'string') {
            setInternationalFellowsStaffEventCategory(data.value);  // Only set if it's a string
          } else {
            setInternationalFellowsStaffEventCategory('');  // Handle undefined or other types
          }  // data.value is the emailAddress of the selected room
      };

      const handleUniformSelectionChange  = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        if (typeof data.value === 'string') {
            setSelectedUniform('');
            setStudentCalendarUniform(data.value)  // Only set if it's a string
          } else {
            setSelectedUniform(''); 
            setStudentCalendarUniform('');
          }  // data.value is the emailAddress of the selected room
      };

      const handleCancel = () => {
        clearAttributes();
        setShowFormFalse();
      }

      const clearAttributes = () =>{
       setStartDate(roundToNext15Min(new Date(new Date().getTime() + 60 * 60 * 1000)));
       setEndDate(roundToNext15Min(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)));
       setIsDirty1(false);
       setIsDirty2(false);
       setTitle('');
       setPrimaryLocation('');
       setActionOfficer('');
       setActionOfficerPhone('');
       setDescription('');
       setSelectedUniform('');
       setStudentCalendarUniform('');
       setFormPage('one');
       setNeedRoom(false);
       setStudentAttendanceMandatory(false);
       setEventTypeStudent(false);
       setInternationalFellowsStaffEventPrivate(false);
       setInternationalFellowsStaffEventCategory('');
       setStudentCalendarPresenter('');
       setSelectedRoomEmail('');
       setStudentCalendarNotes('');
      }

  return(
    <>
    <Form onSubmit={handleSubmit}>
    <Header textAlign="center" content='Add an Event' />
    {formPage === 'one' && 
    <>
    <FormField required error={!startDate && isDirty1}>
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
    <FormField required error={!endDate && isDirty1}>
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
    <FormField required error={!title && isDirty1}>
        <label>Title</label>
        <Input
         value={title}
         onChange={
            (event: React.ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)
           }
        />
    </FormField>
   
    <FormField required error={!description && isDirty1}>
    <label>Description</label>
    <textarea
         rows={2}
         ref={textareaRef}
        value={description}
        onChange={
            (event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)
        }
        style={{ width: '100%', overflow: 'hidden' }}
    />
    </FormField>
    <FormField>
      <ButtonGroup floated="right">
        <Button type='button' secondary content='Cancel' onClick={handleCancel}/>
        <Button type='button' primary content='Continue' onClick={handleContinue1}/>
      </ButtonGroup>
    </FormField>
    </>
    }
    {formPage === 'two' && 
    <>
       <FormField required error={!actionOfficer && isDirty2}>
        <label>Action Officer</label>
        <Input
         value={actionOfficer}
         onChange={
            (event: React.ChangeEvent<HTMLInputElement>) => setActionOfficer(event.target.value)
           }
        />
    </FormField>
    <FormField required error={!actionOfficerPhone && isDirty2}>
        <label>Action Officer Phone</label>
        <Input
         value={actionOfficerPhone}
         onChange={
            (event: React.ChangeEvent<HTMLInputElement>) => setActionOfficerPhone(event.target.value)
           }
        />
    </FormField>
    <FormField>
        <label>Room Reservation</label>
        <Checkbox
          toggle
          label={needRoom ? 'I need a room' : 'I do not need a room'}
          checked={needRoom}
          onChange={handleRoomToggle}
        />
      </FormField>
     { needRoom && 
      <FormField required error={!selectedRoomEmail && isDirty2}>
        <label>Select a Room (Type to search)</label>
        <Dropdown
          className="custom-dropdown"
            placeholder='Select Room'
            fluid
            search
            clearable
            selection
            value={selectedRoomEmail}  // Controlled value (emailAddress)
            onChange={handleRoomChange} 
            options={graphRooms.map(x => ({key: x.id, text: x.displayName, value: x.emailAddress}))}
  />
      </FormField>
   }
   {!needRoom && 
    <FormField required error={!primaryLocation && isDirty2}>
         <label>Primary Location (can not be a room)</label>
        <Input
         value={primaryLocation}
         onChange={
            (event: React.ChangeEvent<HTMLInputElement>) => setPrimaryLocation(event.target.value)
           }
        />
    </FormField>
   }
    <FormField>
        <label>Event Type (Staff or Student)</label>
        <Checkbox
          toggle
          label={eventTypeStudent? 'Student' : 'Staff'}
          checked={eventTypeStudent}
          onChange={handleEventTypeToggle}
        />
      </FormField>
    <FormField>
      <ButtonGroup floated="right">
        <Button type='button' secondary content='Back' onClick={() => setFormPage("one")}/>
        <Button type='button' primary content='Continue' onClick={handleContinue2}/>
      </ButtonGroup>
    </FormField>
    </>
    }
     {formPage === 'three' &&
     <div style={{minHeight: '300px'}}>

        {!eventTypeStudent && !needRoom &&
         <FormField>
         <label>Private Event </label>
         <Checkbox
           toggle
           label={internationalFellowsStaffEventPrivate? 'Yes' : 'No'}
           checked={internationalFellowsStaffEventPrivate}
           onChange={handlePrivateToggle}
         />
         </FormField>
        }

        {!eventTypeStudent &&
              <FormField >
              <label>Staff Category</label>
              <Dropdown
                className="custom-dropdown"
                  placeholder='Select Category'
                  fluid
                  search
                  clearable
                  selection
                  value={internationalFellowsStaffEventCategory}  // Controlled value (emailAddress)
                  onChange={handleStaffCategoryChange} 
                  options=
                  {['FSP','IF Birthday', 'IF Holiday', 'Leave/TDY', 'MTGS', 'Office Birthday']
                    .map(x => ({key: x,text: x,value: x}))}
        />
            </FormField>
        }
        {eventTypeStudent &&
        <>
         <FormField>
         <label>Student Attendance </label>
         <Checkbox
           toggle
           label={studentAttendanceMandatory? 'Mandatory' : 'Optional'}
           checked={studentAttendanceMandatory}
           onChange={handleAttendanceToggle}
         />
         </FormField>
         <FormField >
        <label>Presenter</label>
        <Input
         value={studentCalendarPresenter}
         onChange={
            (event: React.ChangeEvent<HTMLInputElement>) => setStudentCalendarPresenter(event.target.value)
           }
        />
    </FormField>
    <FormField >
              <label>Student Uniform</label>
              <Dropdown
                className="custom-dropdown"
                  fluid
                  search
                  clearable
                  selection
                  value={selectedUniform}  
                  onChange={handleUniformSelectionChange} 
                  options= {uniforms.map(x => ({key: x,text: x,value: x}))}
        />
         
          <textarea
            value={studentCalendarUniform}
        onChange={
            (event: React.ChangeEvent<HTMLTextAreaElement>) => setStudentCalendarUniform(event.target.value)
        }
        style={{ width: '100%', overflow: 'hidden' }}
    />
      </FormField>
     <FormField >
    <label>Notes</label>
    <textarea
         rows={2}
         ref={textareaRef2}
        value={studentCalendarNotes}
        onChange={
            (event: React.ChangeEvent<HTMLTextAreaElement>) => setStudentCalendarNotes(event.target.value)
        }
        style={{ width: '100%', overflow: 'hidden' }}
    />
    </FormField>
        </>
        }

     <FormField>
      <ButtonGroup floated="right">
        <Button type='button' secondary content='Back' onClick={() => setFormPage("two")} disabled={saving}/>
        <Button type='submit' primary content='Save' loading={saving} disabled={saving}/>
      </ButtonGroup>
    </FormField>
    </div>
     }
    </Form>
    <Modal open={showBusyModal} onClose={() => setShowBusyModal(false)} >
          <Modal.Header>Room Unavailable</Modal.Header>
          <Modal.Content>
            <p>The room you picked is not available for the entire duration. Please choose 
              a different room, or a different time.</p>
              <Divider />
              <p>Conflicting Events</p>
            <ul>
              {busyEvents.map((event, index) => (
                <li key={index}>
                 <strong>{event.scheduleItems[0]?.subject}</strong> - {format(new Date(event.scheduleItems[0]?.start?.dateTime || ''), 'MM/dd HH:mm')} to {format(new Date(event.scheduleItems[0]?.end?.dateTime || ''), 'MM/dd HH:mm')}
                </li>
              ))}
            </ul>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setShowBusyModal(false)} primary>Close</Button>
          </Modal.Actions>
        </Modal>
    </>
  )
})