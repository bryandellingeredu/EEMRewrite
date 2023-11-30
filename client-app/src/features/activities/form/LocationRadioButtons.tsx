import { Form, Header, Radio, Segment } from "semantic-ui-react";

interface Props{
    roomRequired: boolean
    showRoomWizard: boolean
    setRoomRequired: (value: boolean) => void;
    setShowRoomWizard: (value: boolean) => void;
}

export default function LocationRadioButtons({roomRequired, setRoomRequired, setShowRoomWizard, showRoomWizard} : Props) {

const handleNeedHelpClicked = () => {
  setRoomRequired(true);
  setShowRoomWizard(true);
}

const handleIKnowWhichOneClicked = () => {
  setRoomRequired(true);
  setShowRoomWizard(false);
}

const handleNoRoomRequiredClicked = () => {
  setRoomRequired(false);
  setShowRoomWizard(false);
}
    
    return(
       <Segment inverted color='purple'>
        <Form.Group inline>
    <Form.Field style={{ paddingRight: "50px" }}>
      Book a Room:
    </Form.Field>
      <Form.Field>
        <Radio
          label='No Room Required'
          name='roomRequiredRadioGroup'
          value='NoRoomRequired'
          checked={!roomRequired}
          onChange={handleNoRoomRequiredClicked}
        />
      </Form.Field>
      <Form.Field>
        <Radio
          label='Need a Room(I know which one)'
          name='roomRequiredRadioGroup'
          value='that'
          checked={roomRequired && !showRoomWizard}
          onChange={handleIKnowWhichOneClicked}
        />
      </Form.Field>
      <Form.Field>
        <Radio
          label='Need a Room(Need help selecting)'
          name='roomRequiredRadioGroup'
          value='RoomHelpNeeded'
          checked={roomRequired && showRoomWizard}
          onChange={handleNeedHelpClicked}
        />
      </Form.Field>
      <Form.Field>
        <Header as={'h4'} content='Takes a few seconds for rooms to appear when selecting a room' style={{color: 'white', paddingLeft: '100px'}}/>
      </Form.Field>
      </Form.Group>

      </Segment>
    )

}