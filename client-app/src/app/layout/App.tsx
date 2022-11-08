
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import HomePage from '../../features/home/HomePage';
import {  Route, Switch, useLocation } from 'react-router-dom';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetail';
import AcademicCalendarDashboard from '../../features/fullCalendar/AcademicCalendarDashboard';
import NotFound from '../../features/errors/NotFound';
import ServerError from '../../features/errors/ServerError';
import { ToastContainer } from 'react-toastify';
import GenericCalendar from '../../features/fullCalendar/GenericCalendar';
import RoomDashboard from '../../features/rooms/RoomDashboard';
import NonDepartmentRoomReservation from '../../features/rooms/NonDepartmentRoomReservation';
import ModalContainer from '../common/modals/ModalContainer';
import LoginForm from '../../features/users/LoginForm';
import { useStore } from '../stores/store';
import { useEffect } from 'react';
import LoadingComponent from './LoadingComponent';

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
         <Route exact path='/' component={HomePage}/>
         <Route
          path={'/(.+)'}
          render={() =>(
            <>
             <Navbar /> 
            <Container style={{marginTop: '7em'}}>  
              <Switch>
                <Route exact path='/activities' component={ActivityDashboard}/>
                <Route exact path='/academiccalendar' component={AcademicCalendarDashboard}/>
                <Route exact path='/genericcalendar/:id' component={GenericCalendar}/>
                <Route exact path='/rooms' component={RoomDashboard}/>
                <Route exact path='/reserveNonDepartmentRoom' component={NonDepartmentRoomReservation}/>
                <Route path='/activities/:id/:categoryId' component={ActivityDetails} sensitive/>
                <Route key={location.key} exact path={['/createActivity', '/manage/:id/:categoryId', '/manage/:id/:categoryId/:manageSeries']} component={ActivityForm}/>
                <Route path='/server-error' component={ServerError} />
                <Route path='/login' component={LoginForm} />
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
