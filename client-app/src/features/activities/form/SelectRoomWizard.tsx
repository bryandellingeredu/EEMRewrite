
import { useState, useEffect } from "react";
import { Button, Divider, Header, Icon, Segment, SegmentGroup, Step,  Form as SemanticForm, Card, Message, } from "semantic-ui-react";
import { Formik, Form, useFormikContext } from "formik";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../app/stores/store";
import { GraphRoom } from "../../../app/models/graphRoom";
import MySelectInput from "../../../app/common/form/MySelectInput";
import MySemanticCheckBox from "../../../app/common/form/MySemanticCheckbox";
import SelectRoomWizardItem from "./SelectRoomWizardItem";
import LoadingComponent from "../../../app/layout/LoadingComponent";

interface SearchFormValues {
    id: string,
    minCapacity: string,
    maxCapacity: string,
    isWheelChairAccessible: boolean,
    vtc: boolean,
    building: string,
    floorLabel: string,
    byod: boolean,
    casting: boolean,
    commercial: boolean,
    individualStudy: boolean,
    nipr: boolean,
    vtcMSTeams: boolean,
    wireless: boolean
  }

  interface Props{
    roomOptionRegistryId: string
    lockDateInput: boolean
    setRoomEmails: (emails: string[]) => void;
    roomEmails: string[];
    setShowRoomWizard: (value: boolean) => void;
    closeSelectRoomWizard : () => void;
  }

  interface Option {
    label: string;
    value: string;
    isDisabled: boolean;
  }


