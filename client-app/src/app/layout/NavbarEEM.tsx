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

export default observer(function NavbarEEM() {
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
    <div style={{position: "fixed", top: 0, width: "100%", zIndex: 999}}>
   <div style={{backgroundColor: isSignedIn && armyProfile && armyProfile.mail  ?  "#502b85" :
    isSignedIn ? "green" :
    armyProfile && armyProfile.mail ? "#502b85": "red",
    height: "25px", display: "flex", justifyContent: "center", alignItems: "center"}}>
    <p style={{color: "white", margin: 0, padding: "0 10px"}}>
    {isSignedIn && armyProfile && armyProfile.mail  ?  "Logged on with both .edu and CAC - CUI Authorized" :
    isSignedIn ? "Logged on .edu - No PII or CUI Authorized" :
    armyProfile && armyProfile.mail ? "Logged on with CAC - CUI Authorized": "Your CAC Session has expired please "}
    { !isSignedIn && !(armyProfile && armyProfile.mail) &&  <Link
            to={`${process.env.PUBLIC_URL}/authenticatetoarmy`}
            className="ui primary button mini" style={{marginLeft: '5px'}}
          >
            Log into Army 365 again
          </Link>
      }
    </p>
  </div>
  <div>
    <Menu  inverted color="teal">
      <Container fluid>
        <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/`} header>
          <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="logo" style={{ marginRight: 10 }} />
          EEM
        </Menu.Item>
        {!isMobile && isLoggedIn && (
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
                IMC
            </Menu.Item> 
            {  user && user.roles &&  user.roles.includes("EnlistedAidAdmin") &&
            <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/enlistedAideCalendarWrapper`}>
                Enlisted Aide Calendar
            </Menu.Item>    
            } 
              <Dropdown item text="Calendars" scrolling >
                
                <Dropdown.Menu>
                <Dropdown.Item
                    text="Customizable Calendar"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/customcalendar`}
                  />
                    <Dropdown.Item
                    text="Bldg 651 Calendar"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/bldg651Calendar/651`}
                  />

                   <Dropdown.Item
                    text="Collins Hall Calendar"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/bldg651Calendar/650`}
                  />
            {
  categories
    .filter(x => x.routeName && x.name !== "Other" &&  x.name !== "USAHEC Calendar" && !(x.name === 'CIO Event Planning Calendar' && (!user || !user.roles || !user.roles.includes("CIOEventPlanningAdmin"))))
    .map((category) => (
      <Dropdown.Item key={category.id}
        text={
          category.name === 'Academic IMC Event' ? 'Faculty Calendar' :
          category.name === 'SSL Calendar' ? 'SSL Admin Calendar' :
          category.name === 'USAHEC Facilities Usage Calendar' ? 'USAHEC Calendar' :
          category.name === 'Military Family and Spouse Program' ? 'Military Spouse and Family Program' :
          category.name
        }
        as={Link} 
        to={category.name === 'Student Calendar' ? `${process.env.PUBLIC_URL}/residentAndDistanceStudentCalendar` : `${process.env.PUBLIC_URL}/genericcalendar/${category.routeName}`}
      />
    ))
}
                </Dropdown.Menu>
              </Dropdown>

             

            <Dropdown item text="Room Calendars">
            <Dropdown.Menu>
            <Dropdown.Item
                    text="Room Calendars"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/roomCalendarLinks`}
                  />
               <Dropdown.Item
                    text="All Rooms"
                    as={Link}
                    to={`${process.env.PUBLIC_URL}/bldg651Calendar/all`}
                  />
             </Dropdown.Menu>
            </Dropdown>


            <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/rooms`}>
              Rooms
            </Menu.Item>
            { isSignedIn && user && roomDelegates && roomDelegates.some(
               (delegate) => delegate.delegateEmail === user.userName
             ) &&
            <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/approveanyroomreservation`}>
              Approve Room Reservations
            </Menu.Item>
         }
            <Dropdown item text="Reports">
            <Dropdown.Menu>            
            <Dropdown.Header icon='tags' content='Hosting Reports' />
            <DropdownDivider/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/hostingReportTable`} text ="Hosting Report List"
             label={{ color: 'red', empty: true, circular: true }}/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/hostingReportPDFWrapper`} text ="Hosting Reports (PDF)"
            label={{ color: 'red', empty: true, circular: true }}/>
             <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/outsiderReportTable`} text ="Outsider Report List"
             label={{ color: 'red', empty: true, circular: true }}/>
              <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/flagReport`} text ="Flag Report"
             label={{ color: 'red', empty: true, circular: true }}/>
              <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/parkingReport`} text ="Parking Report"
             label={{ color: 'red', empty: true, circular: true }}/>
            <DropdownDivider/>
            <Dropdown.Header icon='tags' content='USAHEC Reports' />
            <DropdownDivider/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/usahecMeetingSummaryByLocationWrapper/location`} text ="USAHEC Meeting Summary By Location"
            label={{ color: 'black', empty: true, circular: true }}/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/usahecMeetingSummaryByLocationWrapper/reservation`} text ="USAHEC Meeting Summary By Reservation Type"
            label={{ color: 'black', empty: true, circular: true }}/>
            <DropdownDivider/>
            <Dropdown.Header icon='tv' content='SVTC Reports' />
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/svtcCalendar`} text ="SVTC Calendar"
            label={{ color: 'orange', empty: true, circular: true }}/>
            <DropdownDivider/>
            </Dropdown.Menu>
            </Dropdown>
            <Dropdown item text="Feedback and Links">
            <Dropdown.Menu>            
            <Dropdown.Header icon='comments' content='Provide Feedback and Report Problems' />
            <DropdownDivider/>
            <Dropdown.Item>
            <a href="https://apps.armywarcollege.edu/home/feedback.cfm" target="_blank" rel="noopener noreferrer">
                 <span style={{ color: 'black' }}>Feedback</span>
            </a>
            </Dropdown.Item>
          
            <DropdownDivider/>
            <Dropdown.Header icon='paperclip' content='Links' />
            <DropdownDivider/>
            <Dropdown.Item>
            <a href="https://apps.armywarcollege.edu"  rel="noopener noreferrer" target='_blank'>
                 <span style={{ color: 'black' }}>Main Landing Page</span>
            </a>
            
        
            </Dropdown.Item>
            <Dropdown.Item>
            <a href={`${process.env.PUBLIC_URL}/assets/simplifiedfloorplans.pdf`} target='_blank'>
                 <span style={{ color: 'black' }}>Bldg 651 Floor Plans</span>
            </a>
            </Dropdown.Item>
            <Dropdown.Item>
            <a href="https://armyeitaas.sharepoint-mil.us/sites/USAWC-eemarchive" target='_blank'>
            <span style={{ color: 'black' }}>EEM Archives</span>
            </a>
            </Dropdown.Item>
            </Dropdown.Menu>
            </Dropdown>
        

            {user && user.roles && user.roles.includes("admin") &&
            <Dropdown item text="Admin">
            <Dropdown.Menu>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/emailGroupTable`} text ="Manage Email Groups"/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/roomDelegateTable`} text ="Manage Room Delegates"/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/vtcCoordinatorTable`} text ="Manage VTC Coordinators"/>
            <Dropdown.Item as={NavLink} to={`${process.env.PUBLIC_URL}/manageRolesTable`} text ="Manage User Roles"/>
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
                    {/*
                    <Dropdown.Item
                      as={Link}
                      to={`${process.env.PUBLIC_URL}/profile/${user?.userName}`}
                      text="My Profile"
                      icon="user"
                    />
                   */}
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
         {isMobile && isLoggedIn && user && user.roles &&  user.roles.includes("EnlistedAidAdmin") &&
         (
          <Menu.Item as={NavLink} to={`${process.env.PUBLIC_URL}/enlistedAideCalendarWrapper`}>
            Enlisted Aide Calendar
         </Menu.Item>
         )}
      </Container>
    </Menu>
    </div>
</div>
  );
});
