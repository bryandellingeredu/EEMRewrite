
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import HomePage from '../../features/home/HomePage';
import {  Route,  Switch, useLocation } from 'react-router-dom';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetail';
import AcademicCalendarDashboard from '../../features/fullCalendar/AcademicCalendarDashboard';
import NotFound from '../../features/errors/NotFound';
import ServerError from '../../features/errors/ServerError';
import { ToastContainer } from 'react-toastify';
import GenericCalendar from '../../features/fullCalendar/GenericCalendar';
import RoomDashboard from '../../features/rooms/RoomDashboard';
import ModalContainer from '../common/modals/ModalContainer';
import { useStore } from '../stores/store';
import { useEffect } from 'react';
import LoadingComponent from './LoadingComponent';
import RegisterSuccess from '../../features/users/RegisterSuccess';
import ConfirmEmail from '../../features/users/ConfirmEmail';
import RoomCalendar from '../../features/fullCalendar/RoomCalendar';
import IMCCalendarDashboard from '../../features/fullCalendar/IMCCalendarDashboard';
import activityTable from '../../features/activities/table/activityTable';
import AuthenticateToArmy from '../../features/home/AuthenticateToArmy';
import DeletedActivityTable from '../../features/activities/table/deletedActivityTable';
import RoomCalendarLinks from '../../features/fullCalendar/RoomCalendarLinks';
import EmailGroupTable from '../../features/admin/emailGroup/emailGroupTable';
import EmailGroupForm from '../../features/admin/emailGroup/emailGroupForm';
import LoginBoth from '../../features/home/LoginBoth';
import RoomDelegateTable from '../../features/admin/roomDelegates/roomDelegateTable';
import RoomDelegateForm from '../../features/admin/roomDelegates/roomDelegateForm';
import vtcCoordinatorsTable from '../../features/admin/vtcCoordinators/vtcCoordinatorsTable';
import vtcCoordinatorForm from '../../features/admin/vtcCoordinators/vtcCoordinatorForm';
import Itinerary from '../../features/reports/Itinerary';
import DownloadBio from '../../features/reports/downloadBio';
import HostingReport from '../../features/reports/hostingReport';
import DownloadActivityAttachment from '../../features/reports/downloadActivityAttachment';
import HostingReportTable from '../../features/reports/hostingReportTable';
import hostingReportPDFWrapper from '../../features/reports/hostingReportPDFWrapper';
import usahecMeetingSummaryByLocationWrapper from '../../features/reports/usahecMeetingSummaryByLocationWrapper';
import outsiderReportTable from '../../features/reports/outsiderReportTable';
import FlagReport from '../../features/reports/flagReport';
import SVTCCalendar from '../../features/fullCalendar/SVTCCalendar';

