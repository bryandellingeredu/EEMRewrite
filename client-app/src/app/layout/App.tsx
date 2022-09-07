
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import HomePage from '../../features/home/HomePage';
import {  Route } from 'react-router-dom';
import ActivityForm from '../../features/activities/form/ActivityForm';



function App() {
  return (
    <>
        <Navbar /> 
        <Container style={{marginTop: '7em'}}>
         <Route exact path='/' component={HomePage}/>
         <Route path='/activities' component={ActivityDashboard}/>
         <Route exact path='/createActivity' component={ActivityForm}/>
        </Container>
    </>
  );
}

export default observer(App);
