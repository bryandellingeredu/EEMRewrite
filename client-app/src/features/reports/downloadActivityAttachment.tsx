
import { useState, useEffect  } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Link, useHistory, useParams } from "react-router-dom";
import agent from "../../app/api/agent";
import { ActivityAttachment } from "../../app/models/activityAttachment";
import { toast } from "react-toastify";

export default function DownloadActivityAttachment() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const { commonStore } = useStore();

  

  useEffect(() => {
    const fetchData = async () => {
      const metaData : ActivityAttachment = await agent.Attachments.activityAttachmentDetails(id)
      await handleDownloadAttachment(metaData);
      setLoading(false);
    };
    fetchData();
  }, []);


    const handleDownloadAttachment = async (metaData : ActivityAttachment) =>{
        try{
          const token = commonStore.token;
    
          const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);
          const requestOptions = {
           method: 'GET',
          headers: headers,
          };
          const attachmentData = await fetch(`${process.env.REACT_APP_API_URL}/upload/ActivityAttachment/${metaData.id}`, requestOptions);
          headers.append('Content-Type', 'application/json');
          const data = await attachmentData.arrayBuffer();
         const file = new Blob([data], { type: metaData.fileType });
         var fileUrl = window.URL.createObjectURL(file);
         var a = document.createElement("a");
         a.href = fileUrl;
          a.download = metaData.fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(fileUrl);
          history.goBack();
        
        }catch(err){
          setLoading(false);
          console.error(err);
          toast.error('error occured during download');
          history.goBack();
        }
      }
    

    return(

      <>
      {loading && <LoadingComponent content='attempting to download Attachment...'/>}
     </>
  )
        
     };