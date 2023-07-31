import NavbarEEM from "./NavbarEEM";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/store";
import NavbarStudentCalendar from "./NavbarStudentCalendar";

export default observer( function Navbar() {
  const {
    navbarStore: {navbarType },
  } = useStore();

  return (
    <>
    {!navbarType || navbarType === 'eem'&& <NavbarEEM /> }
    {navbarType && navbarType === 'studentCalendar'&& <NavbarStudentCalendar /> }
   </>
  );
});
