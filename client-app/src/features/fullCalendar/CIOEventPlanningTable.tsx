import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import {useEffect, useState} from 'react';
import { format } from "date-fns";
import { Button, Icon, Table } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { v4 as uuid } from "uuid";
import MyTextInput from "../../app/common/form/MyTextInput";
import MyDateInput from "../../app/common/form/MyDateInput";
import MySelectInput from "../../app/common/form/MySelectInput";
import CIOEventPlanningTableRow from "./CIOEventPlanningTableRow";
import MyDataList from "../../app/common/form/MyDataList";

interface SearchFormValues{
    title: string
    start : Date | null | string
    end : Date | null | string
    location: string
    actionOfficer: string
    eventPlanningExternalEventPOCName: string
    eventPlanningExternalEventPOCEmail: string
    eventPlanningStatus: string
    eventPlanningPAX: string
    eventPlanningSetUpDate: Date | null | string
    eventClearanceLevel: string
  }

  interface TableData{
    id: string
    categoryId: string
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    eventPlanningExternalEventPOCName: string
    eventPlanningExternalEventPOCEmail: string
    eventPlanningStatus: string
    eventPlanningPAX: string
    eventPlanningSetUpDate: string
    eventClearanceLevel: string
  }

  interface CSVData{
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    eventPlanningExternalEventPOCName: string
    eventPlanningExternalEventPOCEmail: string
    eventPlanningStatus: string
    eventPlanningPAX: string  
    eventPlanningSetUpDate: string
    eventClearanceLevel: string
  }

export default function CIOEventPlanningTable(){
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            await loadData(
              {
                title: '',
                start: format(new Date(), 'MM-dd-yyy'),
                end: '',
                location: '',
                actionOfficer: '',
                eventPlanningExternalEventPOCName: '',
                eventPlanningExternalEventPOCEmail: '',
                eventPlanningStatus: '',
                eventPlanningPAX: '',
                eventPlanningSetUpDate: '',
                eventClearanceLevel: '',
              }
            )
          })();
    }, []);

    async function loadData(data : SearchFormValues){
        try{
            setLoading(true);
            const response = await agent.Activities.listCIOEventPlanningBySearchParams(data);
            let dataArray : TableData[] = [];
            response!.forEach((item: any) =>{
                let newTableData : TableData = {
                  id: item.id,
                  categoryId: item.categoryId,
                  title: item.title,
                  start: item.allDayEvent ?  format(new Date(item.start), 'MM/dd' ) : format(new Date(item.start), 'MM/dd h:mma' ),
                  end: item.allDayEvent ?  format(new Date(item.end), 'MM/dd' ) : format(new Date(item.end), 'MM/dd h:mma' ),
                  actionOfficer: item.actionOfficer,
                  location: item.primaryLocation,
                  eventPlanningExternalEventPOCName: item.eventPlanningExternalEventPOCName,
                  eventPlanningExternalEventPOCEmail: item.eventPlanningExternalEventPOCEmail,
                  eventPlanningStatus: item.eventPlanningStatus || 'Pending',
                  eventPlanningPAX: item.eventPlanningPAX,
                  eventPlanningSetUpDate: item.eventPlanningSetUpDate ? format(new Date(item.eventPlanningSetUpDate), 'MM/dd h:mma' ) : '', 
                  eventClearanceLevel: item.eventClearanceLevel || 'Undetermined'                
                }
                dataArray.push(newTableData);
              });
              setTableData(dataArray);
              setLoading(false);
        }
        catch (error) {
            console.log(error);
            toast.error('an error occured loading data');
            setLoading(false);
          }
      }

      const handleDownload = () => {
        let data: CSVData[] = [];

          data = tableData.map((
            { title,start,end,location,actionOfficer, 
              eventPlanningExternalEventPOCName,
              eventPlanningExternalEventPOCEmail,
              eventPlanningStatus,
              eventPlanningPAX,
              eventPlanningSetUpDate,
              eventClearanceLevel
           }) => {
            return { title,start,end,location,actionOfficer,
              eventPlanningExternalEventPOCName,
              eventPlanningExternalEventPOCEmail,
              eventPlanningStatus,
              eventPlanningPAX,
              eventPlanningSetUpDate,
              eventClearanceLevel};
          });
        
  
        if(data && data.length > 0){
          const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/CIOEventPlanningReport`;
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
              link.setAttribute("download", "CIOEventPlanningReport.csv");
              document.body.appendChild(link);
              link.click();
            });
        }
      };
        

      function handleFormSubmit(values : SearchFormValues ) {
        const data = {...values,
            start: values.start ? format(new Date(values.start), 'MM-dd-yyyy') : '',
           end:  values.end ?   format(new Date(values.end), 'MM-dd-yyyy') : ''};
         
         (async () => {
           await loadData(data);
         })();
      }

      return(
      <Formik
      initialValues={{title: '', start: new Date(), end: null, location: '',
      actionOfficer: '',eventPlanningExternalEventPOCName: '',
      eventPlanningExternalEventPOCEmail: '',
      eventPlanningStatus: '',
      eventPlanningPAX: '',
      eventPlanningSetUpDate: null,
      eventClearanceLevel: ''}}
      onSubmit={(values) => handleFormSubmit(values)}>
         {({handleSubmit}) => (
              <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'
              style={{ overflowX: "auto", overflowY: "hidden", fontSize: '0.9em',  }}>

          <Table celled selectable style={{zIndex: '1000'}}>
            <Table.Header>
                <Table.Row>
                <Table.HeaderCell style={{ minWidth: "200px" }}>Title</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "165px" }}>Start</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "165px" }} >End</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "175x" }}>Location</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Action Officer</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>POC Name</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>POC Email</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Status</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>PAX</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "165px" }}>Set Up</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Clearance</Table.HeaderCell>
                    <Table.HeaderCell > 
                      <Button animated color='black' onClick={handleDownload} >
                        <Button.Content hidden>Excel</Button.Content>
                        <Button.Content visible><Icon name='file excel'/></Button.Content>
                      </Button>
              </Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                <Table.HeaderCell><MyTextInput name='title'  placeholder="" /></Table.HeaderCell>
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
                <Table.HeaderCell><MyTextInput name='location'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='actionOfficer'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='eventPlanningExternalEventPOCName'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='eventPlanningExternalEventPOCEmail'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell>
                <MyDataList
                          options={[
                         "Pending", "Ready", "Closed"
                          ]}
                          name="eventPlanningStatus"
                          placeholder=""
                          dataListId="eeventPlanningStatus"
                        />
                </Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='eventPlanningPAX'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell>
                <MyDateInput
            isClearable
            placeholderText="set up starts after"
            name="eventPlanningSetUpDate"
            dateFormat="MMMM d, yyyy" />
                </Table.HeaderCell>
                <Table.HeaderCell>
                <MyDataList
                          options={[
                           "Undetermined",
                         "Unclassified",
                         "Secret", 
                         "Top Secret", 
                          "TS-SCI",
                          ]}
                          name="eventClearanceLevel"
                          placeholder=""
                          dataListId="eventClearanceLevel"
                        />
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
                <Table.Row colSpan = '12'>
                    <LoadingComponent content='Loading data...'/>
                </Table.Row>
            }
             {!loading && tableData.map(item => (
              <CIOEventPlanningTableRow key={uuid()} item={item} /> 
             ))}
            </Table.Body>
          </Table>

        </Form>
          )}
    </Formik>
   )
}