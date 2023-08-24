import { Link, useHistory, useParams } from "react-router-dom";
import {useEffect, useState} from "react";
import { observer } from 'mobx-react-lite';
import { useStore } from "../../../app/stores/store";
import agent from '../../../app/api/agent';
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { Button, ButtonGroup, Divider, Form, Grid, Header, Icon, Input, Label, Segment } from "semantic-ui-react";
import { v4 as uuid } from "uuid";
import { toast } from 'react-toastify';

export default observer( function AddToMyCalendar (){
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    const {activityStore} = useStore();
    const {createICSFile, loadActivity, selectedActivity: activity} = activityStore;
    const { id } = useParams<{ id: string }>();
    const { categoryId } = useParams<{ categoryId: string }>();
    const [email, setEmail] = useState('');
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(false);
        setEmail(e.target.value);
      };

      const handleButtonClick = async () => {
        setError(false);
        if (email && /\S+@\S+\.\S+/.test(email)) {
          setSaving(true);
          try {
            await agent.ActivityNotifications.create({ id: uuid(), activityId: id, email });
            handleAddToCalendar();
                // Show the toast notification
                toast.info('iCal File Uploaded Successfully. If you have your Outlook client open, you can double-click the downloaded iCal file to add it to your Outlook calendar.', {
                  position: "top-left",
                  autoClose: 20000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
            history.push(`${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`);
      
          } catch (error) {
            console.error("An error occurred:", error);
            setError(true);
          } finally {
            setSaving(false);
          }
        } else {
          setError(true);
        }
      };
      
    

    useEffect(() => {
        if(!activity && id && categoryId){
          activityStore.loadActivity(id, categoryId);
        } 
      },[id, categoryId, loadActivity])
  
      const handleAddToCalendar = () =>{
        if(activity){
        const icsFile = createICSFile(activity);
        let blob = new Blob([icsFile], { type: 'text/calendar;charset=utf-8' });
        //window.open(encodeURI("data:text/calendar;charset=utf8," + url));
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = `${activity.title}.ics`;
        a.click();
        }
     }

     if (!activity) return <LoadingComponent/>;
    return(

<Segment textAlign="center">
  <Divider horizontal>
    <Header as='h2'>
      <Icon name='calendar' />
      Add {activity.title} to an External Calendar
    </Header>
  </Divider>
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold', fontSize: 'large' }}>Enter an email where you can be notified if {activity.title} is updated:</label>
        <Input
          style={{ width: '600px' }}
          size="large"
          label={{ icon: 'asterisk' }}
          labelPosition='left corner'
          placeholder='Email...'
          onChange={handleInputChange}
          value={email}
          error={error}
        />
        {error && <Label basic color='red' pointing='left'>Please enter a valid email</Label>}
      </div>
      <div style={{ clear: 'both', textAlign: 'center', marginTop: '20px' }}>
        <ButtonGroup size="huge">
      <Button
        content="Cancel"
        as={Link} to={`${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`} />

      <Button
        content="Add To My Calendar"
        onClick={handleButtonClick}
        primary
        loading={saving}
      />
      </ButtonGroup>
    </div>
</Segment>






    )
})
