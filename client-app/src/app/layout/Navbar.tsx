import { Login } from "@microsoft/mgt-react";
import { observer } from "mobx-react-lite";
import { Link, NavLink } from "react-router-dom";
import {
  Button,
  Container,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
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
    graphRoomStore: { graphRooms, loadGraphRooms },
    categoryStore: {categories, loadCategories},
    graphUserStore: {armyProfile}
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
    <div style={{position: "fixed", top: 0, width: "100%", zIndex: 999}}>
   <div style={{backgroundColor: isSignedIn && armyProfile && armyProfile.mail  ?  "black" :
    isSignedIn ? "green" :
    armyProfile && armyProfile.mail ? "#cd5700": "red",
    height: "25px", display: "flex", justifyContent: "center", alignItems: "center"}}>
    <p style={{color: "white", margin: 0, padding: "0 10px"}}>
    {isSignedIn && armyProfile && armyProfile.mail  ?  "Logged on with both .edu and CAC - CUI Authorized" :
    isSignedIn ? "Logged on .edu - No PII or CUI Authorized" :
    armyProfile && armyProfile.mail ? "Logged on with CAC - CUI Authorized": "You are no logged onto the EEM"}
    </p>
  </div>
  <div>
    <Menu  inverted color="teal">
      <Container fluid>
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
            <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/imccalendar`}>
                Integrated Master Calendar (IMC)
            </Menu.Item>     
              <Dropdown item text="Calendars" scrolling >
                <Dropdown.Menu>
                    <Dropdown.Item
                    text="Student Calendar"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/academiccalendar`}
                  />
              {categories.filter(x => x.routeName && x.name !== "Other").map((category) => (
                 <Dropdown.Item key={category.id}
                  text={category.name === 'Academic IMC Event' ? 'Academic Calendar' : category.name}   as={Link} 
                  to={`${process.env.PUBLIC_URL}/genericcalendar/${category.routeName}`}  />
                ))}
                </Dropdown.Menu>
              </Dropdown>
               <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/roomCalendarLinks`}>
              Room Calendars
            </Menu.Item>        
            <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/rooms`}>
              Rooms
            </Menu.Item>
            <Dropdown item text="Reports">
            <Dropdown.Menu>
            
            <Dropdown.Header icon='tags' content='Hosting Reports' />
            <DropdownDivider/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/hostingReportTable`} text ="Hosting Report List"
             label={{ color: 'red', empty: true, circular: true }}/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/hostingReportPDFWrapper`} text ="Hosting Reports (PDF)"
            label={{ color: 'red', empty: true, circular: true }}/>
            <DropdownDivider/>
            <Dropdown.Header icon='tags' content='USAHEC Reports' />
            <DropdownDivider/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/usahecMeetingSummaryByLocationWrapper`} text ="USAHEC Meeting Summary By Location"
            label={{ color: 'black', empty: true, circular: true }}/>
            </Dropdown.Menu>
            </Dropdown>
            {user && user.roles && user.roles.includes("admin") &&
            <Dropdown item text="Admin">
            <Dropdown.Menu>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/emailGroupTable`} text ="Manage Email Groups"/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/roomDelegateTable`} text ="Manage Room Delegates"/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/vtcCoordinatorTable`} text ="Manage VTC Coordinators"/>
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
    </div>
</div>
  );
});
