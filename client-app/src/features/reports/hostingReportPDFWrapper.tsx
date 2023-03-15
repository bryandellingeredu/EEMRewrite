import { observer } from "mobx-react-lite";
import { useState, useEffect, useRef  } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import agent from "../../app/api/agent";
import { Link } from "react-router-dom";
import { Activity } from "../../app/models/activity";
import { toast } from "react-toastify";
import { HostingReportPDFComponentToPrint } from "./hostingReportPDFComponentToPrint";
import { Button, Divider, Icon } from "semantic-ui-react";
import { useReactToPrint } from "react-to-print";



export default observer(function HostingReportPDFWrapper() {
    const { graphUserStore, } = useStore();
    const { armyProfile } = graphUserStore;
    const [hostingReports, setHostingReports] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
    });
     
    useEffect(() => {
      if (armyProfile && armyProfile.mail) {
      setLoading(true);
      agent.HostingReports.listForHostingReportPDF()
      .then((response) => {
      setHostingReports(response);
      setLoading(false);
      })
      .catch((error) => {
      console.log(error);
      setLoading(false);
      toast.error("an error occured loading hosting reports")
      });
      }
      }, [armyProfile]);
    

    return(
<>
     
        {(!armyProfile || !armyProfile?.mail) && 
            <div className="ui yellow message">
              <div className="header">
                You are not authorized to view hosting reports
              </div>
              If you would like view hosting reports first sign into your
              army 365 account.
              <div style={{ textAlign: "center" }}>
                <Link
                  to={`${process.env.PUBLIC_URL}/authenticatetoarmy`}
                  className="ui primary button"
                >
                  Log Into Army 365
                </Link>
            </div>
            </div>
          }
          {
            armyProfile && armyProfile.mail && loading && <LoadingComponent content='Loading Hosting Reports...'/>
          }
          {!loading && armyProfile && armyProfile.mail && hostingReports && hostingReports.length > 0 &&
            <>
              <Button color="teal" icon labelPosition="left" onClick={handlePrint} size='huge'>
                <Icon name="print" />
                Print Hosting Reports Or Save Reports as PDF
              </Button>
              <Divider/>
              <HostingReportPDFComponentToPrint ref={componentRef} hostingReports={hostingReports} />
            
            </>
      
         }

</>
    )
})