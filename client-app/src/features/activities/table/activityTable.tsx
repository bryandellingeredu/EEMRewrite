import { observer } from "mobx-react-lite";
import InfiniteScroll from "react-infinite-scroller";
import { Button, Divider, Grid, Header, Icon, Table } from "semantic-ui-react";
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

interface TableData{
  id: string
  categoryId: string
  title: string
  start: string
  end: string
  startAsDate: Date
  endAsDate: Date
  actionOfficer: string
  leadOrg: string
  subCalander: string
  location: string
}


export default observer(function ActivityTable(){
  const [loadingNext, setLoadingNext] = useState(false)
  const [searchedClicked, setSearchClicked] = useState(false)
  const [day, setDay] = useState(new Date())
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [searchedTableData, setSearchedTableData] = useState<TableData[]>([]);
  const [thereIsNoMoreData, setThereIsNoMoreData] = useState(false);
  const {commonStore, activityStore, categoryStore} = useStore();
  const {addDays} = commonStore;
  const {getActivities, getActivitiesBySearchParams} = activityStore;
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  const { categoryOptions, loadCategories } = categoryStore;

  
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
            start: activity.allDayEvent ?  format(activity.start, 'MM/dd' ) : format(activity.start, 'MM/dd h:mma' ),
            end: activity.allDayEvent ?  format(activity.end, 'MM/dd' ) : format(activity.end, 'MM/dd h:mma' ),
            actionOfficer: activity.actionOfficer,
            leadOrg: activity.organization?.name || '',
            subCalander: activity.category.name,
            location: activity.activityRooms && activity.activityRooms.length > 0 ? activity.activityRooms.map(x => x.name).join(', ') : activity.primaryLocation,
            startAsDate: activity.start,
            endAsDate: activity.end
          }
          newTableDataArray.push(newTableData);
          }
        })       
        combinedData = combinedData.concat(newTableDataArray);
        setTableData([...tableData, ...combinedData]);
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
    if(!categoryOptions){
      loadCategories();
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
          start: activity.allDayEvent ?  format(activity.start, 'MM/dd' ) : format(activity.start, 'MM/dd h:mma' ),
          end: activity.allDayEvent ?  format(activity.end, 'MM/dd' ) : format(activity.end, 'MM/dd h:mma' ),
          actionOfficer: activity.actionOfficer,
          leadOrg: activity.organization?.name || '',
          subCalander: activity.category.name,
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
      setSearchedTableData(searchedTableDataArray);
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
         initialValues={{title: '', start: new Date(), end: null, categoryIds: []}}
         onSubmit={(values) => handleFormSubmit(values)}
       >
      {({handleSubmit}) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                    <Grid verticalAlign='middle'>
                      <Grid.Row>
                  
                        <Grid.Column width={3}>
                        <MyTextInput name='title'  placeholder="search by title" />
                       </Grid.Column>
                       <Grid.Column width={3}>
                       <MyDateInput
                           isClearable
                           placeholderText="event starts after"
                           name="start"
                           dateFormat="MMMM d, yyyy"
                        />
                       </Grid.Column>
                       <Grid.Column width={3}>
                       <MyDateInput
                           isClearable
                           placeholderText="event ends before"
                           name="end"
                           dateFormat="MMMM d, yyyy"
                        />
                       </Grid.Column>
                       <Grid.Column width={5}>
                       <MyMultiSelectInput
                          options = {categoryOptions.map((option: any) => {
                            return {label: option.text , value: option.value , disabled: false}
                          })}
                           placeholder="search categories, may select multiple"
                           name="categoryIds"
                        />
                       </Grid.Column>
                       <Grid.Column width={2}>
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
                       </Button.Group>
                       </Grid.Column>
                    </Grid.Row>
                  </Grid>                                  
                </Form>
            )}
       </Formik>
       <Divider />
       </>

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
        <Table.HeaderCell>Start</Table.HeaderCell>
        <Table.HeaderCell>End</Table.HeaderCell>
        <Table.HeaderCell>Location</Table.HeaderCell>
        <Table.HeaderCell>Action Officer</Table.HeaderCell>
        <Table.HeaderCell>Lead Org</Table.HeaderCell>
        <Table.HeaderCell>Sub Calendar</Table.HeaderCell>
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
               <Table.Cell>{item.title}</Table.Cell>
               <Table.Cell>{item.start}</Table.Cell>
               <Table.Cell>{item.end}</Table.Cell>
               <Table.Cell>{item.location}</Table.Cell>
               <Table.Cell>{item.actionOfficer}</Table.Cell>
               <Table.Cell>{item.leadOrg}</Table.Cell>
               <Table.Cell>{item.subCalander}</Table.Cell>
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
               <Table.Cell>{item.title}</Table.Cell>
               <Table.Cell>{item.start}</Table.Cell>
               <Table.Cell>{item.end}</Table.Cell>
               <Table.Cell>{item.location}</Table.Cell>
               <Table.Cell>{item.actionOfficer}</Table.Cell>
               <Table.Cell>{item.leadOrg}</Table.Cell>
               <Table.Cell>{item.subCalander}</Table.Cell>
          </Table.Row>
        ))}
    </Table.Body>

    <Table.Footer>
      <Table.Row>
        <Table.HeaderCell colSpan='7'>
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
  </>
    )
})