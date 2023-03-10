import {  faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Grid, Segment } from 'semantic-ui-react';
import { ActivityAttachment } from '../../../app/models/activityAttachment';
import { useStore } from "../../../app/stores/store";
import {useState} from 'react';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface Props{
    attachmentActivityId: string
    fileName: string
}

export default function ActivityAttachmentSideBarComponent({attachmentActivityId, fileName, }: Props){
    const [loading, setLoading] = useState(false);
    const { commonStore } = useStore();

    const fetchData = async () => {
        setLoading(true);
      const metaData : ActivityAttachment = await agent.Attachments.activityAttachmentDetails(attachmentActivityId)
      await handleDownloadAttachment(metaData);
    };

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


    return(
        <Segment attached>
        <Grid verticalAlign='middle'>
            <Grid.Column width={1}>
            <FontAwesomeIcon icon={faPaperclip} size='2x' color='#00b5ad'  />
            </Grid.Column>
            <Grid.Column width={14}>
            <Button basic onClick={fetchData} loading={loading} type='button'>
            <span
                style={{ color: 'blue', textDecoration: 'none' }}
                className="hover-underline"
                >
                {fileName.length > 50 ? `${fileName.slice(0, 50)}...` : fileName}
            </span>
        </Button>
            </Grid.Column>
        </Grid>
    </Segment>
    )
}