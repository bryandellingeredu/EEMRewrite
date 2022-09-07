
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import HomePage from '../../features/home/HomePage';
import {  Route, useLocation } from 'react-router-dom';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetail';



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
              <Route exact path='/activities' component={ActivityDashboard}/>
              <Route path='/activities/:id' component={ActivityDetails} sensitive/>
              <Route key={location.key} exact path={['/createActivity', '/manage/:id']} component={ActivityForm}/>
            </Container>
           </>
          )}        
         />
    </>
  );
}

export default observer(App);
