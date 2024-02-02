import { useEffect, useState } from 'react';
import FullScreenStudentCalendar from './fullScreenStudentCalendar';
import MobileStudentCalendar from './mobileStudentCalendar';
import { useStore } from '../../app/stores/store';
import { observer } from "mobx-react-lite";
import Outlook from '../../app/layout/Sync/Outlook';
import Apple from '../../app/layout/Sync/Apple';
import Google from '../../app/layout/Sync/Google';
import Android from '../../app/layout/Sync/Android';

export default observer (function StudentCalendarWrapper(){

  const {
    navbarStore: {page, setNavbarTypeFromUrl},
    userStore: {isLoggedIn},
  } = useStore()


    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
   
    useEffect(() => {
     setNavbarTypeFromUrl('eem/studentcalendar');
    }, [])

    useEffect(() => {
     if(!isLoggedIn)  window.location.href = `${window.location.origin}/eem?redirecttopage=studentcalendar`;
    }, [isLoggedIn] )

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
        <>
        {page === 'calendar' && !isMobile && <FullScreenStudentCalendar />}
        {page === 'calendar'&& isMobile && <MobileStudentCalendar />}
        {page === 'outlook' && <Outlook />}
        {page === 'apple' && <Apple />}
        {page === 'google' && <Google />}
        {page === 'android' && <Android />}
        </>
      )
      
})