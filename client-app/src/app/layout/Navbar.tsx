

import { Login } from "@microsoft/mgt-react";
import { Link, NavLink } from "react-router-dom";
import { Button, Container, Dropdown, Menu } from "semantic-ui-react";

export default function Navbar(){
    return(
        <Menu  fixed='top' inverted color='teal'>
           <Container>
             <Menu.Item as={NavLink} to='/' exact header>
                <img src="/assets/logo.png" alt="logo" style={{marginRight: 10}} />
                 EEM
               
             </Menu.Item>
             <Menu.Item>
                <Button as={NavLink} to='/createActivity'
                  positive content='New EEM Event'
                 />
             </Menu.Item>
         
             <Menu.Item as={NavLink} to='/activities'>
              Today's Events
             </Menu.Item>
             <Dropdown item text="Department Calendars">
              <Dropdown.Menu>
                <Dropdown.Item text = 'Academic' as={Link} to='/academiccalendar'/>
                <Dropdown.Item text = 'ASEP' as={Link} to='/genericcalendar/asep'/>
                <Dropdown.Item text = 'CSL' as={Link} to='/genericcalendar/csl'/>
                <Dropdown.Item text = 'Chapel' as={Link} to='/genericcalendar/chapel'/>    
              </Dropdown.Menu>
             </Dropdown>
             <Menu.Item>
             <Menu.Item as={NavLink} to='rooms' name="rooms" />
             </Menu.Item>
             <Menu.Item position="right">
                <Login/>
             </Menu.Item>            
           </Container>
        </Menu>
    )
}