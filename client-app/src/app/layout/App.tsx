
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import HomePage from '../../features/home/HomePage';
import {  Route, Switch, useLocation } from 'react-router-dom';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetail';
import Calendar from '../../features/fullCalendar/Calendar';
import CalendarDashboard from '../../features/fullCalendar/CalendarDashboard';
import NotFound from '../../features/errors/NotFound';
import ServerError from '../../features/errors/ServerError';

function App() {
  const location = useLocation();
  return (
    <>
         <Route exact path='/' component={HomePage}/>
         <Route
          path={'/(.+)'}
          render={() =>(
            <>
             <Navbar /> 
            <Container style={{marginTop: '7em'}}>  
              <Switch>
                <Route exact path='/activities' component={ActivityDashboard}/>
                <Route exact path='/calendar' component={CalendarDashboard}/>
                <Route path='/activities/:id/:categoryId' component={ActivityDetails} sensitive/>
                <Route key={location.key} exact path={['/createActivity', '/manage/:id/:categoryId']} component={ActivityForm}/>
                <Route path='/server-error' component={ServerError} />
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
