import { observer } from "mobx-react-lite";
import { Button, Card, Divider, Grid, Icon, Form as SemanticForm, Input, Segment } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import RoomListItem from "./RoomListItem";
import { useState, useEffect } from 'react';
import { Form, Formik, useFormikContext } from "formik";
import MySelectInput from "../../app/common/form/MySelectInput";
import { GraphRoom } from "../../app/models/graphRoom";
import MySemanticCheckBox from "../../app/common/form/MySemanticCheckbox";

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

export default observer(function RoomList() {
  const [showAvailabilityIndicatorList, setShowAvailabilityIndicatorList] = useState<string[]>([]);
  const { graphRoomStore, userStore } = useStore();
  const { graphRooms, roomDelegates, loadRoomDelegates } = graphRoomStore;
  const { user } = userStore;
  const [filteredGraphRooms, setFilteredGraphRooms] = useState<GraphRoom[]>([]);
  const [showAll, setShowAll] = useState(true);

  const toggleShowAll = () => {
    setShowAll(!showAll);
    handleFormSubmit({
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
    });
  };

  useEffect(() => {
    setFilteredGraphRooms(graphRooms);
  }, [graphRooms]);

  useEffect(() => {
    if (!roomDelegates || roomDelegates.length < 1) loadRoomDelegates();
  }, [roomDelegates]);

  function handleAddIdToShowAvailabilityIndicatorList(id: string) {
    setShowAvailabilityIndicatorList([...showAvailabilityIndicatorList, id]);
  }

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
  
    if (!showAll && user && roomDelegates) {
      filteredGraphRooms = filteredGraphRooms.filter((room) =>
        roomDelegates.some((delegate) =>
          delegate.delegateEmail === user.userName && delegate.roomEmail === room.emailAddress
        )
      );
    }
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
    <>
      { user && roomDelegates && roomDelegates.some(
        (delegate) => delegate.delegateEmail === user.userName
      ) &&
        <Button.Group>
          <Button positive={showAll} onClick={toggleShowAll}>Show ALL Rooms</Button>
          <Button.Or />
          <Button positive={!showAll} onClick={toggleShowAll}>Show MY Rooms</Button>
        </Button.Group>
      }
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
            <Grid verticalAlign='middle'>
              <Grid.Row>
                <Grid.Column width={3}>
                <MySelectInput
  options={[
    {text: '', value: ''},
    ...graphRooms.sort((a, b) => a.displayName.localeCompare(b.displayName)).map(item => ({
      text: item.displayName,
      value: item.id
    }))
  ]}
  placeholder="Room Name"
  name="id"
  label= "Room Name"
/>
                </Grid.Column>
                <Grid.Column width={2}>
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
    label="Building"
  />
</Grid.Column>

<Grid.Column width={2}>
<MySelectInput
  options={[
    {text: '', value: ''},
    ...Array.from(
      new Set(
        graphRooms
          .filter(item => item.floorLabel !== null)
          .map(item => item.floorLabel.trim())
      )
    )
    .sort((a, b) => a.localeCompare(b))
    .map(floorLabel => ({
      text: floorLabel,
      value: floorLabel
    }))
  ]}
  placeholder="Floor"
  name="floorLabel"
  label="Floor"
/>
</Grid.Column>

<Grid.Column width={2}>
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
    placeholder="Min Capacity"
    name="minCapacity"
    label="Min Capacity"
  />
</Grid.Column>

<Grid.Column width={2}>
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
    placeholder="Max Capacity"
    name="maxCapacity"
    label="Max Capacity"
  />
</Grid.Column>

                <Grid.Column width={1}>
                  <Button.Group style={{marginTop: '20px'}}>
                    <Button icon color='violet' size='small' type='submit'>
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
            showAvailabilityIndicatorList={showAvailabilityIndicatorList}
            addIdToShowAvailabilityIndicatorList={handleAddIdToShowAvailabilityIndicatorList}
          />
        ))}
      </Card.Group>
    </>
  );
  
});
