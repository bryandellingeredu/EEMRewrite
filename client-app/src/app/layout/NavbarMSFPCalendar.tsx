import { Container, Dropdown, Menu, Image } from "semantic-ui-react";
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faWindows } from "@fortawesome/free-brands-svg-icons";
import { faApple } from "@fortawesome/free-brands-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faAndroid } from "@fortawesome/free-brands-svg-icons";
import {useState, useEffect, useCallback, useRef} from 'react';
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useStore } from "../stores/store";


const faWindowsPropIcon = faWindows as IconProp;
const faApplePropIcon = faApple as IconProp;
const faGooglePropIcon = faGoogle as IconProp;
const faAndroidPropIcon = faAndroid as IconProp;



export default function NavbarMSFPCalendar(){
  const {
    navbarStore: {setPage },
  } = useStore();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  const handleOutlookClick = () => setPage("outlook");
  const handleAppleClick = () => setPage("apple");
  const handleAndroidClick = () => setPage("android");
  const handleGoogleClick = () => setPage("google");
  const handleHomeClick = () => setPage("calendar");



useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
    return(
        <Menu inverted fixed='top'>
        <Container fluid>
        <Menu.Item position="left">
          <Dropdown item icon='bars' simple>

            <Dropdown.Menu>
            <Dropdown.Item  onClick={handleHomeClick}>
            <FontAwesomeIcon icon={faHome}  style={{paddingRight: '2px', color: 'teal'}} />
              Home
            </Dropdown.Item>
            <Dropdown.Item  onClick={handleOutlookClick} >
            <FontAwesomeIcon icon={faWindowsPropIcon}  style={{paddingRight: '2px', color: 'teal'}} />
              Sync Calendar to Outlook
              </Dropdown.Item>
            <Dropdown.Item onClick={handleAppleClick}>
            <FontAwesomeIcon icon={faApplePropIcon}  style={{paddingRight: '2px', color: 'teal'}} />
              Sync Calendar to iPhone
              </Dropdown.Item>
            <Dropdown.Item onClick={handleAndroidClick}>
            <FontAwesomeIcon icon={faAndroidPropIcon}  style={{paddingRight: '2px', color: 'teal'}} />
              Sync Calendar to Android
              </Dropdown.Item>
              <Dropdown.Item onClick={handleGoogleClick}>
            <FontAwesomeIcon icon={faGooglePropIcon}  style={{paddingRight: '2px', color: 'teal'}} />
              Sync Calendar to Google Calendar
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          </Menu.Item>
          <Menu.Item header  >  
         { isMobile && <h3>Military Spouse & <br /> Family Program </h3> }
         { !isMobile && <h3>United States Army War College Military Spouse and Family Program</h3> }
              
          </Menu.Item>
          <Menu.Item position="right" >
          <Image src={`${process.env.PUBLIC_URL}//assets/armylogo-90-dark.svg`} size='tiny' floated="right" />
          </Menu.Item>
        
          </Container>
    </Menu>
    )
}