function App() {
  const location = useLocation();
  const {commonStore, userStore} = useStore();
  const query = new URLSearchParams(location.search);

  useEffect(() => {
    const id = query.get('id');
    const categoryId = query.get('categoryid');
    const redirecttopage = query.get('redirecttopage');
    if(redirecttopage){
      commonStore.setRedirectToPage(redirecttopage)
    }
    if(id && categoryId){
      commonStore.setRedirectId(id);
      commonStore.setRedirectCategoryId(categoryId);
    }
    if (commonStore.token){

      userStore.getUser().finally(() => commonStore.setAppLoaded());
    } else {
      commonStore.setAppLoaded()
    }
  }, [commonStore, userStore])

  if(!commonStore.appLoaded) return <LoadingComponent content = 'Loading app...'/>



  return (
    <>
        <ToastContainer position='bottom-right' hideProgressBar />
        <ModalContainer />
         <Route exact path={`${process.env.PUBLIC_URL}/`} component={HomePage}/>
         <Route
          path={`${process.env.PUBLIC_URL}/(.+)`} 
          render={() =>(
            <>
           
             <Navbar /> 
            <Container style={{marginTop: '8em', paddingLeft: '10px', paddingRight: '10px'}} fluid>  
              <Switch>
                <Route exact path={`${process.env.PUBLIC_URL}/loginBoth`} component={LoginBoth}/>
                <Route exact path={`${process.env.PUBLIC_URL}/activityTable`} component={activityTable}/>
                <Route exact path={`${process.env.PUBLIC_URL}/hostingReportTable`} component={HostingReportTable}/>
                <Route exact path={`${process.env.PUBLIC_URL}/outsiderReportTable`} component={outsiderReportTable}/>
                <Route exact path={`${process.env.PUBLIC_URL}/flagReport`} component={FlagReport}/>
                <Route exact path={`${process.env.PUBLIC_URL}/svtcCalendar`} component={SVTCCalendar}/>
                <Route exact path={`${process.env.PUBLIC_URL}/hostingReportPDFWrapper`} component={hostingReportPDFWrapper}/>
                <Route exact path={`${process.env.PUBLIC_URL}/usahecMeetingSummaryByLocationWrapper`} component={usahecMeetingSummaryByLocationWrapper}/>            
                <Route exact path={`${process.env.PUBLIC_URL}/deletedactivityTable`} component={DeletedActivityTable}/>
                <Route exact path={`${process.env.PUBLIC_URL}/emailGroupTable`} component={EmailGroupTable}/> 
                <Route exact path={`${process.env.PUBLIC_URL}/roomDelegateTable`} component={RoomDelegateTable}/> 
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/manageRoomDelegate/:id`} component={RoomDelegateForm}/> 
                <Route exact path={`${process.env.PUBLIC_URL}/vtcCoordinatorTable`} component={vtcCoordinatorsTable}/>
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/manageVTCCoordinators/:id`} component={vtcCoordinatorForm}/>                 
                <Route exact path={`${process.env.PUBLIC_URL}/activities`} component={ActivityDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/academiccalendar`} component={AcademicCalendarDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/imccalendar`} component={IMCCalendarDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/genericcalendar/:id`} component={GenericCalendar}/>
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/roomcalendar/:id`} component={RoomCalendar}/>
                <Route exact path={`${process.env.PUBLIC_URL}/roomCalendarLinks`} component={RoomCalendarLinks}/>
                <Route exact path={`${process.env.PUBLIC_URL}/rooms`} component={RoomDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/authenticatetoarmy`} component={AuthenticateToArmy}/>
                <Route path={`${process.env.PUBLIC_URL}/activities/:id/:categoryId`} component={ActivityDetails} sensitive/>
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/itinerary/:id/:categoryId`} component={Itinerary}/>
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/downloadbio/:id/:categoryId`} component={DownloadBio}/>
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/downloadActivityAttachment/:id`} component={DownloadActivityAttachment}/>   
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/hostingReport/:id/:categoryId`} component={HostingReport}/>    
                <Route key={location.key} exact path={[
                  `${process.env.PUBLIC_URL}/createActivity`,
                  `${process.env.PUBLIC_URL}/manage/:id/:categoryId`,
                  `${process.env.PUBLIC_URL}/manage/:id/:categoryId/:manageSeries`,
                  `${process.env.PUBLIC_URL}/createActivityWithRoom/:roomid`,
                  `${process.env.PUBLIC_URL}/createActivityWithCalendar/:calendarid`,
                  `${process.env.PUBLIC_URL}/copy/:id/:categoryId/:copy`,
                  ]} component={ActivityForm}/>
                <Route key={location.key} exact path={ `${process.env.PUBLIC_URL}/manageEmailGroupForm/:id`} component={EmailGroupForm}/>
                <Route path={`${process.env.PUBLIC_URL}/server-error`} component={ServerError} />
                <Route path={`${process.env.PUBLIC_URL}/account/registerSuccess`} component={RegisterSuccess} />
                <Route path={`${process.env.PUBLIC_URL}/account/verifyEmail`} component={ConfirmEmail} />
                <Route component={NotFound}/>
              </Switch>    
         
            </Container>
         
           </>
             
          )}        
         />
            
    </>
   
  );
}

export default observer(App);
