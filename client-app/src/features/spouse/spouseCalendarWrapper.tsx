import { useEffect, useState } from 'react';
import { useStore } from '../../app/stores/store';
import { observer } from "mobx-react-lite";
import Outlook from '../../app/layout/Sync/Outlook';
import Apple from '../../app/layout/Sync/Apple';
import Google from '../../app/layout/Sync/Google';
import Android from '../../app/layout/Sync/Android';
import FullScreenSpouseCalendar from './fullScreenSpouseCalendar';
import MobileSpouseCalendar from './mobileSpouseCalendar';

export default observer (function SpouseCalendarWrapper(){
    const {
        navbarStore: {page, setNavbarTypeFromUrl},
        userStore: {isLoggedIn},
      } = useStore()

      const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

      useEffect(() => {
        setNavbarTypeFromUrl('eem/spousecalendar');
       }, [])

       useEffect(() => {
        if(!isLoggedIn)  window.location.href = `${window.location.origin}/ifcalendar`;
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
        {page === 'calendar' && !isMobile && <FullScreenSpouseCalendar />}
        {page === 'calendar'&& isMobile && <MobileSpouseCalendar />}
        {page === 'outlook' && <Outlook />}
        {page === 'apple' && <Apple />}
        {page === 'google' && <Google />}
        {page === 'android' && <Android />}

        </>
      )
})