import { Form, Radio, Segment } from "semantic-ui-react";

interface Props{
    roomRequired: boolean
    setRoomRequired: () => void
}

export default function LocationRadioButtons({roomRequired, setRoomRequired} : Props) {
    
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
          onChange={setRoomRequired}
        />
      </Form.Field>
      <Form.Field>
        <Radio
          label='Need a Room'
          name='roomRequiredRadioGroup'
          value='that'
          checked={roomRequired}
          onChange={setRoomRequired}
        />
      </Form.Field>
      </Form.Group>
      </Segment>
    )

}