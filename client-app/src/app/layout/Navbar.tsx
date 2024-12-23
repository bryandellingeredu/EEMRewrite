import NavbarEEM from "./NavbarEEM";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/store";
import NavbarStudentCalendar from "./NavbarStudentCalendar";
import { Loader } from "semantic-ui-react";
import NavbarMSFPCalendar from "./NavbarMSFPCalendar";
import NavbarCommunityCalendar from "./NavbarCommunityCalendar";
import NavbarSpouseCalendar from "./NavbarSpouseCalendar";

export default observer( function Navbar() {
  const {
    navbarStore: {navbarType },
  } = useStore();

  return (
    <>
    {!navbarType && <Loader size='small' inline/> }
    {navbarType && navbarType === 'eem' && <NavbarEEM /> }
    {navbarType && navbarType === 'studentCalendar'&& <NavbarStudentCalendar /> }
    {navbarType && navbarType === 'spouseCalendar'&& <NavbarSpouseCalendar /> }
    {navbarType && navbarType === 'msfp'&& <NavbarMSFPCalendar /> }
    {navbarType && navbarType === 'community'&& <NavbarCommunityCalendar /> }
   </>
  );
});
