import { observer } from "mobx-react-lite";
import {useEffect, useState} from 'react';
import { useStore } from "../../app/stores/store";
import { Button, Divider, Header, Icon, Table } from "semantic-ui-react";
import GraphUserStore from "../../app/stores/graphUserStore";
import { Link } from "react-router-dom";
import agent from "../../app/api/agent";
import { format } from "date-fns";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { v4 as uuid } from "uuid";
import OutsiderReportRow from "./outsiderReportRow";
import { Formik, Form } from 'formik';
import MyTextInput from "../../app/common/form/MyTextInput";
import MyDateInput from "../../app/common/form/MyDateInput";
import MyDataList from "../../app/common/form/MyDataList";
import MySelectInput from "../../app/common/form/MySelectInput";

interface SearchFormValues{
  title: string
  start : Date | null | string
  end : Date | null | string
  location: string
  actionOfficer: string
  outsiderReportStatus: string
  outsiderReportDirectorate: string,
  outsiderReportEngagement: string,
  outsiderReportUSAWCGraduate: string,
  outsiderReportDV: string,
  outsiderReportNumOfPeople: string
}

interface TableData{
    id: string
    categoryId: string
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    organizationName: string
    outsiderReportStatus: string
    createdBy: string
    outsiderReportDirectorate : string
    outsiderReportEngagement : string
    outsiderReportUSAWCGraduate : string
    outsiderReportDV: string
    outsiderReportNumOfPeople : string
  }

  interface CSVData{
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    outsiderReportStatus: string
    outsiderReportDirectorate: string
    outsiderReportEngagement: string
    outsiderReportUSAWCGraduate: string
    outsiderReportDV: string
    outsiderReportNumOfPeople: string
  }

