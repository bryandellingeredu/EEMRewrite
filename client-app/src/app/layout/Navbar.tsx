import { Login } from "@microsoft/mgt-react";
import { Button, Container, Menu } from "semantic-ui-react";
import { useStore } from "../stores/store";



export default function Navbar(){
    const {activityStore} = useStore();

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
                   onClick={() => activityStore.openForm()} positive content='New Calendar Event'
                 />
             </Menu.Item>
             <Menu.Item position="right">
                <Login/>
             </Menu.Item>            
           </Container>
        </Menu>
    )
}