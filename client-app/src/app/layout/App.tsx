
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import HomePage from '../../features/home/HomePage';
import {  Route, Router, Switch, useLocation } from 'react-router-dom';
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

function App() {
  const location = useLocation();
  const {commonStore, userStore} = useStore();
  const query = new URLSearchParams(location.search);

  useEffect(() => {
    const id = query.get('id');
    const categoryId = query.get('categoryid');
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
            <Container style={{marginTop: '7em'}}>  
              <Switch>
                <Route exact path={`${process.env.PUBLIC_URL}/loginBoth`} component={LoginBoth}/>
                <Route exact path={`${process.env.PUBLIC_URL}/activityTable`} component={activityTable}/>
                <Route exact path={`${process.env.PUBLIC_URL}/deletedactivityTable`} component={DeletedActivityTable}/>
                <Route exact path={`${process.env.PUBLIC_URL}/emailGroupTable`} component={EmailGroupTable}/>                 
                <Route exact path={`${process.env.PUBLIC_URL}/activities`} component={ActivityDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/academiccalendar`} component={AcademicCalendarDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/imccalendar`} component={IMCCalendarDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/genericcalendar/:id`} component={GenericCalendar}/>
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/roomcalendar/:id`} component={RoomCalendar}/>
                <Route exact path={`${process.env.PUBLIC_URL}/roomCalendarLinks`} component={RoomCalendarLinks}/>
                <Route exact path={`${process.env.PUBLIC_URL}/rooms`} component={RoomDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/authenticatetoarmy`} component={AuthenticateToArmy}/>
                <Route path={`${process.env.PUBLIC_URL}/activities/:id/:categoryId`} component={ActivityDetails} sensitive/>
                <Route key={location.key} exact path={[
                  `${process.env.PUBLIC_URL}/createActivity`,
                  `${process.env.PUBLIC_URL}/manage/:id/:categoryId`,
                  `${process.env.PUBLIC_URL}/manage/:id/:categoryId/:manageSeries`,
                  `${process.env.PUBLIC_URL}/createActivityWithRoom/:roomid`,
                  ]} component={ActivityForm}/>
                <Route key={location.key} exact path={[`${process.env.PUBLIC_URL}/createEmailGroupMember`, `${process.env.PUBLIC_URL}/manageEmailGroupMember/:id`]} component={EmailGroupForm}/>
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
