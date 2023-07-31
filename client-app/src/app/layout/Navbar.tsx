import NavbarEEM from "./NavbarEEM";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/store";
import NavbarStudentCalendar from "./NavbarStudentCalendar";
import { Loader } from "semantic-ui-react";

export default observer( function Navbar() {
  const {
    navbarStore: {navbarType },
  } = useStore();

  return (
    <>
    {!navbarType && <Loader size='small' inline/> }
    {navbarType === 'eem' && <NavbarEEM /> }
    {navbarType && navbarType === 'studentCalendar'&& <NavbarStudentCalendar /> }
   </>
  );
});