export default observer(function OutsiderReportTable(){
    const {graphRoomStore, organizationStore, graphUserStore} = useStore();
    const {graphRooms, loadGraphRooms} = graphRoomStore
    const { armyProfile } = graphUserStore;
    const [primaryLocations, setPrimaryLocations] = useState<string[]>([]);
    const [actionOfficers, setActionOfficers] = useState<string[]>([]);
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        agent.Activities.getLocations().then(response => setPrimaryLocations(response));
        agent.Activities.getActionOfficers().then(response => setActionOfficers(response)); 
        if(!graphRooms) loadGraphRooms();  
        (async () => {
            await loadData(
              {
                title: '',
                start: format(new Date(), 'MM-dd-yyy'),
                end: '',
                location: '',
                actionOfficer: '',
                outsiderReportStatus: '',
                outsiderReportDirectorate: '',
                outsiderReportEngagement: '',
                outsiderReportUSAWCGraduate: '',
                outsiderReportDV: '',
                outsiderReportNumOfPeople: ''
              }
            )
          })();
    }, []);

    async function loadData(data : SearchFormValues){
        try{
          const response = await agent.HostingReports.listOutsiderBySearchParams(data);
          let dataArray : TableData[] = [];
          response!.forEach((item: any) =>{
            let newTableData : TableData = {
              id: item.id,
              categoryId: item.categoryId,
              title: item.title,
              start: item.allDayEvent ?  format(new Date(item.start), 'MM/dd' ) : format(new Date(item.start), 'MM/dd h:mma' ),
              end: item.allDayEvent ?  format(new Date(item.end), 'MM/dd' ) : format(new Date(item.end), 'MM/dd h:mma' ),
              actionOfficer: item.actionOfficer,
              organizationName: item.organizationName,
              outsiderReportStatus: item.outsiderReportStatus,
              location: item.location,
              createdBy: item.createdBy,
              outsiderReportDirectorate: item.outsiderReportDirectorate,
              outsiderReportEngagement: item.outsiderReportEngagement,
              outsiderReportUSAWCGraduate: item.outsiderReportUSAWCGraduate,
              outsiderReportDV: item.outsiderReportDV,
              outsiderReportNumOfPeople: item.outsiderReportNumOfPeople
            }
            dataArray.push(newTableData);
          });
   
            setTableData(dataArray);
            setLoading(false);     
        }
        catch (error) {
          console.log(error);
          setLoading(false);
          toast.error('an error occured loading hosting reports');
        }}

        function handleFormSubmit(values : SearchFormValues ) {
          setLoading(true);
          const data = {...values,
             start: values.start ? format(new Date(values.start), 'MM-dd-yyyy') : '',
            end:  values.end ?   format(new Date(values.end), 'MM-dd-yyyy') : ''};
          
          (async () => {
            await loadData(data);
          })();
        }

     

        const handleDownload = () => {
          let data: CSVData[] = [];

            data = tableData.map((
              { title,start,end,location,actionOfficer,outsiderReportStatus,outsiderReportDirectorate, outsiderReportEngagement,
                outsiderReportUSAWCGraduate, outsiderReportDV, outsiderReportNumOfPeople }) => {
              return { title,start,end,location,actionOfficer,outsiderReportStatus,outsiderReportDirectorate, outsiderReportEngagement,
                outsiderReportUSAWCGraduate, outsiderReportDV, outsiderReportNumOfPeople };
            });
          
    
          if(data && data.length > 0){
            const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/OutsiderReport`;
            fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            })
              .then(res => res.blob())
              .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "outsiderReport.csv");
                document.body.appendChild(link);
                link.click();
              });
          }
        };

    return(
        <>
     <Divider horizontal>
     <Header as='h2'>
     <Icon name='ordered list'  />
        Outsider Report List
     </Header>
     </Divider>

     {(!armyProfile || !armyProfile?.mail) && 
          <div className="ui yellow message">
            <div className="header">
              You are not authorized to view outsider reports
            </div>
            If you would like view outsider reports first sign into your
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

{armyProfile && armyProfile.mail &&

<Formik
initialValues={{title: '',
               start: new Date(),
               end: null,
               location: '',
               actionOfficer: '',
               outsiderReportStatus: '',
               outsiderReportDirectorate: '',
               outsiderReportEngagement: '',
               outsiderReportUSAWCGraduate: '',
               outsiderReportDV: '',
               outsiderReportNumOfPeople: ''
               }}
  onSubmit={(values) => handleFormSubmit(values)}
  >
     {({handleSubmit}) => (
      <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'
      style={{ overflowX: "auto", overflowY: "hidden", minHeight: "300px", fontSize: '0.95em' }}>
 <Table celled selectable>
      <Table.Header>
      <Table.Row>
        <Table.HeaderCell style={{ minWidth: "200px" }}>Title</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "165px" }}>Start</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "165px" }} >End</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "175x" }}>Location</Table.HeaderCell>
        <Table.HeaderCell style={{ maxWidth: "25px" }}>Status</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "50px" }}>Action Officer</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "200px" }}>Directorate</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "200px" }}>Engagement</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "200px" }}>USAWC Graduate</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "200px" }}>Visiting DV</Table.HeaderCell>
        <Table.HeaderCell style={{ minWidth: "100px" }}># People</Table.HeaderCell>
        <Table.HeaderCell style={{ maxWidth: "25px" }}> 
                      <Button animated color='black' onClick={handleDownload} >
                        <Button.Content hidden>Excel</Button.Content>
                        <Button.Content visible><Icon name='file excel'/></Button.Content>
                      </Button>
      </Table.HeaderCell>
      </Table.Row>
      <Table.Row>
      <Table.HeaderCell>
          <MyTextInput name='title'  placeholder="" />
      </Table.HeaderCell>
      <Table.HeaderCell>
        <MyDateInput
            isClearable
            placeholderText="event starts after"
            name="start"
            dateFormat="MMMM d, yyyy" />
        </Table.HeaderCell>
        <Table.HeaderCell>
            <MyDateInput
              isClearable
              placeholderText="event ends before"
              name="end"
              dateFormat="MMMM d, yyyy"
              />
        </Table.HeaderCell>
        <Table.HeaderCell>
            <MyDataList
              name="location"
              placeholder=""
              dataListId="locations"
              options={graphRooms.map(x => x.displayName)
                      .concat(primaryLocations)
                      .sort()
                      .filter((value, index, self) => self.indexOf(value) === index)}
                      />
          </Table.HeaderCell>


        <Table.HeaderCell>
                    <MySelectInput
                          options={[
                            { text: "", value: "" },
                            { text: "Draft", value: "Draft" },
                            {
                              text: "Exec Services Approved",
                              value: "Exec Services Approved",
                            },
                          ]}
                          name="outsiderReportStatus"
                          placeholder=""
                        />
                    </Table.HeaderCell>


        <Table.HeaderCell>
        <MyDataList
           name="actionOfficer"
           placeholder=""
          dataListId="actionOfficers"
          options={actionOfficers}
           />     
        </Table.HeaderCell>
        <Table.HeaderCell>
            <MyTextInput name='outsiderReportDirectorate'  placeholder="" />
        </Table.HeaderCell>
        <Table.HeaderCell>
        <MyTextInput name='outsiderReportEngagement'  placeholder="" />
        </Table.HeaderCell>
        <Table.HeaderCell>
        <MyTextInput name='outsiderReportUSAWCGraduate'  placeholder="" />
        </Table.HeaderCell>
        <Table.HeaderCell>
        <MyTextInput name='outsiderReportDV'  placeholder="" />
        </Table.HeaderCell>
        <Table.HeaderCell>
        <MyTextInput name='outsiderReportNumOfPeople'  placeholder="" />
        </Table.HeaderCell>
        <Table.HeaderCell>
     
     <Button animated  loading={loading} color='violet'  type='submit' >
         <Button.Content hidden>Search</Button.Content>
         <Button.Content visible><Icon name='search'/></Button.Content>
      </Button>
  
             </Table.HeaderCell>
      </Table.Row>
      </Table.Header>
      <Table.Body>
        {loading && 
         <Table.Row colSpan = '1'>
             <LoadingComponent content='Loading Outsider Reports...'/>
         </Table.Row>
        }
        {!loading && tableData.map(item => (
              <OutsiderReportRow key={uuid()} item={item} /> 

         ))}
        
      </Table.Body>
 </Table>
 </Form>
        )}
 </Formik>
}



        </>
    )})