export default observer( function SelectRoomWizard(
  {roomOptionRegistryId, lockDateInput, roomEmails, setRoomEmails, setShowRoomWizard, closeSelectRoomWizard} : Props){
    const { graphRoomStore, availabilityStore} = useStore();
    const { loadingInitial} = availabilityStore;
    const { graphRooms, allRoomOptions, loadRoomOptions} = graphRoomStore;
    const [active, setActive] = useState<string>("step1");
    const [step1Complete, setStep1Complete] = useState<boolean>(false);
    const [step2Complete, setStep2Complete] = useState<boolean>(false);
    const [step3Complete, setStep3Complete] = useState<boolean>(false);
    const [step4Complete, setStep4Complete] = useState<boolean>(false);
    const handleStep1Click = () => {setActive("step1");};
    const handleStep2Click = () => {setActive("step2");};
    const handleStep3Click = () => {setActive("step3");};
    const handleStep4Click = () => {setActive("step4");};
    const [filteredGraphRooms, setFilteredGraphRooms] = useState<GraphRoom[]>([]);
    const [roomOptions, setRoomOptions] = useState<Option[]>([
      { label: "", value: "", isDisabled: false },
  
    ]);
    useEffect(() => {setFilteredGraphRooms(graphRooms);}, [graphRooms]);
    useEffect(() => {setRoomOptions(loadRoomOptions(roomOptionRegistryId));}, [allRoomOptions]);

    function handleFormSubmit(values: SearchFormValues) {
        let filteredGraphRooms = graphRooms;
        if (values.id) filteredGraphRooms = filteredGraphRooms.filter(x => x.id === values.id);
        if (values.minCapacity) filteredGraphRooms = filteredGraphRooms.filter(x => parseInt(values.minCapacity) <= parseInt(x.capacity || '0'));
        if (values.maxCapacity) filteredGraphRooms = filteredGraphRooms.filter(x => parseInt(values.maxCapacity) >= parseInt(x.capacity || '1000'));
        if (values.isWheelChairAccessible) filteredGraphRooms = filteredGraphRooms.filter(x => x.isWheelChairAccessible);
        if (values.vtc) filteredGraphRooms = filteredGraphRooms.filter(x => x.displayName.toLowerCase().includes('vtc'));
        if (values.building) filteredGraphRooms = filteredGraphRooms.filter(x => x.building === values.building);
        if (values.floorLabel) filteredGraphRooms = filteredGraphRooms.filter(x => x.floorLabel === values.floorLabel);
        if (values.byod) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('BYOD')));
        if (values.casting) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Casting')));
        if (values.commercial) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Commercial')));
        if (values.individualStudy) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Individual Study')));
        if (values.nipr) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('NIPR')));
        if (values.vtcMSTeams) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('MS Teams')));
        if (values.wireless) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Wireless')));

        const roomsToAdd = graphRooms.filter(room => 
          roomEmails.includes(room.emailAddress) && 
          !filteredGraphRooms.some(filteredRoom => filteredRoom.emailAddress === room.emailAddress)
      );

      filteredGraphRooms = [...filteredGraphRooms, ...roomsToAdd];
  
        setFilteredGraphRooms(filteredGraphRooms);
      }
      

    const FormObserver: React.FC = () => {
        const { values } = useFormikContext<SearchFormValues>();
        useEffect(() => {
          handleFormSubmit(values);
        }, [values]);
        return null;
      };


      return (
        <Formik
        initialValues={{
          id: '',
          minCapacity: '',
          maxCapacity: '',
          isWheelChairAccessible: false,
          vtc: false,
          building: '',
          floorLabel: '',
          byod: false,
          casting: false,
          commercial: false,
          individualStudy: false,
          nipr: false,
          vtcMSTeams: false,
          wireless: false
        }}
        onSubmit={(values) => handleFormSubmit(values)}
      >
            {({ handleSubmit }) => (
          <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
        <FormObserver />
      
      
     <SegmentGroup >
        <Segment style={{backgroundColor: '#E8F5E9'}} >
        <Header as="h2">
        <Icon name="search" />
        <Header.Content>
          Help Me Find A Room
          <Header.Subheader>Set your preferences</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider />
      <Step.Group ordered widths={4}>
      <Step
          completed={step1Complete}
          active={active === "step1"}
          link
          onClick={handleStep1Click}
        >
           <Step.Content>
            <Step.Title>Location</Step.Title>
            <Step.Description>
              Choose the building
            </Step.Description>
          </Step.Content>
        </Step>
        <Step
          completed={step2Complete}
          active={active === "step2"}
          link
          onClick={handleStep2Click}
        >
           <Step.Content>
            <Step.Title>Capacity</Step.Title>
            <Step.Description>
              How many people will be in attendance
            </Step.Description>
          </Step.Content>
        </Step>
        <Step
          completed={step3Complete}
          active={active === "step3"}
          link
          onClick={handleStep3Click}
        >
           <Step.Content>
            <Step.Title>Room Requirements</Step.Title>
            <Step.Description>
              Pick the amenities needed for your meeting
            </Step.Description>
          </Step.Content>
        </Step>
        <Step
          completed={step4Complete}
          active={active === "step4"}
          link
          onClick={handleStep4Click}
        >
           <Step.Content>
            <Step.Title>Reserve Room/s</Step.Title>
            <Step.Description>
              Reserve Room/s for your meeting
            </Step.Description>
          </Step.Content>
        </Step>
      </Step.Group>
      


      </Segment >
      {active === "step1" && (
        <>
        <Segment style={{backgroundColor: '#E8F5E9'}} >
        <MySelectInput
    options={[
      {text: '', value: ''},
      ...Array.from(new Set(graphRooms.filter(item => item.building !== null).map(item => item.building))).sort((a, b) => a.localeCompare(b)).map(building => ({
        text: building,
        value: building
      }))
    ]}
    placeholder="Building"
    name="building"
    label="Choose a building or leave blank for all buildings"
  />
        </Segment>
        <Segment clearing style={{backgroundColor: '#E8F5E9'}} >
   
          <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep2Click}
                  color="green"
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
            
                </Segment>
        </>
      )}
          {active === "step2" && (
            <>
             <Segment style={{backgroundColor: '#E8F5E9'}} >
             <MySelectInput
    options={[
      {text: '', value: ''},
      {text: '2', value: '2'},
      {text: '5', value: '5'},
      {text: '10', value: '10'},
      {text: '25', value: '25'},
      {text: '50', value: '50'},
      {text: '100', value: '100'},
      {text: '300', value: '300'}
    ]}
    placeholder="Minimum Capacity"
    name="minCapacity"
    label="Select the minimum number of people that might attend your meeting, or leave blank"
  />
             </Segment>
    <Segment style={{backgroundColor: '#E8F5E9'}} >
    <MySelectInput
    options={[
      {text: '', value: ''},
      {text: '2', value: '2'},
      {text: '5', value: '5'},
      {text: '10', value: '10'},
      {text: '25', value: '25'},
      {text: '50', value: '50'},
      {text: '100', value: '100'},
      {text: '300', value: '300'}
    ]}
    placeholder="Maximum Capacity"
    name="maxCapacity"
    label="Select the maximum number of people that might attend your meeting, or leave blank"
  />
    </Segment>
    <Segment clearing style={{backgroundColor: '#E8F5E9'}} >
    <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep1Click}
                  color="green"
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep3Click}
                  color="green"
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
    </Segment>
            </>
          )}
    {active === "step3" && (
        <>
        <Segment style={{backgroundColor: '#E8F5E9'}} >
            <h5>Choose the features a room must have to support your meeting</h5>
        </Segment>
        <Segment style={{backgroundColor: '#E8F5E9'}}>
        <SemanticForm.Group inline>
                <MySemanticCheckBox
                  label='Bring your own device'
                  name='byod'
                  /> 
                   <MySemanticCheckBox
                  label='Casting to monitor/s'
                  name='casting'
                  /> 
                 <MySemanticCheckBox
                  label='Commercial internet available'
                  name='commercial'
                  /> 
       
                   <MySemanticCheckBox
                  label='Individual study'
                  name='individualStudy'
                  /> 
                <MySemanticCheckBox
                  label='NIPR internet available'
                  name='nipr'
                  />  
                  <MySemanticCheckBox
                  label='Secret video teleconference capable (SVTC)'
                  name='vtc'
                  /> 
                 </SemanticForm.Group>  
                 <SemanticForm.Group inline>
                 <MySemanticCheckBox
                  label='VTC(MS Teams)'
                  name='vtcMSTeams'
                  />    
                    <MySemanticCheckBox
                  label='Room is wheelchair accessible'
                  name='isWheelChairAccessible'
                  />  
                       <MySemanticCheckBox
                  label='Wireless internet available'
                  name='wireless'
                  />  
               
                 </SemanticForm.Group>
        </Segment>
        <Segment clearing style={{backgroundColor: '#E8F5E9'}} >
    <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep2Click}
                  color="green"
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  onClick={handleStep4Click}
                  color="green"
                >
                  Next
                  <Icon name="arrow right" />
                </Button>
    </Segment>
        </>
           )}
          {active === "step4" && (
            <>
            
            <Segment style={{ backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

    <h5>
        Check the room/s you would like to reserve for your meeting. Greyed out rooms are already reserved. If a room
        has a picture click the thumbnail to see the full size photo.
    </h5>
    {!lockDateInput && !loadingInitial &&
    <Button 
        icon
        labelPosition="right"
        secondary
        onClick={closeSelectRoomWizard}
    >
        I am Done Selecting Rooms
        <Icon name="check" />
    </Button>
}
</Segment>

<Segment style={{backgroundColor: '#E8F5E9'}}>
{(lockDateInput || loadingInitial) && <LoadingComponent content='Loading Rooms Please Wait...'/>}
{!lockDateInput && !loadingInitial && filteredGraphRooms.length > 0 &&
<Card.Group itemsPerRow={3}>
  {filteredGraphRooms.map(room => {
    const matchingOption = roomOptions.find(option => option.value === room.emailAddress);
    const isDisabled = matchingOption ? matchingOption.isDisabled : false;

    return (
      <SelectRoomWizardItem
        key={room.id}
        room={room}
        unavailable={isDisabled}
        setRoomEmails={setRoomEmails}
        roomEmails={roomEmails}
      />
    );
  })}
</Card.Group>
}
{!lockDateInput && !loadingInitial && filteredGraphRooms.length < 1 &&
 <div className="warningMessage">
     <div className="warningMessageHeader">No Data Found </div>
     <div className="warningMessageContent">There are no rooms that match your criteria. Please modify your criteria and try again.</div>
  </div>
  }
</Segment>
<Segment clearing style={{backgroundColor: '#E8F5E9'}} >
    <Button
                  icon
                  labelPosition="left"
                  floated="left"
                  type="button"
                  onClick={handleStep3Click}
                  color="green"
                >
                  Previous
                  <Icon name="arrow left" />
                </Button>
                {!lockDateInput && !loadingInitial &&
                <Button
                  icon
                  labelPosition="right"
                  floated="right"
                  type="button"
                  secondary
                  onClick={closeSelectRoomWizard}
                >
                   I am Done Selecting Rooms
                  <Icon name="check" />
                </Button>
}
               
    </Segment>
            </>
          )}
      </SegmentGroup>
      </Form>
        )}
      </Formik>
      )
})