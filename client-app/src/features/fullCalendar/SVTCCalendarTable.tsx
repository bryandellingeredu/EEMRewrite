import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import {useEffect, useState} from 'react';
import { format } from "date-fns";
import { Button, Icon, Table } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { v4 as uuid } from "uuid";
import SVTCCalendarTableRow from "./SVTCCalendarTableRow";
import MyTextInput from "../../app/common/form/MyTextInput";
import MyDateInput from "../../app/common/form/MyDateInput";
import MySelectInput from "../../app/common/form/MySelectInput";

interface SearchFormValues{
    title: string
    start : Date | null | string
    end : Date | null | string
    location: string
    actionOfficer: string
    vtcClassification: string
    distantTechPhoneNumber: string
    requestorPOCContactInfo: string
    dialInNumber: string
    siteIDDistantEnd: string
    gosesInAttendance :	string
    seniorAttendeeNameRank: string
    additionalVTCInfo: string
    vtcStatus: string
  }

  interface TableData{
    id: string
    categoryId: string
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    vtcClassification: string
    distantTechPhoneNumber: string
    requestorPOCContactInfo: string
    dialInNumber: string
    siteIDDistantEnd: string
    gosesInAttendance :	string
    seniorAttendeeNameRank: string
    additionalVTCInfo: string
    vtcStatus: string
  }

  interface CSVData{
    title: string
    start : string
    end : string
    location: string
    actionOfficer: string
    vtcClassification: string
    distantTechPhoneNumber: string
    requestorPOCContactInfo: string
    dialInNumber: string
    siteIDDistantEnd: string
    gosesInAttendance :	string
    seniorAttendeeNameRank: string
    additionalVTCInfo: string
    vtcStatus: string
  }

export default function SVTCCalendarTable(){

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
                vtcClassification: '',
                distantTechPhoneNumber: '',
                requestorPOCContactInfo: '',
                dialInNumber: '',
                siteIDDistantEnd: '',
                gosesInAttendance :	'',
                seniorAttendeeNameRank: '',
                additionalVTCInfo: '',
                vtcStatus: ''
              }
            )
          })();
    }, []);

    function handleFormSubmit(values : SearchFormValues ) {
        const data = {...values,
            start: values.start ? format(new Date(values.start), 'MM-dd-yyyy') : '',
           end:  values.end ?   format(new Date(values.end), 'MM-dd-yyyy') : ''};
         
         (async () => {
          debugger;
           await loadData(data);
         })();
      }

      async function loadData(data : SearchFormValues){
        try{
            setLoading(true);
            const response = await agent.Activities.listSVTCBySearchParams(data);
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
                  vtcClassification: item.vtcClassification,
                  distantTechPhoneNumber: item.distantTechPhoneNumber,
                  requestorPOCContactInfo: item.requestorPOCContactInfo,
                  dialInNumber: item.dialInNumber,
                  siteIDDistantEnd: item.siteIDDistantEnd,
                  gosesInAttendance : item.gosesInAttendance ? 'yes' : 'no',
                  seniorAttendeeNameRank: item.seniorAttendeeNameRank,
                  additionalVTCInfo: item.additionalVTCInfo, 
                  vtcStatus: item.vtcStatus || 'Tentative'       
                }
                dataArray.push(newTableData);
              });
              setTableData(dataArray);
              setLoading(false);
        }
        catch (error) {
            debugger;
            console.log(error);
            toast.error('an error occured loading svtc data');
            setLoading(false);
          }
      }


      const handleDownload = () => {
        let data: CSVData[] = [];

          data = tableData.map((
            { title,start,end,location,actionOfficer,   vtcClassification,
            distantTechPhoneNumber,
            requestorPOCContactInfo,
            dialInNumber,
            siteIDDistantEnd,
            gosesInAttendance,
            seniorAttendeeNameRank,
            additionalVTCInfo,
            vtcStatus }) => {
            return { title,start,end,location,actionOfficer,
              vtcClassification,
                distantTechPhoneNumber,
                requestorPOCContactInfo,
                dialInNumber,
                siteIDDistantEnd,
                gosesInAttendance,
                seniorAttendeeNameRank,
                additionalVTCInfo,
                vtcStatus};
          });
        
  
        if(data && data.length > 0){
          const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/SVTCReport`;
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
              link.setAttribute("download", "SVTCReport.csv");
              document.body.appendChild(link);
              link.click();
            });
        }
      };
        


    return(
        <Formik
        initialValues={{title: '', start: new Date(), end: null, location: '',
         actionOfficer: '', vtcClassification: '',  distantTechPhoneNumber: '',
         requestorPOCContactInfo: '', dialInNumber: '', siteIDDistantEnd: '', gosesInAttendance: '',
         seniorAttendeeNameRank: '', additionalVTCInfo: '', vtcStatus: ''}}
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
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Action Officer</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>SVTC Classification</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Distant Tech Phone</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Requestor POC</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Dial In Number</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Site ID Distant End</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>Is SES in Attendance</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>SES Name / Rank</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>SVTC Info</Table.HeaderCell>
                    <Table.HeaderCell style={{ minWidth: "100px" }}>SVTC Status</Table.HeaderCell>
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
                <Table.HeaderCell>
                <MySelectInput
                          options={[
                            { text: "", value: "" },
                            { text: "UNCLASS ISDN", value: "UNCLASS ISDN" },
                            { text: "UNCLASS IP", value: "UNCLASS IP" },
                            { text: "SECRET IP", value: "SECRET IP" },
                            {
                              text: "Audio Call Only",
                              value: "Audio Call Only",
                            },
                          ]}
                          name="vtcClassification"
                          placeholder=""
                        />
                </Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='distantTechPhoneNumber'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='requestorPOCContactInfo'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='dialInNumber'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='siteIDDistantEnd'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell>
                <MySelectInput
                          options={[
                            { text: "", value: "" },
                            { text: "Yes", value: "Yes" },
                            { text: "No", value: "No" },
                          ]}
                          name="gosesInAttendance"
                          placeholder=""
                        />
                </Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='seniorAttendeeNameRank'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell><MyTextInput name='additionalVTCInfo'  placeholder="" /></Table.HeaderCell>
                <Table.HeaderCell>
                <MySelectInput
                          options={[
                            { text: "", value: "" },
                            { text: "Tentative", value: "Tentative" },
                            { text: "Confirmed", value: "Confirmed" },
                            { text: "Cancelled", value: "Cancelled" },
                          ]}
                          name="vtcStatus"
                          placeholder=""
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
                <Table.Row colSpan = '15'>
                    <LoadingComponent content='Loading SVTC data...'/>
                </Table.Row>
            }
            {!loading && tableData.map(item => (
              <SVTCCalendarTableRow key={uuid()} item={item} /> 

         ))}
            </Table.Body>
        </Table>

        </Form>
        )}
</Formik>
    )
}