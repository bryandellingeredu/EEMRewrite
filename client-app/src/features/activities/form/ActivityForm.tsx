import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Form, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import { useEffect} from "react";
import LoadingComponent from "../../../app/layout/LoadingComponent";

export default observer(function ActivityForm(){

        const history = useHistory();
        const {activityStore} = useStore();
        const {createActivity, updateActivity, loading, loadActivity, loadingInitial} = activityStore
        const [activity, setActivity] = useState({
        id: '',
        subject: '',
        bodyPreview: '',
        category: '',
        start: {dateTime: '', timeZone: 'utc' },
        end: {dateTime: '', timeZone: 'utc' },
      });

        const {id} = useParams<{id: string}>();
        const {email} = useParams<{email: string}>();
      
      useEffect(() => {
        if(id) loadActivity(id,email).then(activity => setActivity(activity))      
      },[id, loadActivity ])

    function handleSubmit(){
       if(activity.id.length === 0){
        createActivity(activity).then((newActivity) =>{
          if(newActivity){
           history.push(`/activities/${newActivity.id}`)
          }         
        });
       }else{
        updateActivity(activity).then(() =>history.push(`/activities/${activity.id}`));
       }
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

    if(loadingInitial){
      return (
      <LoadingComponent content='Loading calendar event...'/>
      )
    } 

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
                <Button loading={loading} floated='right' positive type='submit' content='Submit'/>
                <Button as={Link} to='/activities' floated='right'  type='button' content='Cancel'
                />
            </Form>
        </Segment>
    )
})