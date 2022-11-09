

import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { Link, NavLink } from "react-router-dom";
import { Button, Container, Dropdown, Image, Menu } from "semantic-ui-react";
import { useStore } from "../stores/store";
import { useState, useEffect} from "react";
import { Providers, ProviderState } from "@microsoft/mgt";

function useIsSignedIn(): [boolean] {
   const [isSignedIn, setIsSignedIn] = useState(false);
   useEffect(() => {
     const updateState = () => {
       const provider = Providers.globalProvider;
       setIsSignedIn(provider && provider.state === ProviderState.SignedIn);
     };
 
     Providers.onProviderUpdated(updateState);
     updateState();
 
     return () => {
       Providers.removeProviderUpdatedListener(updateState);
     };
   }, []);
   return [isSignedIn];
 }

export default observer(function Navbar(){
   const {userStore: {user, logout}} = useStore();
   const [isSignedIn] = useIsSignedIn();

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
             <Menu.Item as={NavLink} to='/rooms'>
              Rooms
             </Menu.Item>
             {!isSignedIn && 
             <Menu.Item position="right">
                 <Image src={user?.image || '/assets/user.png'} avatar spaced='right'/>
                 <Dropdown pointing='top left' text={user?.displayName}>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={`/profile/${user?.userName}`} text='My Profile' icon='user'/>
                    <Dropdown.Item onClick={logout} text='Logout' icon='power'/>
                    </Dropdown.Menu>
                 </Dropdown>
             </Menu.Item>}
             {isSignedIn &&
             <Menu.Item position="right">
                <Login logoutInitiated={logout}/>
             </Menu.Item>  
             }          
           </Container>
        </Menu>
    )
})