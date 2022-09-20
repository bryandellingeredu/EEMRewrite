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
             <Menu.Item as={NavLink} to='/activities' name='Activities' />
             <Dropdown item text="Calendars">
              <Dropdown.Menu>
                <Dropdown.Item text = 'Academic Calendar' as={Link} to='/academiccalendar'/>
                <Dropdown.Item text = 'CSL Calendar' as={Link} to='/cslcalendar'/>   
              </Dropdown.Menu>
             </Dropdown>
             <Menu.Item>
                <Button as={NavLink} to='/createActivity'
                  positive content='New Calendar Event'
                 />
             </Menu.Item>
             <Menu.Item position="right">
                <Login/>
             </Menu.Item>            
           </Container>
        </Menu>
    )
}