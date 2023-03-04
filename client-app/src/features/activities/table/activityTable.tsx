import { observer } from "mobx-react-lite";
import InfiniteScroll from "react-infinite-scroller";
import { Button, Divider, Grid, Header, Icon, Popup, Table } from "semantic-ui-react";
import {useEffect, useState} from 'react';
import { useStore } from "../../../app/stores/store";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from 'react-router-dom'
import { Form, Formik } from "formik";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyDateInput from "../../../app/common/form/MyDateInput";
import MyMultiSelectInput from "../../../app/common/form/MyMultiSelectInput";
import { SearchFormValues } from "../../../app/models/searchFormValues";
import { v4 as uuid } from "uuid";
import MyDataList from "../../../app/common/form/MyDataList";
import agent from "../../../app/api/agent";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { CSVData } from "../../../app/models/csvData";

interface TableData{
  id: string
  categoryId: string
  title: string
  description: string
  start: string
  end: string
  startAsDate: Date
  endAsDate: Date
  actionOfficer: string
  leadOrg: string
  subCalendar: string
  location: string
}


export default observer(function ActivityTable(){
  const [loadingNext, setLoadingNext] = useState(false)
  const [searchedClicked, setSearchClicked] = useState(false)
  const [day, setDay] = useState(new Date())
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [searchedTableData, setSearchedTableData] = useState<TableData[]>([]);
  const [thereIsNoMoreData, setThereIsNoMoreData] = useState(false);
  const {commonStore, activityStore, categoryStore, graphRoomStore, organizationStore} = useStore();
  const {organizations, loadOrganizations, organizationOptions} = organizationStore;
  const {addDays} = commonStore;
  const {getActivities, getActivitiesBySearchParams} = activityStore;
  const {graphRooms, loadGraphRooms} = graphRoomStore
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  const { categoryOptions, loadCategories } = categoryStore;
  const [primaryLocations, setPrimaryLocations] = useState<string[]>([]);
  const [actionOfficers, setActionOfficers] = useState<string[]>([]);



  const handleDownload = () => {
    const url = `${process.env.REACT_APP_API_URL}/ExportToExcel/Csv`;
    let data: CSVData[] = [];
    if (searchedClicked && searchedTableData) {
      data = searchedTableData.map(({ start, end, title, description, location, actionOfficer,leadOrg, subCalendar }) => {
        return { start, end, title, description, location, actionOfficer, leadOrg, subCalendar};
      });
    }
    if(!searchedClicked && tableData){
      data = tableData.map(({ start, end, title, description, location, actionOfficer,leadOrg, subCalendar }) => {
        return { start, end, title, description, location, actionOfficer, leadOrg, subCalendar};
      });
    }
    if(data && data.length > 0){
      const url = `${process.env.REACT_APP_API_URL}/ExportToExcel`;
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
          link.setAttribute("download", "eemevents.csv");
          document.body.appendChild(link);
          link.click();
        });
    }
  };


  
  async function loadData(d : Date, numOfRecords: number){
    setLoadingNext(true);
    let combinedData : TableData[] = [];
    let counter = 0;
    while(combinedData.length < numOfRecords && counter <= 10){
      counter = counter + 1;
      if(counter >= 10){
        setThereIsNoMoreData(true);
      }
      d = addDays(d, 1)
      setDay(d)
      const activities = await getActivities(d);
      if(activities && activities.length){
        counter = 0;
        let newTableDataArray : TableData[] = [];
        activities.forEach((activity) =>{
          if(isTheDay(activity.start, d))
          {
          let newTableData : TableData = {
            id: activity.id,
            categoryId: activity.categoryId,
            title: activity.title,
            description: activity.description,
            start: activity.allDayEvent ?  format(activity.start, 'MM/dd' ) : format(activity.start, 'MM/dd h:mma' ),
            end: activity.allDayEvent ?  format(activity.end, 'MM/dd' ) : format(activity.end, 'MM/dd h:mma' ),
            actionOfficer: activity.actionOfficer,
            leadOrg: activity.organization?.name || '',
            subCalendar: activity.category.name,
            location: activity.activityRooms && activity.activityRooms.length > 0 ? activity.activityRooms.map(x => x.name).join(', ') : activity.primaryLocation,
            startAsDate: activity.start,
            endAsDate: activity.end
          }
          newTableDataArray.push(newTableData);
          }
        })       
        combinedData = combinedData.concat(newTableDataArray);
        
        setTableData([...tableData, ...Array.from(new Set(combinedData))]); 
        
      }
    }
    setLoadingNext(false); 
  }

  async function handleGetNext(){
    await loadData(day, 5)
  }

  const isTheDay = (activityDate : Date, theDay : Date) => {
    return activityDate.getDate() === theDay.getDate() &&
    activityDate.getMonth() === theDay.getMonth() &&
    activityDate.getFullYear() === theDay.getFullYear()
  }

  useEffect(() => {
    agent.Activities.getLocations().then(response => setPrimaryLocations(response));
    agent.Activities.getActionOfficers().then(response => setActionOfficers(response));
    if(!categoryOptions){
      loadCategories();
    } 
    if(!graphRooms){
      loadGraphRooms();
    }
    if(!organizations || organizations.length < 1){
      loadOrganizations();
    }
    (async () => {
      await loadData(addDays(new Date(), -1), 10)
    })();
  }, []);
 
  function handleFormSubmit(values : SearchFormValues ) {
    setSearchClicked(true);
    setSubmitting(true);
    setSearchedTableData([]);
    setThereIsNoMoreData(true);
    setDay(new Date());
    getActivitiesBySearchParams(values).then((activities) =>{
      let searchedTableDataArray : TableData[] = [];
      activities!.forEach((activity) =>{
        let newTableData : TableData = {
          id: activity.id,
          categoryId: activity.categoryId,
          title: activity.title,
          description: activity.description,
          start: activity.allDayEvent ?  format(activity.start, 'MM/dd' ) : format(activity.start, 'MM/dd h:mma' ),
          end: activity.allDayEvent ?  format(activity.end, 'MM/dd' ) : format(activity.end, 'MM/dd h:mma' ),
          actionOfficer: activity.actionOfficer,
          leadOrg: activity.organization?.name || '',
          subCalendar: activity.category.name,
          location: activity.activityRooms && activity.activityRooms.length > 0 ? activity.activityRooms.map(x => x.name).join(', ') : activity.primaryLocation,
          startAsDate: activity.start,
          endAsDate: activity.end
        }
        let dateIsOk = true
        if(values.start){
          const start = values.start
          start.setHours(0,0,0,0);
          if(newTableData.startAsDate < start ){
            dateIsOk = false;
          }
         console.log('values.start: ' + values.start + ' startAsDate: ' + newTableData.startAsDate + ' ' + dateIsOk);
        }
         if(values.end){
          const end = values.end
          end.setHours(23,59,59,999);
          if(newTableData.endAsDate > end){
            dateIsOk = false;
          }
        } 
        if(dateIsOk ){
          searchedTableDataArray.push(newTableData);
        }
      })
      setSearchedTableData(Array.from(new Set(searchedTableDataArray)));


      setSubmitting(false);
    })
  }
 

    return(
      <>
       <Divider horizontal>
       <Header as='h2'>
       <Icon name='ordered list'  />
          Event List
       </Header>
       </Divider>

    <>

       <Formik
         initialValues={{title: '', start: new Date(), end: null, categoryIds: [], location: '', actionOfficer: '', organizationId: '', description: ''}}
         onSubmit={(values) => handleFormSubmit(values)}
       >
      {({handleSubmit}) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                  <InfiniteScroll
      pageStart={0}
      loadMore={handleGetNext}
      hasMore={!loadingNext && !thereIsNoMoreData}
      initialLoad={false}
      isReverse={false}
      >
        <Table celled selectable>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Title</Table.HeaderCell>
        <Table.HeaderCell>Description</Table.HeaderCell>
        <Table.HeaderCell>Start</Table.HeaderCell>
        <Table.HeaderCell>End</Table.HeaderCell>
        <Table.HeaderCell>Location</Table.HeaderCell>
        <Table.HeaderCell>Action Officer</Table.HeaderCell>
        <Table.HeaderCell>Lead Org</Table.HeaderCell>
        <Table.HeaderCell>Sub Calendar</Table.HeaderCell>
        <Table.HeaderCell></Table.HeaderCell>
      </Table.Row>
      <Table.Row>
      <Table.HeaderCell>  <MyTextInput name='title'  placeholder="" /></Table.HeaderCell>
      <Table.HeaderCell>  <MyTextInput name='title'  placeholder="" /></Table.HeaderCell>
        <Table.HeaderCell>   <MyDateInput
                           isClearable
                           placeholderText="event starts after"
                           name="start"
                           dateFormat="MMMM d, yyyy"
                        /></Table.HeaderCell>
        <Table.HeaderCell>  <MyDateInput
                           isClearable
                           placeholderText="event ends before"
                           name="end"
                           dateFormat="MMMM d, yyyy"
                        /></Table.HeaderCell>
        <Table.HeaderCell>  <MyDataList
                              name="location"
                              placeholder=""
                              dataListId="locations"
                              options={graphRooms.map(x => x.displayName)
                                .concat(primaryLocations)
                                .sort()
                                .filter((value, index, self) => self.indexOf(value) === index)}
                            /></Table.HeaderCell>
        <Table.HeaderCell><MyDataList
                              name="actionOfficer"
                              placeholder=""
                              dataListId="actionOfficers"
                              options={actionOfficers}
                            /></Table.HeaderCell>
        <Table.HeaderCell>      <MySelectInput
                options={organizationOptions}
                placeholder=""
                name="organizationId"
              /></Table.HeaderCell>
        <Table.HeaderCell>        <MyMultiSelectInput
                          options = {categoryOptions.map((option: any) => {
                            return {label: option.text , value: option.value , disabled: false}
                          })}
                           placeholder=""
                           name="categoryIds"
                        /></Table.HeaderCell>
         <Table.HeaderCell>
         <Button.Group>
                       <Button icon loading={submitting} color='violet' size='medium' type='submit' >
                        <Icon name='search'/>
                       </Button>
                       <Button
                icon
                color='red'
                size='medium'
                type='button'
                onClick={() => window.location.reload()}
              >
                <Icon name='x'/>
              </Button>
              <Button icon color='black' onClick={handleDownload}><Icon name='file excel'/></Button>
              </Button.Group>
         </Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
    {searchedClicked && searchedTableData
    .sort((a, b) => { 
      if (a.startAsDate < b.startAsDate) return -1;
      if (a.startAsDate > b.startAsDate) return 1;
      return 0;
    })
    .map(item => (
          <Table.Row key={uuid()}  onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.id}/${item.categoryId}`)}>
                 <Table.Cell>
               {item.title.length > 50 &&
                  <Popup content={item.title} trigger={ <span>{`${item.title.substring(0, 50)}...`}</span>}  flowing hoverable />              
                }
                {item.title.length <= 50 &&
                  item.title
                }
                </Table.Cell>
               <Table.Cell>
               {item.description.length > 50 &&
                  <Popup content={item.description} trigger={ <span>{`${item.description.substring(0, 50)}...`}</span>}  flowing hoverable />              
                }
                {item.description.length <= 50 &&
                  item.description
                }
                </Table.Cell>
               <Table.Cell>{item.start}</Table.Cell>
               <Table.Cell>{item.end}</Table.Cell>
               <Table.Cell>{item.location}</Table.Cell>
               <Table.Cell>{item.actionOfficer}</Table.Cell>
               <Table.Cell>{item.leadOrg}</Table.Cell>
               <Table.Cell>{item.subCalendar}</Table.Cell>
               <Table.Cell></Table.Cell>
          </Table.Row>
        ))}
    {!searchedClicked && tableData
    .sort((a, b) => { 
      if (a.startAsDate < b.startAsDate) return -1;
      if (a.startAsDate > b.startAsDate) return 1;
      return 0;
    })
    .map(item => (
          <Table.Row key={uuid()}  onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.id}/${item.categoryId}`)}>
                    <Table.Cell>
               {item.title.length > 50 &&
                  <Popup content={item.title} trigger={ <span>{`${item.title.substring(0, 50)}...`}</span>}  flowing hoverable />              
                }
                {item.title.length <= 50 &&
                  item.title
                }
                </Table.Cell>
                <Table.Cell>
                
                {item.description.length > 50 &&
                  <Popup content={item.description} trigger={ <span>{`${item.description.substring(0, 50)}...`}</span>}  flowing hoverable />              
                }
                {item.description.length <= 50 &&
                  item.description
                }
                
                </Table.Cell> 
               <Table.Cell>{item.start}</Table.Cell>
               <Table.Cell>{item.end}</Table.Cell>
               <Table.Cell>{item.location}</Table.Cell>
               <Table.Cell>{item.actionOfficer}</Table.Cell>
               <Table.Cell>{item.leadOrg}</Table.Cell>
               <Table.Cell>{item.subCalendar}</Table.Cell>
               <Table.Cell></Table.Cell>
          </Table.Row>
        ))}
    </Table.Body>

    <Table.Footer>
      <Table.Row>
        <Table.HeaderCell colSpan='9'>
          {!loadingNext && !thereIsNoMoreData &&
         <Button primary type="button" floated="right" onClick={handleGetNext} loading={loadingNext} >Load More Events</Button>
          }
          {loadingNext && !thereIsNoMoreData &&
         <Button primary type="button" floated="right" disabled >
          <FontAwesomeIcon icon={faSpinner} spin  style={{marginRight: '5px'}}/>
          Loading  Events
          </Button>
          }
        </Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  </Table>
  </InfiniteScroll>


                </Form>
            )}
       </Formik>
       <Divider />
       </>

   
  </>
    )
})