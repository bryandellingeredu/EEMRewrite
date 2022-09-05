import { ChangeEvent, useState } from "react";
import { Button, Form, Segment } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";

interface Props{
    activity: Activity | undefined
    closeForm: () => void
    createOrEdit: (activity: Activity) => void;
    submitting: boolean;
}

export default function ActivityForm(
    {activity: selectedActivity, closeForm, createOrEdit, submitting}: Props){

    const initialState = selectedActivity ?? {
        id: '',
        subject: '',
        bodyPreview: '',
        category: '',
        start: {dateTime: '', timeZone: 'utc' },
        end: {dateTime: '', timeZone: 'utc' },
    }

    function handleSubmit(){
        createOrEdit(activity)
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
      const{name, value} = event.target
      if(name === 'start.dateTime'){
        setActivity({...activity, 'start': {'dateTime': value, 'timeZone': 'UTC'}});
      } else if (name === 'end.dateTime'){
        setActivity({...activity, 'end': {'dateTime': value, 'timeZone': 'UTC'}});
      } else{
      setActivity({...activity, [name]: value})
      }
    }

    const [activity, setActivity] = useState(initialState)
    return(
        <Segment clearing>
            <Form onSubmit={handleSubmit} autoComplete='off'>
                <Form.Input placeholder='Title'
                 value={activity.subject}
                  name='subject'
                  onChange={handleInputChange}/>
                <Form.TextArea placeholder='Description'
                 value={activity.bodyPreview}
                 name='bodyPreview'
                 onChange={handleInputChange} />
                <Form.Input placeholder='Category'
                 value={activity.category}
                 name='category'
                 onChange={handleInputChange} />
                <Form.Input placeholder='Start'
                 value={activity.start.dateTime}
                 name='start.dateTime'
                 onChange={handleInputChange} />
                <Form.Input placeholder='End'
                value={activity.end.dateTime}
                name='end.dateTime'
                onChange={handleInputChange}
                 />
                <Button loading={submitting} floated='right' positive type='submit' content='Submit'/>
                <Button floated='right'  type='button' content='Cancel'
                onClick={closeForm}
                />
            </Form>
        </Segment>
    )
}