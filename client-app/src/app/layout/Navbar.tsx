import { Login } from "@microsoft/mgt-react";
import { Button, Container, Menu } from "semantic-ui-react";

interface Props{
    openForm: () => void;
}

export default function Navbar({openForm}: Props){
    return(
        <Menu  fixed='top' inverted color='teal'>
           <Container>
             <Menu.Item header>
                <img src="/assets/logo.png" alt="logo" style={{marginRight: 10}} />
                 EEM
             </Menu.Item>
             <Menu.Item name='calendar events' />
             <Menu.Item>
                <Button
                   onClick={openForm} positive content='New Calendar Event'
                 />
             </Menu.Item>
             <Menu.Item position="right">
                <Login/>
             </Menu.Item>            
           </Container>
        </Menu>
    )
}