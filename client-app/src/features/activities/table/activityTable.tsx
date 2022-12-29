import { observer } from "mobx-react-lite";
import InfiniteScroll from "react-infinite-scroller";
import { Button, Divider, Header, Icon, Table } from "semantic-ui-react";
import {useEffect, useState} from 'react';
import { useStore } from "../../../app/stores/store";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from 'react-router-dom'

interface TableData{
  id: string
  categoryId: string
  title: string
  start: string
  end: string
  actionOfficer: string
  leadOrg: string
  subCalander: string
  location: string
}

export default observer(function ActivityTable(){
  const [loadingNext, setLoadingNext] = useState(false)
  const [day, setDay] = useState(new Date())
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [thereIsNoMoreData, setThereIsNoMoreData] = useState(false);
  const {commonStore, activityStore} = useStore();
  const {addDays} = commonStore;
  const {getActivities} = activityStore;
  const history = useHistory();

  async function handleGetNext(){
    setLoadingNext(true);
    let combinedData : TableData[] = [];
    let theDay = day;
    const newDay = addDays(day,1);
    let counter = 0;
    while(combinedData.length < 5 && counter <= 10){
      counter = counter + 1;
      if(counter >= 10){
        setThereIsNoMoreData(true);
      }
      theDay = addDays(theDay, 1)
      setDay(theDay)
      const activities = await getActivities(theDay);
      if(activities && activities.length){
        counter = 0;
        let newTableDataArray : TableData[] = [];
        activities.forEach((activity) =>{
          if(isTheDay(activity.start, theDay))
          {
          let newTableData : TableData = {
            id: activity.id,
            categoryId: activity.categoryId,
            title: activity.title,
            start: format(activity.start, 'MM/dd h:mma' ),
            end: format(activity.end, 'MM/dd h:mma'),
            actionOfficer: activity.actionOfficer,
            leadOrg: activity.organization?.name || '',
            subCalander: activity.category.name,
            location: activity.activityRooms && activity.activityRooms.length > 0 ? activity.activityRooms.map(x => x.name).join(', ') : activity.primaryLocation
          }
          newTableDataArray.push(newTableData);
          }
        })       
        combinedData = combinedData.concat(newTableDataArray);
        setTableData([...tableData, ...combinedData]);
      }
    }
    setDay(newDay);
    setLoadingNext(false); 
  }

  const isTheDay = (activityDate : Date, theDay : Date) => {
    return activityDate.getDate() == theDay.getDate() &&
    activityDate.getMonth() == theDay.getMonth() &&
    activityDate.getFullYear() == theDay.getFullYear()
  }

  useEffect(() => {
    (async () => {
      let combinedData : TableData[] = [];
      let theDay = new Date();
      theDay = addDays(theDay, -1);
      setLoadingNext(true);
      let counter = 0;
      while(combinedData.length < 20 && counter <= 10){
      counter = counter + 1;
      if(counter >= 10){
        setThereIsNoMoreData(true);
      }
      theDay = addDays(theDay, 1)
      setDay(theDay)
      const activities = await getActivities(theDay);
      if(activities && activities.length){
        counter = 0;
        let newTableDataArray : TableData[] = [];
        activities.forEach((activity) =>{
          if(isTheDay(activity.start, theDay))
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
            location: activity.activityRooms && activity.activityRooms.length > 0 ? activity.activityRooms.map(x => x.name).join(', ') : activity.primaryLocation
          }
          newTableDataArray.push(newTableData);
          }
        })       
        combinedData = combinedData.concat(newTableDataArray);
        setTableData(combinedData);
      }
      }
      setLoadingNext(false); 
    })();
  }, []);
 

    return(
      <>
       <Divider horizontal>
       <Header as='h2'>
       <Icon name='ordered list'  />
          Event List
       </Header>
       </Divider>
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
    {tableData
    .sort((a, b) => {
      const dateA = Date.parse(a.start);
      const dateB = Date.parse(b.start);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    })
    .map(item => (
          <Table.Row key={item.title}  onClick={() => history.push(`${process.env.PUBLIC_URL}/activities/${item.id}/${item.categoryId}`)}>
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