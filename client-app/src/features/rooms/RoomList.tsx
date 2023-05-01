import { observer } from "mobx-react-lite";
import { Button, Card, Divider, Grid, Icon, Form as SemanticForm, Input, Segment } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import RoomListItem from "./RoomListItem";
import { useState, useEffect } from 'react';
import { Form, Formik, useFormikContext } from "formik";
import MySelectInput from "../../app/common/form/MySelectInput";
import { GraphRoom } from "../../app/models/graphRoom";
import MySemanticCheckBox from "../../app/common/form/MySemanticCheckbox";

interface SearchFormValues{
  id: string
  minCapacity: string
  maxCapacity: string
  isWheelChairAccessible: boolean
  vtc: boolean
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

export default observer (function RoomList() {
const[showAvailabilityIndicatorList, setShowAvailabilityIndicatorList] = useState<string[]>([]);
const {graphRoomStore} = useStore();
const{ graphRooms} = graphRoomStore;
const [filteredGraphRooms, setFilteredGraphRooms] = useState<GraphRoom[]>([]);



useEffect(() => {
  setFilteredGraphRooms(graphRooms);
}, [graphRooms]);

function handleAddIdToShowAvailabilityIndicatorList(id: string){
    setShowAvailabilityIndicatorList([...showAvailabilityIndicatorList, id]);
  }

  function handleFormSubmit(values : SearchFormValues ) {
      console.log(values)
      let filteredGraphRooms = graphRooms;
      if(values.id) filteredGraphRooms = filteredGraphRooms.filter(x => x.id === values.id);
      if(values.minCapacity) filteredGraphRooms = filteredGraphRooms.filter(x => parseInt(values.minCapacity) <= parseInt(x.capacity || '0') );
      if(values.maxCapacity) filteredGraphRooms = filteredGraphRooms.filter(x => parseInt(values.maxCapacity) >= parseInt(x.capacity || '1000') );
      if(values.isWheelChairAccessible) filteredGraphRooms = filteredGraphRooms.filter(x => x.isWheelChairAccessible);
      if(values.vtc) filteredGraphRooms = filteredGraphRooms.filter(x => x.displayName.toLowerCase().includes('vtc'));
      if(values.building) filteredGraphRooms = filteredGraphRooms.filter(x => x.building === values.building);
      if(values.floorLabel) filteredGraphRooms = filteredGraphRooms.filter(x => x.floorLabel === values.floorLabel);
      if(values.byod) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('BYOD')));
      if(values.casting) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Casting')));
      if(values.commercial) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Commercial')));
      if(values.individualStudy) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Individual Study')));
      if(values.nipr) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('NIPR')));
      if(values.vtcMSTeams) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('MS Teams')));
      if(values.wireless) filteredGraphRooms = filteredGraphRooms.filter(x => x.tags.some(tag => tag.includes('Wireless')));
      setFilteredGraphRooms(filteredGraphRooms);    
  }

  const FormObserver: React.FC = () => {
    const { values } = useFormikContext();
    useEffect(() => {
      handleFormSubmit(values as SearchFormValues);
    }, [values]);
    return null;
  };

    return (
      <>
      <Formik
      initialValues={{id: '', minCapacity: '', maxCapacity: '', isWheelChairAccessible: false, vtc: false, building: '', floorLabel: '', byod: false,
      casting: false, commercial: false, individualStudy: false, nipr: false, vtcMSTeams: false, wireless:false}}
      onSubmit={(values) => handleFormSubmit(values)}
    >
   {({handleSubmit}) => (
             <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                <FormObserver />
                 <Grid verticalAlign='middle'>
                   <Grid.Row>
               
                     <Grid.Column width={3}>
                     <MySelectInput
                  options={
                    [{text: '', value: ''}].concat(graphRooms
                      .sort((a, b) => a.displayName.localeCompare(b.displayName))
                      .map(item => ({
                      text: item.displayName,
                      value: item.id
                    })))
                  }
                  placeholder="Room Name"
                  name="id"
                  label= "Room Name"
                />
                
                </Grid.Column>

                <Grid.Column width={2}>
                <MySelectInput
  options={
    Array.from(
      new Set(
        graphRooms
          .filter(item => item.building !== null)
          .map(item => item.building)
      )
    )
    .sort((a, b) => a.localeCompare(b))
    .map(building => ({
      text: building,
      value: building
    }))
  }
  placeholder="Building"
  name="building"
  label="Building"
/>
</Grid.Column>


  <Grid.Column width={2}>
                <MySelectInput
  options={
    Array.from(
      new Set(
        graphRooms
          .filter(item => item.floorLabel !== null)
          .map(item => item.floorLabel)
      )
    )
    .sort((a, b) => a.localeCompare(b))
    .map(floorLabel => ({
      text: floorLabel,
      value: floorLabel
    }))
  }
  placeholder="Floor"
  name="floorLabel"
  label="Floor"
/>
</Grid.Column>

                <Grid.Column width={2}>
                     <MySelectInput
                  options={
                    [
                      {text: '', value: ''},
                      {text: '2', value: '2'},
                      {text: '5', value: '5'},
                      {text: '10', value: '10'},
                      {text: '25', value: '25'},
                      {text: '50', value: '50'},
                      {text: '100', value: '100'},
                      {text: '300', value: '300'},
                    ]
                  }
                  placeholder="Min Capacity"
                  name="minCapacity"
                  label= "Min Capacity"
                />
                
                </Grid.Column>

                <Grid.Column width={2}>
                     <MySelectInput
                  options={
                    [
                      {text: '', value: ''},
                      {text: '2', value: '2'},
                      {text: '5', value: '5'},
                      {text: '10', value: '10'},
                      {text: '25', value: '25'},
                      {text: '50', value: '50'},
                      {text: '100', value: '100'},
                      {text: '300', value: '300'},
                    ]
                  }
                  placeholder="Max Capacity"
                  name="maxCapacity"
                  label= "Max Capacity"
                />
               </Grid.Column>

              

                <Grid.Column width={4} style={{marginTop: '20px'}}>
                <SemanticForm.Group inline>
                <MySemanticCheckBox
                  label='BYOD'
                  name='byod'
                  /> 
                   <MySemanticCheckBox
                  label='Casting'
                  name='casting'
                  /> 
                 <MySemanticCheckBox
                  label='Commercial'
                  name='commercial'
                  /> 
                   </SemanticForm.Group>
                   <SemanticForm.Group inline>
                   <MySemanticCheckBox
                  label='Individual Study'
                  name='individualStudy'
                  /> 
                <MySemanticCheckBox
                  label='NIPR'
                  name='nipr'
                  />  
                  <MySemanticCheckBox
                  label='SVTC'
                  name='vtc'
                  /> 
                 </SemanticForm.Group>  
                 <SemanticForm.Group inline> 
                 <MySemanticCheckBox
                  label='VTC(MS Teams)'
                  name='vtcMSTeams'
                  />    
                    <MySemanticCheckBox
                  label='Wheelchair'
                  name='isWheelChairAccessible'
                  />  
                       <MySemanticCheckBox
                  label='Wireless'
                  name='wireless'
                  />  
               
                  </SemanticForm.Group>    
                </Grid.Column>
                  
                    <Grid.Column width={1}>
                    <Button.Group style={{marginTop: '20px'}}>
                    <Button icon  color='violet' size='small' type='submit' >
                     <Icon name='search'/>
                    </Button>
                    </Button.Group>
                    </Grid.Column>
                 </Grid.Row>
               </Grid>                                  
             </Form>
         )}
    </Formik>
    <Divider />


   
         <Card.Group itemsPerRow={3}>           
             {filteredGraphRooms.map(room => (
                <RoomListItem
                 key={room.id}
                 room={room}
                 showAvailabilityIndicatorList = {showAvailabilityIndicatorList}
                 addIdToShowAvailabilityIndicatorList = {handleAddIdToShowAvailabilityIndicatorList}
                  />
             ))}              
         </Card.Group>
         </>
  )})