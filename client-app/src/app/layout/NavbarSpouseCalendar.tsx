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



export default function NavbarSpouseCalendar(){
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
          <Menu.Item header  >  
        <h3>USAWC <br /> International Fellows Calendar </h3> 
              
          </Menu.Item>
          <Menu.Item position="right" >
          <Image src={`${process.env.PUBLIC_URL}//assets/armylogo-90-dark.svg`} size='tiny' floated="right" />
          </Menu.Item>
        
          </Container>
    </Menu>
    )
}