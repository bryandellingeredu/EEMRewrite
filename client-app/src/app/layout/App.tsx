
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

function App() {
  const location = useLocation();
  const {commonStore, userStore} = useStore();

  useEffect(() => {
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
                <Route exact path={`${process.env.PUBLIC_URL}/activityTable`} component={activityTable}/>
                <Route exact path={`${process.env.PUBLIC_URL}/activities`} component={ActivityDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/academiccalendar`} component={AcademicCalendarDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/imccalendar`} component={IMCCalendarDashboard}/>
                <Route exact path={`${process.env.PUBLIC_URL}/genericcalendar/:id`} component={GenericCalendar}/>
                <Route key={location.key} exact path={`${process.env.PUBLIC_URL}/roomcalendar/:id`} component={RoomCalendar}/>
                <Route exact path={`${process.env.PUBLIC_URL}/rooms`} component={RoomDashboard}/>
                <Route path={`${process.env.PUBLIC_URL}/activities/:id/:categoryId`} component={ActivityDetails} sensitive/>
                <Route key={location.key} exact path={[`${process.env.PUBLIC_URL}/createActivity`, `${process.env.PUBLIC_URL}/manage/:id/:categoryId`, `${process.env.PUBLIC_URL}/manage/:id/:categoryId/:manageSeries`]} component={ActivityForm}/>
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
