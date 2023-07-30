import { useEffect, useState } from 'react';
import FullScreenEnlistedAideCalendar from './fullScreenEnlistedAideCalendar';
import MobileEnlistedAideCalendar from './mobileEnlistedAideCalendar';
export default function EnlistedAideCalendarWrapper(){
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
        <div>
            {!isMobile && <FullScreenEnlistedAideCalendar />}
            {isMobile && <MobileEnlistedAideCalendar />}
        </div>
      )
      
}