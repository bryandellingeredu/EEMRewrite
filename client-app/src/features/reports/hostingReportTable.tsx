import { observer } from "mobx-react-lite";
import {useEffect, useState} from 'react';
import { useStore } from "../../app/stores/store";
import { format } from "date-fns";
import { Button, Divider, Header, Icon, Popup, Table } from 'semantic-ui-react';
import { Formik, Form } from 'formik';
import MyTextInput from '../../app/common/form/MyTextInput';
import MyDateInput from '../../app/common/form/MyDateInput';
import agent from "../../app/api/agent";
import MyDataList from "../../app/common/form/MyDataList";
import MySelectInput from "../../app/common/form/MySelectInput";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Link, useHistory } from 'react-router-dom';
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import HostingReportRow from "./hostingReportRow";


interface SearchFormValues{
    title: string
    start : Date | null
    end : Date | null
    location: string
    actionOfficer: string
    organizationId: string
    hostingReportStatus: string
    guestRank: string
    guestTitle: string
    createdBy: string
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
    hostingReportStatus: string
    guestRank: string
    guestTitle: string
    createdBy: string
  }

  interface CSVData{
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    organizationName: string
    hostingReportStatus: string
    guestRank: string
    guestTitle: string
    createdBy: string
  }

export default observer(function HostingReportTable(){
    const {graphRoomStore, organizationStore, graphUserStore} = useStore();
    const {graphRooms, loadGraphRooms} = graphRoomStore
    const [primaryLocations, setPrimaryLocations] = useState<string[]>([]);
    const [actionOfficers, setActionOfficers] = useState<string[]>([]);
    const [guestTitles, setGuestTitles] = useState<string[]>([]);
    const [createdByList, setCreatedByList] = useState<string[]>([]);
    const [initialData, setInitialData] = useState<TableData[]>([]);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [searchedData, setSearchedData] = useState<TableData[]>([]);
    const [loadingSearchedData, setLoadingSearchData] = useState(false);
    const [searched, setSearched] = useState(false);
    const {organizations, loadOrganizations, organizationOptions} = organizationStore;
    const [submitting, setSubmitting] = useState(false);
    const { armyProfile } = graphUserStore;


    useEffect(() => {
        agent.Activities.getLocations().then(response => setPrimaryLocations(response));
        agent.Activities.getActionOfficers().then(response => setActionOfficers(response));  
        agent.HostingReports.getGuestTitles().then(response => setGuestTitles(response));
        agent.Activities.getCreatedBy().then(response => setCreatedByList(response));  
        if(!graphRooms) loadGraphRooms();       
        if(!organizations || organizations.length < 1) loadOrganizations();
               
        (async () => {
          await loadData(
            {
              title: '', start: format(new Date(), 'MM-dd-yyy'), end: '', loaction: '',
              actionOfficer: '', hostingReportStatus: '', guestRank: '', guestTitle: '', createdBy: ''
            }, true
          )
        })();
      }, []);

      async function loadData(data : any, isInitialData : boolean){
        try{
          const response = await agent.HostingReports.listBySearchParams(data);
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
              hostingReportStatus: item.hostingReportStatus,
              location: item.location,
              guestRank: item.guestRank,
              guestTitle: item.guestTitle,
              createdBy: item.createdBy
            }
            dataArray.push(newTableData);
          });
          if(isInitialData){
            setInitialData(dataArray);
            setLoadingInitialData(false);
          }else{
            setSearchedData(dataArray);
            setLoadingSearchData(false);
          }
       
        }
        catch (error) {
          console.log(error);
          setLoadingInitialData(false);
          setLoadingSearchData(false);
          toast.error('an error occured loading hosting reports');
        }}
      
        function handleFormSubmit(values : SearchFormValues ) {
          setSubmitting(true);
          setSearched(true);
          setLoadingSearchData(true)
          console.log(values);
          const data = {...values, start: values.start ?   format(new Date(values.start), 'MM-dd-yyyy') : '',  end:  values.end ?   format(new Date(values.end), 'MM-dd-yyyy') : ''};
          
          (async () => {
            await loadData(data, false);
            setSubmitting(false);
          })();
        }

        const handleDownload = () => {
          const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/Csv`;
          let data: CSVData[] = [];
          if (searched && searchedData) {
            data = searchedData.map(({ title,start,end,location,actionOfficer,organizationName,hostingReportStatus,guestRank, guestTitle,createdBy}) => {
              return { title,start,end,location,actionOfficer,organizationName,hostingReportStatus,guestRank, guestTitle,createdBy};
            });
          }
          if(!searched && initialData){
            data = initialData.map(({ title,start,end,location,actionOfficer,organizationName,hostingReportStatus,guestRank, guestTitle,createdBy}) => {
              return { title,start,end,location,actionOfficer,organizationName,hostingReportStatus,guestRank, guestTitle,createdBy};
            });
          }
          if(data && data.length > 0){
            const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/HostingReport`;
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
                link.setAttribute("download", "hostingReports.csv");
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
        Hosting Report List
     </Header>
     </Divider>


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
  
  {armyProfile && armyProfile.mail &&

<Formik
initialValues={{title: '', start: new Date(), end: null, location: '',
 actionOfficer: '', organizationId: '', hostingReportStatus: '', guestRank: '',
 guestTitle: '', createdBy: ''}}
onSubmit={(values) => handleFormSubmit(values)}>
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
                    <Table.HeaderCell style={{ minWidth: "25x" }}>Rank</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "50px" }}>Title / Org</Table.HeaderCell>
                    <Table.HeaderCell style={{ maxWidth: "50px" }}>Lead Org</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "50px" }}>Action Officer</Table.HeaderCell>
                    <Table.HeaderCell style={{ maxWidth: "50px" }}>Created By</Table.HeaderCell>
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
                           dateFormat="MMMM d, yyyy"
                        />
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
                          name="hostingReportStatus"
                          placeholder=""
                        />
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                    <MySelectInput
                        options={[
                          { text: "", value: "" },
                          { text: "GEN", value: "GEN" },
                          { text: "Gen", value: "Gen" },
                          { text: "ADM", value: "ADM" },
                          { text: "LTG", value: "LTG" },
                          { text: "LT Gen", value: "LT Gen" },
                          { text: "LTGen", value: "LTGen" },
                          { text: "SES", value: "SES" },
                          { text: "VADM", value: "VADM" },
                          { text: "MG", value: "MG" },
                          { text: "Maj Gen", value: "Maj Gen" },
                          { text: "MajGen", value: "MajGen" },
                          { text: "RADM", value: "RADM" },
                          { text: "BG", value: "BG" },
                          { text: "Brig Gen", value: "Brig Gen" },
                          { text: "BGen", value: "BGen" },
                          { text: "RDML", value: "RDML" },
                          { text: "COL", value: "COL" },
                          { text: "CAPT", value: "CAPT" },
                          { text: "LTC", value: "LTC" },
                          { text: "Lt Col", value: "Lt Col" },
                          { text: "LtCol", value: "LtCol" },
                          { text: "CDR", value: "CDR" },
                          { text: "MAJ", value: "MAJ" },
                          { text: "Maj", value: "Maj" },
                          { text: "LCDR", value: "LCDR" },
                          { text: "SMA", value: "SMA" },
                          { text: "CSM", value: "CSM" },
                          { text: "Mr.", value: "Mr." },
                          { text: "Mrs.", value: "Mrs." },
                          { text: "Ms.", value: "Ms." },
                          { text: "Dr.", value: "Dr." },
                          { text: "Prof.", value: "Prof." },
                          { text: "HON", value: "HON" },
                        ]}
                        placeholder=""
                        name="guestRank"
                      />
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                       
                        <MyDataList
                              name="guestTitle"
                              placeholder=""
                              dataListId="guestTitles"
                              options={guestTitles}
                            />
                      
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                        <MySelectInput
                            options={organizationOptions}
                            placeholder=""
                            name="organizationId"
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
                    <MyDataList
                              name="createdBy"
                              placeholder=""
                              dataListId="createdByList"
                              options={createdByList}
                            />
                    </Table.HeaderCell>
                    <Table.HeaderCell>
     
            <Button animated  loading={submitting} color='violet'  type='submit' >
                <Button.Content hidden>Search</Button.Content>
                <Button.Content visible><Icon name='search'/></Button.Content>
              </Button>
         
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
              {( (loadingInitialData && !searched) || (loadingSearchedData && searched)) &&
              <Table.Row>
                <Table.Cell colSpan='11'>
                    <LoadingComponent content='Loading Hosting Reports...'/>
                </Table.Cell>
              </Table.Row>
              }
              {!searched && !loadingInitialData && initialData.map(item => (
                <HostingReportRow key={uuid()} item={item} /> 
              ))}
               {searched && !loadingSearchedData && searchedData.map(item => (
                  <HostingReportRow key={uuid()} item={item} />   
              ))}
            </Table.Body>
            </Table>
        </Form>
        )}
</Formik>
}
</>

  )})