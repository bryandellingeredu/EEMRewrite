import { Login } from "@microsoft/mgt-react";
import { Container, Menu } from "semantic-ui-react";

export default function Navbar(){
    return(
        <Menu  fixed='top' inverted color='teal'>
           <Container>
             <Menu.Item header>
                <img src="/assets/logo.png" alt="logo" style={{marginRight: 10}} />
                 EEM
             </Menu.Item>
             <Menu.Item name='calendar events' />
             <Menu.Item position="right">
                <Login/>
             </Menu.Item>            
           </Container>
        </Menu>
    )
}