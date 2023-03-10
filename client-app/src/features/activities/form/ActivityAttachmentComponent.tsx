import {useState} from 'react'
import { Link } from "react-router-dom"
import { toast } from 'react-toastify';
import { Button, ButtonGroup, Confirm, Icon } from "semantic-ui-react"
import agent from "../../../app/api/agent";
import { ActivityAttachment } from '../../../app/models/activityAttachment';
import { useStore } from "../../../app/stores/store";


interface Props{
    attachmentActivityId: string
    fileName: string
    deleteActivityAttachment: (activityAttachmentId: string) => void;
}

export default function ActivityAttachmentComponent({attachmentActivityId, fileName, deleteActivityAttachment}: Props){
             const [loading, setLoading] = useState(false);
             const [showConfirm, setShowConfirm] = useState(false);
             const { commonStore } = useStore();
        

        const fetchData = async () => {
            setLoading(true);
          const metaData : ActivityAttachment = await agent.Attachments.activityAttachmentDetails(attachmentActivityId)
          await handleDownloadAttachment(metaData);
        };

        const handleDeleteEvent = async() =>{
            try{
               setShowConfirm(false);
               await agent.Attachments.deleteActvityAttachment(attachmentActivityId);
               deleteActivityAttachment(attachmentActivityId);
               toast.success('This attachment has been deleted');
            } catch(error){
                console.log(error);
                toast.error('an error occured');  
            }
        }

        const handleDownloadAttachment = async (metaData : ActivityAttachment) =>{
            try{
              const token = commonStore.token;    
              const headers = new Headers();
                headers.append('Authorization', `Bearer ${token}`);
                headers.append('Content-Type', 'application/json');

              const requestOptions = {
               method: 'GET',
              headers: headers,
              };
              debugger;
              const url = `${process.env.REACT_APP_API_URL}/upload/ActivityAttachment/${metaData.id}`;
              const attachmentData = await fetch(url, requestOptions);

              const data = await attachmentData.arrayBuffer();
             const file = new Blob([data], { type: metaData.fileType });
             var fileUrl = window.URL.createObjectURL(file);
             var a = document.createElement("a");
             a.href = fileUrl;
              a.download = metaData.fileName;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(fileUrl);
              setLoading(false);
            }catch(err){
              setLoading(false);
              console.error(err);
              toast.error('error occured during download');
            }
          } 

    return (
        <>
           <ButtonGroup >
            <Button  basic  onClick={fetchData} loading={loading} type='button'>
                <span style={{ color: 'blue', textDecoration: 'none' }} className="hover-underline"> {fileName}</span>
                                </Button>
                                <Button animated='vertical'basic size='tiny' type='button'   onClick={() => setShowConfirm(true)}>
                                <Button.Content hidden>Delete</Button.Content>
                                <Button.Content visible>
                                <Icon name='x' color='red' />
                                </Button.Content>
                                </Button>
                                <Confirm
                  open={showConfirm}
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={handleDeleteEvent}
                  confirmButton="Delete Attachment"
                  header='You are about to delete this attachment'
                  content={`This will delete  ${fileName}`}
                />
            </ButtonGroup>
          </>
          )
        }