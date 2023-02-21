import { observer } from "mobx-react-lite";
import { useState, useEffect  } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Link, useHistory, useParams } from "react-router-dom";
import { ActivityFormValues } from "../../app/models/activity";
import { Attachment } from "../../app/models/attachment";
import agent from "../../app/api/agent";

export default observer(function DownloadBio() {
  const history = useHistory();
  const { activityStore, graphUserStore, commonStore } = useStore();
  const { loadActivity} = activityStore;
  const { armyProfile } = graphUserStore;
  const { id } = useParams<{ id: string }>();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(
    new ActivityFormValues()
  );
  const [loading, setLoading] = useState(true);


  
  useEffect(() => {
    const fetchData = async () => {
      const activity = await loadActivity(id, categoryId);
      setActivity(new ActivityFormValues(activity));
    
      if (armyProfile && armyProfile.mail && activity?.attachmentLookup && commonStore.token) {
        const attachmentLookup : number = activity?.attachmentLookup || 0;
        const metaData : Attachment = await agent.Attachments.details(attachmentLookup)
        await handleDownloadAttachment(metaData);
      }
      setLoading(false);
    };
  
    fetchData();
  }, []);


    const handleDownloadAttachment = async (metaData : Attachment) =>{
        try{
          const token = commonStore.token;
    
          const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);
          const requestOptions = {
           method: 'GET',
          headers: headers,
          };
          const attachmentData = await fetch(`${process.env.REACT_APP_API_URL}/upload/${metaData.id}`, requestOptions);
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
          history.push(`${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`)
        
        }catch(err){
          setLoading(false);
          console.error(err);
        }
      }
    

    return(

      <>
      {loading && <LoadingComponent content='attempting to download Bio...'/>}

     {!loading && armyProfile && armyProfile.mail && (!activity.attachmentLookup || activity.attachmentLookup < 0) &&
           <div className="ui yellow message" style={{ textAlign: "center" }}>
           <div className="header">
             {activity.title} does not have a Bio Uploaded
           </div>
           A Bio has not been uploaded for the {activity.report} for  {activity.title}
           <div style={{ textAlign: "center" }}>
             <Link
               to={`${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`}
               className="ui primary button"
             >
               Go Back to Event Details
             </Link>
           </div>
         </div>
        }

    {(!armyProfile || !armyProfile?.mail) && !loading && 
          <div className="ui yellow message">
            <div className="header">
              You are not authorized to download Bios.
            </div>
            If you would like to download this Bio you must first sign into your
            army 365 account.
            <div style={{ textAlign: "center" }}>
              <Link
                to={`${process.env.PUBLIC_URL}/authenticatetoarmy`}
                className="ui primary button"
              >
                Log Into Army 365
              </Link>
              <Link
               to={`${process.env.PUBLIC_URL}/activities/${id}/${categoryId}`}
                className="ui secondary button"
              >
                Back to Event Details
              </Link>
          </div>
          </div>
        }


     </>
  )
        
     });