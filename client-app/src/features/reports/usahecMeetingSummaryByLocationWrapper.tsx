import { Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Divider, Header, Icon, Table } from "semantic-ui-react";
import MyDataList from "../../app/common/form/MyDataList";
import MyDateInput from "../../app/common/form/MyDateInput";
import MyTextInput from "../../app/common/form/MyTextInput";
import {useEffect, useRef, useState} from 'react';
import agent from "../../app/api/agent";
import { useStore } from "../../app/stores/store";
import { format } from "date-fns";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import USAHECMeetingSummaryByLocationDateRow from "./usahecMeetingSummaryByLocationDateRow";
import { v4 as uuid } from "uuid";
import { USAHECMeetingSummaryByLocationComponentToPrint } from "./usahecMeetingSummaryByLocationComponentToPrint";
import { useReactToPrint } from "react-to-print";

interface SearchFormValues{
  title: string
  start : Date | null
  end : Date | null
  location: string
  actionOfficer: string
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
  createdBy: string
}

interface GroupedData {
  day: string;
  values: {
    location: string;
    events: TableData[];
  }[];
}

interface CSVData{
  title: string
  start : string
  end : string
  location: string
  actionOfficer: string
  createdBy: string
}

export default observer(function USAHECMeetingSummaryByLocationWrapper(){

    const [createdByList, setCreatedByList] = useState<string[]>([]);
    const [actionOfficers, setActionOfficers] = useState<string[]>([]);
    const {graphRoomStore} = useStore();
    const {graphRooms, loadGraphRooms} = graphRoomStore
    const [submitting, setSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<TableData[]>([]);
    const [initialGroupedData, setInitialGroupedData] = useState<GroupedData[]>([]);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [searchedData, setSearchedData] = useState<TableData[]>([]);
    const [searchedGroupedData, setSearchedGropuData] = useState<GroupedData[]>([]);
    const [loadingSearchedData, setLoadingSearchData] = useState(false);
    const [searched, setSearched] = useState(false);
    const [printFriendlyView, setPrintFriendlyView] = useState(false);
    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
    });

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


      useEffect(() => {
        agent.Activities.getActionOfficers().then(response => setActionOfficers(response));  
        agent.Activities.getCreatedBy().then(response => setCreatedByList(response));  
        if(!graphRooms) loadGraphRooms();       

               
        (async () => {
      
          await loadData(
            
            {
              title: '', start: format(new Date(), 'MM-dd-yyy'), end: format(nextMonth, 'MM-dd-yyy'), loaction: '',
              actionOfficer: '', hostingReportStatus: '', guestRank: '', guestTitle: '', createdBy: ''
            }, true
          )
        })();
      }, []);

      async function loadData(data : any, isInitialData : boolean){
        try{
          const response = await agent.USAHECReports.listBySearchParams(data);
          let dataArray : TableData[] = [];
          response!.forEach((item: any) =>{
            let newTableData : TableData = {
              id: item.id,
              categoryId: item.categoryId,
              title: item.title,
              start: item.allDayEvent ?  format(new Date(item.start), 'MM/dd/yyyy' ) : format(new Date(item.start), 'MM/dd/yyyy h:mma' ),
              end: item.allDayEvent ?  format(new Date(item.end), 'MM/dd/yyyy' ) : format(new Date(item.end), 'MM/dd/yyyy h:mma' ),
              actionOfficer: item.actionOfficer,
              location: item.location,
              createdBy: item.createdBy
            }
            dataArray.push(newTableData);
          });
          if(isInitialData){
            if (Array.isArray(dataArray)) {
              const groupedByDate = groupByDate(dataArray);
              setInitialGroupedData(groupedByDate);
            }    
          
            setInitialData(dataArray);
            setLoadingInitialData(false);
          }else{
            if (Array.isArray(dataArray)) {
              const groupedByDate = groupByDate(dataArray);
              setSearchedGropuData(groupedByDate);
            } 
            setSearchedData(dataArray);
            setLoadingSearchData(false);
          }
       
        }
        catch (error) {
          console.log(error);
          setLoadingInitialData(false);
          setLoadingSearchData(false);
          toast.error('an error occured loading the USAHEC Facilities Usage Report');
        }}

        function groupByDate(data: TableData[]): GroupedData[] {
          const groupedData = data.reduce((acc: { [key: string]: { [key: string]: TableData[] } }, item) => {
            const date = item.start.split(" ")[0];
            const locations = item.location.split(', ');
        
            locations.forEach(location => {
              const newItem = { ...item, location };
        
              if (!acc[date]) {
                acc[date] = {};
              }
        
              if (!acc[date][location]) {
                acc[date][location] = [];
              }
        
              acc[date][location].push(newItem);
            });
        
            return acc;
          }, {});
        
          return Object.entries(groupedData).map(([day, locations]) => ({
            day,
            values: Object.entries(locations).map(([location, events]) => ({ location, events })),
          }));
        }

        const handleDownload = () => {
          const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/USAHECFacilitiesUsageReport`;
          let data: CSVData[] = [];
          if (searched && searchedData) {
            data = searchedData.map(({ title,start,end,location,actionOfficer,createdBy}) => {
              return { title,start,end,location,actionOfficer,createdBy};
            });
          }
          if(!searched && initialData){
            data = initialData.map(({ title,start,end,location,actionOfficer,createdBy}) => {
              return { title,start,end,location,actionOfficer,createdBy};
            });
          }
          if(data && data.length > 0){
            const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/USAHECFacilitiesUsageReport`;
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
                link.setAttribute("download", "USAHECFacilitiesUsageReport.csv");
                document.body.appendChild(link);
                link.click();
              });
          }
        };

        
 

    return(
        <>
        {!printFriendlyView &&  
        <>
          <Button color="orange" icon labelPosition="right" floated='right' size='tiny' 
           onClick={() => setPrintFriendlyView(true)}>
                <Icon name="print" />
                Go To Print Friendly View
              </Button>
        <Divider horizontal>
        <Header as='h2'>
        <Icon name='book'  />
           USAHEC Meeting Summary By Location
         
        </Header>
   
        </Divider>

       

        <Formik
        
initialValues={{title: '', start: new Date(), end: nextMonth, location: '', actionOfficer: '',  createdBy: ''}}
onSubmit={(values) => handleFormSubmit(values)}>
        {({handleSubmit}) => (
            <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'
                style={{ overflowX: "auto", overflowY: "hidden", minHeight: "300px" }}>
             <Table celled selectable>
                <Table.Header>
                <Table.Row>
                <Table.HeaderCell style={{ minWidth: "200px" }}>Start</Table.HeaderCell>
                <Table.HeaderCell style={{ minWidth: "200px" }}>End</Table.HeaderCell>
                <Table.HeaderCell style={{ minWidth: "200px" }}>Room</Table.HeaderCell>
                <Table.HeaderCell style={{ minWidth: "200px" }}>Meeting Title</Table.HeaderCell>
                <Table.HeaderCell style={{ minWidth: "200px" }}>Booked By</Table.HeaderCell>
                <Table.HeaderCell style={{ minWidth: "200px" }}>Action Officer</Table.HeaderCell>
                <Table.HeaderCell > 
                      <Button animated color='black' onClick={handleDownload} type='button'>
                        <Button.Content hidden>Excel</Button.Content>
                        <Button.Content visible><Icon name='file excel'/></Button.Content>
                      </Button>
                    </Table.HeaderCell>
                </Table.Row>
                <Table.Row>
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
                                .sort()}
                            />
                      </Table.HeaderCell>
                    <Table.HeaderCell>
                        <MyTextInput name='title'  placeholder="" />
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
                       <MyDataList
                             name="actionOfficer"
                             placeholder=""
                             dataListId="actionOfficers"
                             options={actionOfficers}
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
                <Table.Cell colSpan='7'>
                    <LoadingComponent content='Loading USAHEC Facilities Usage Report...'/>
                </Table.Cell>
              </Table.Row>
              }
              {!searched && !loadingInitialData && initialGroupedData.map(item => (
                <USAHECMeetingSummaryByLocationDateRow key={uuid()} item={item} /> 
              ))}
               {searched && !loadingSearchedData && searchedGroupedData.map(item => (
                  <USAHECMeetingSummaryByLocationDateRow key={uuid()} item={item} />   
              ))}
            </Table.Body>
             </Table>
         </Form>
    )}
