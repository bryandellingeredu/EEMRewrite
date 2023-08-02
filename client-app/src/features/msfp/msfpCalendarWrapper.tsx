import { useEffect, useState } from 'react';
import { useStore } from '../../app/stores/store';
import { observer } from "mobx-react-lite";
import Outlook from '../../app/layout/Sync/Outlook';
import Apple from '../../app/layout/Sync/Apple';
import Google from '../../app/layout/Sync/Google';
import Android from '../../app/layout/Sync/Android';
import FullScreenMSFPCalendar from './fullScreenMSFPCalendar';
import MobileMSFPCalendar from './mobileMSFPCalendar';

export default observer (function MSFPCalendarWrapper(){

  const {
    navbarStore: {page},
  } = useStore()

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        {page === 'calendar' && !isMobile && <FullScreenMSFPCalendar />}
        {page === 'calendar'&& isMobile && <MobileMSFPCalendar />}
        {page === 'outlook' && <Outlook />}
        {page === 'apple' && <Apple />}
        {page === 'google' && <Google />}
        {page === 'android' && <Android />}
        </>
      )
      
})