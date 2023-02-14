import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { Link, NavLink } from "react-router-dom";
import {
  Button,
  Container,
  Dropdown,
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

export default observer(function Navbar() {
  const {
    userStore: { user, logout, isLoggedIn },
    graphRoomStore: { loadingInitial, graphRooms, loadGraphRooms },
    categoryStore: {categories, loadCategories}
  } = useStore();
  const [isSignedIn] = useIsSignedIn();

  useEffect(() => {
    if (!graphRooms.length) loadGraphRooms();
    if (!categories.length) loadCategories();
    console.log('user');
    console.log(user);
    console.log(user?.displayName);
    console.log(user?.roles);
  }, [loadGraphRooms, graphRooms.length, categories.length]);

  return (
    <Menu fixed="top" inverted color="teal">
      <Container>
        <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/`} header>
          <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="logo" style={{ marginRight: 10 }} />
          EEM
        </Menu.Item>
        {isLoggedIn && (
          <>
      
            <Menu.Item>
              <Button
                as={NavLink}
                to={`${process.env.PUBLIC_URL}/createActivity`}
                positive
                content="New EEM Event"
              />
            </Menu.Item>
            <Dropdown item text="Events"  >
            <Dropdown.Menu>
              <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/activityTable`} text ="Event List"/>
              <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/activities`} text ="Today's Events"/>
              <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/deletedactivityTable`} text ="Recycle Bin / Deleted Activities"/>
            </Dropdown.Menu>    
            </Dropdown>        
              <Dropdown item text="Department Calendars" scrolling >
                <Dropdown.Menu>
                  {categories.filter(x => x.routeName).map((category) => (
                    <Dropdown.Item key={category.id}
                     text={category.name}   as={Link} 
                    to={`${process.env.PUBLIC_URL}/genericcalendar/${category.routeName}`}  />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              {/*
              <Dropdown item text="Room Calendars" scrolling >
                <Dropdown.Menu>
                  {loadingInitial && <Dropdown.Item text="Loading Rooms..." />}
                  {graphRooms.map((room) => (
                    <Dropdown.Item key={room.id} text={room.displayName}   as={Link}   to={`${process.env.PUBLIC_URL}/roomcalendar/${room.id}`}  />
                  ))}
                  *
                </Dropdown.Menu>           
              </Dropdown> 
                  */} 
               <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/roomCalendarLinks`}>
              Room Calendars
            </Menu.Item>
              <Dropdown item text="IMC Calendars" >
                <Dropdown.Menu>           
                   <Dropdown.Item
                    text="Integrated Master Calendar (IMC)"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/imccalendar`}
                  />
                  <Dropdown.Item
                    text="Academic"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/academiccalendar`}
                  />
                
                </Dropdown.Menu>
              </Dropdown>           
            <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/rooms`}>
              Rooms
            </Menu.Item>
            {user && user.roles && user.roles.includes("admin") &&
            <Dropdown item text="Admin">
            <Dropdown.Menu>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/emailGroupTable`} text ="Manage Email Groups"/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/roomDelegateTable`} text ="Manage Room Owners / Delegates"/>
            </Dropdown.Menu>    
            </Dropdown> 
           }
            {!isSignedIn && (
              <Menu.Item position="right">
                <Image
                  src={user?.image || `${process.env.PUBLIC_URL}/assets/user.png`}
                  avatar
                  spaced="right"
                />
                <Dropdown pointing="top left" text={user?.displayName}>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      as={Link}
                      to={`${process.env.PUBLIC_URL}/profile/${user?.userName}`}
                      text="My Profile"
                      icon="user"
                    />
                    <Dropdown.Item
                      onClick={logout}
                      text="Logout"
                      icon="power"
                    />
                  </Dropdown.Menu>
                </Dropdown>
              </Menu.Item>
            )}
            {isSignedIn && (
              <Menu.Item position="right">
                <Login logoutInitiated={logout} />
              </Menu.Item>
            )}
          </>
        )}
      </Container>
    </Menu>
  );
});
