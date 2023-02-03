import { observer } from "mobx-react-lite";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Divider, Header, Icon, Message, Segment } from "semantic-ui-react";
import { Login } from "@microsoft/mgt-react";
import IMCCalendarWithoutAcademicEvents from "./IMCCalendarWithoutAcademicEvents";
import IMCLegend from "./IMCLegend";


  
export default observer(function IMCCalendarDashboard(){
    return(
          <>     
 <Divider horizontal>
    <Header as='h2'>
      <Icon name='calendar' />
      Integrated Master Calendar
    </Header>
  </Divider>
  <IMCLegend />
  <IMCCalendarWithoutAcademicEvents/> 
    </>
    )
})