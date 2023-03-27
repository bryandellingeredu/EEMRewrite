import { observer } from "mobx-react-lite";
import {useEffect, useState} from 'react';
import { useStore } from "../../app/stores/store";
import { format } from "date-fns";
import { Form, Formik } from 'formik';
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, Icon, Table } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import MyDateInput from "../../app/common/form/MyDateInput";
import MyDataList from "../../app/common/form/MyDataList";
import agent from "../../app/api/agent";
import MySelectInput from "../../app/common/form/MySelectInput";
import { toast } from "react-toastify";
import GenericCalendarTableRow from "./GenericCalendarTableRow";
import { v4 as uuid } from "uuid";

interface Props {
    id: string
}

interface SearchFormValues{
    title: string
    start : Date | null
    end : Date | null
    location: string
    actionOfficer: string
    organizationId: string
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
  }

  interface CSVData{
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    organizationName: string
  }


export default observer(function GenericCalendarTable({id} : Props){
    const {graphRoomStore, organizationStore } = useStore();
    const {graphRooms, loadGraphRooms} = graphRoomStore;
    const [primaryLocations, setPrimaryLocations] = useState<string[]>([]);
    const [actionOfficers, setActionOfficers] = useState<string[]>([]);
    const {organizations, loadOrganizations, organizationOptions} = organizationStore;
    const [submitting, setSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<TableData[]>([]);
    const [loadingInitialData, setLoadingInitialData] = useState(true);

    useEffect(() => {
        agent.Activities.getLocations().then(response => setPrimaryLocations(response));
        agent.Activities.getActionOfficers().then(response => setActionOfficers(response));  
        if(!graphRooms) loadGraphRooms(); 
        if(!organizations || organizations.length < 1) loadOrganizations();      
               
        (async () => {
          await loadData(
            {
              title: '', start: format(new Date(), 'MM-dd-yyy'), end: '', loaction: '',actionOfficer: ''
            }
          )
        })();
      }, []);

      async function loadData(data : any){
        try{
            setLoadingInitialData(true)
            const response = await agent.Calendars.listBySearchParams(data,id);
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
                location: item.location,
              }
              dataArray.push(newTableData);
            });
            setInitialData(dataArray);
            setLoadingInitialData(false);
       
        }
        catch (error) {
          console.log(error);
          setLoadingInitialData(false);
          toast.error('an error occured loading calendar data');
        }}



    function handleFormSubmit(values : SearchFormValues ) {
        setSubmitting(true);
        const data = {...values, start: values.start ?   format(new Date(values.start), 'MM-dd-yyyy') : '',  end:  values.end ?   format(new Date(values.end), 'MM-dd-yyyy') : ''};
        (async () => {
            await loadData(data);
            setSubmitting(false);
          })();
      }

      const handleDownload = () => {
        const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/GenericCalendar`;
        let data: CSVData[] = [];
        if (initialData) {
          data = initialData.map(({ title,start,end,location,actionOfficer,organizationName}) => {
            return { title,start,end,location,actionOfficer,organizationName};
          });
        }
    
        if(data && data.length > 0){
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
              link.setAttribute("download", "calendar.csv");
              document.body.appendChild(link);
              link.click();
            });
        }
      };

    return(
        <Formik
initialValues={{title: '', start: new Date(), end: null, location: '',
 actionOfficer: '', organizationId: ''}}
onSubmit={(values) => handleFormSubmit(values)}>
          {({handleSubmit}) => (
      <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
        <Table celled selectable>
            <Table.Header>
            <Table.Row>
            <Table.HeaderCell style={{ minWidth: "200px" }}>Title</Table.HeaderCell>
            <Table.HeaderCell style={{ minWidth: "165px" }}>Start</Table.HeaderCell>
             <Table.HeaderCell style={{ minWidth: "165px" }} >End</Table.HeaderCell>
             <Table.HeaderCell style={{ minWidth: "175x" }}>Location</Table.HeaderCell>
             <Table.HeaderCell style={{ maxWidth: "50px" }}>Action Officer</Table.HeaderCell>
            <Table.HeaderCell style={{ minWidth: "50px" }}>Lead Org</Table.HeaderCell>
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
                       <MyDataList
                             name="actionOfficer"
                             placeholder=""
                             dataListId="actionOfficers"
                             options={actionOfficers}
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
     
     <Button animated  loading={submitting} color='violet'  type='submit' >
         <Button.Content hidden>Search</Button.Content>
         <Button.Content visible><Icon name='search'/></Button.Content>
       </Button>
  
             </Table.HeaderCell>
                    
            </Table.Row>
            </Table.Header>
            <Table.Body>
            {loadingInitialData  &&
              <Table.Row>
                <Table.Cell colSpan='11'>
                    <LoadingComponent content='Loading Calendar Data...'/>
                </Table.Cell>
              </Table.Row>
              }
               {!loadingInitialData && initialData.map(item => (
                <GenericCalendarTableRow key={uuid()} item={item} /> 
              ))}
            </Table.Body>
        </Table>
        </Form>
        )}
    </Formik>
    )
})