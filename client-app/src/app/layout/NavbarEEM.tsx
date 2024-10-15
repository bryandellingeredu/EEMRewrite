import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { Link, NavLink, useHistory } from "react-router-dom";
import {
  Button,
  Container,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Image,
  Menu,
} from "semantic-ui-react";
import { useStore } from "../stores/store";
import { useState, useEffect } from "react";
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

export default observer(function NavbarEEM() {
  const history = useHistory();
  const {
    userStore: { user, logout, isLoggedIn },
    graphRoomStore: { graphRooms, loadGraphRooms },
    categoryStore: {categories, loadCategories},
    graphUserStore: {armyProfile},
    graphRoomStore: {roomDelegates, loadRoomDelegates}
  } = useStore();
  const [isSignedIn] = useIsSignedIn();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() =>{
   if(user && user.userName && user.userName.endsWith(".sfm@armywarcollege.edu")){
    // this a spouse
    if(user.roles && user.roles.includes("spouseAmbassador")){
      // do not redirect the spouse ambassadors, a spouse ambassador is allowed to be in the EEM
    }else{
      // this is a spouse without the ambassador role, they are not allowed in the EEM redirect them to the spouse calendar
      history.push(`${process.env.PUBLIC_URL}/spousecalendar`);
    }
   }
  }, [user, history])

  useEffect(() => {
    if (!roomDelegates || roomDelegates.length < 1) loadRoomDelegates();
  }, [roomDelegates]);

  useEffect(() => {
    if (!graphRooms.length) loadGraphRooms();
    if (!categories.length) loadCategories();
    console.log('user');
    console.log(user);
    console.log(user?.displayName);
    console.log(user?.roles);
  }, [loadGraphRooms, graphRooms.length, categories.length]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Menu inverted fixed='top'>
    <Container fluid>
      <Menu.Item header  >  
    <h5>USAWC <br /> International Fellows Calendar </h5> 
          
      </Menu.Item>
      <Menu.Item position="right" >
      <Image src={`${process.env.PUBLIC_URL}//assets/armylogo-90-dark.svg`} size='tiny'  />
      </Menu.Item>
    
      </Container>
</Menu>
  );
});
