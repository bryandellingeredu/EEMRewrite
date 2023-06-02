import { observer } from "mobx-react-lite";
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Button, Divider, Header, Icon, Message, Segment } from "semantic-ui-react";
import { Login } from "@microsoft/mgt-react";
import IMCCalendarWithoutAcademicEvents from "./IMCCalendarWithoutAcademicEvents";
import IMCLegend from "./IMCLegend";
import SyncCalendarInformation from "./SyncCalendarInformation";
import { useStore } from "../../app/stores/store";
import GenericCalendarTable from "./GenericCalendarTable";
import SubCalendarInformation from "../activities/form/SubCalendarInformation";


  
export default observer(function IMCCalendarDashboard(){
  const { modalStore } = useStore();
  const {openModal} = modalStore;
    return(
          <>   
      <Button icon  floated="left" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SubCalendarInformation/>, 'large'
            )
          }
        >
      <Icon name='info'/>
       &nbsp; Calendar Descriptions
    </Button>  
               <Button icon  floated="right" color='black' size='tiny'
          onClick={() =>
            openModal(
              <SyncCalendarInformation
                routeName={'imc'}
              />, 'large'
            )
          }
        >
      <Icon name='sync'/>
       &nbsp; Sync To My Calendar
    </Button>  
 <Divider horizontal>
    <Header as='h2'>
      <Icon name='calendar' />
      Integrated Master Calendar
    </Header>
  </Divider>
  <IMCLegend />
  <IMCCalendarWithoutAcademicEvents/> 
  <GenericCalendarTable id={'imc'} />
    </>
    )
})