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
import LoadingComponent from "../../../app/layout/LoadingComponent";

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    history.push(`${process.env.PUBLIC_URL}/internationfellowscalendar`)
  }, []);


    return(
     <LoadingComponent />
    )
})