</Formik>
</>
}
{printFriendlyView && <>
        {!searched && !loadingInitialData &&
        <>
          <Button color="teal" icon labelPosition="left" onClick={handlePrint} size='tiny'>
                <Icon name="print" />
                Print Hosting Reports Or Save Reports as PDF
              </Button>
          <Button color="orange" icon labelPosition="right"  size='tiny' floated="right" onClick={() => setPrintFriendlyView(false)} >
                <Icon name="search" />
                Back to Searchable View
              </Button>
              <Divider/>
          <USAHECMeetingSummaryByLocationComponentToPrint groupedData={initialGroupedData} ref={componentRef} />
        </>
        }
        { searched && !loadingSearchedData &&
        <>
           <Button color="teal" icon labelPosition="left" onClick={handlePrint} size='tiny'>
                <Icon name="print" />
                Print Hosting Reports Or Save Reports as PDF
              </Button>
              <Button color="orange" icon labelPosition="right"  size='tiny' floated="right"
              onClick={() => setPrintFriendlyView(false)}>
                <Icon name="search" />
                Back to Searchable View
              </Button>
              <Divider/>
          <USAHECMeetingSummaryByLocationComponentToPrint groupedData={searchedGroupedData} ref={componentRef} />
        </>
        }
      </>
      }
        </>
    )
})