import { Login } from "@microsoft/mgt-react";
import { NavLink } from "react-router-dom";
import { Button, Container, Menu } from "semantic-ui-react";

export default function Navbar(){

    return(
        <Menu  fixed='top' inverted color='teal'>
           <Container>
             <Menu.Item as={NavLink} to='/' exact header>
                <img src="/assets/logo.png" alt="logo" style={{marginRight: 10}} />
                 EEM
             </Menu.Item>
             <Menu.Item as={NavLink} to='/activities' name='Activities' />
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