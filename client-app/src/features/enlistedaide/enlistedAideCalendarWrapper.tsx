import { useEffect, useState } from 'react';
import FullScreenEnlistedAideCalendar from './fullScreenEnlistedAideCalendar';
import MobileEnlistedAideCalendar from './mobileEnlistedAideCalendar';
import { useParams } from 'react-router-dom';
export default function EnlistedAideCalendarWrapper(){
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { backToCalendarId } = useParams<{ backToCalendarId?: string }>();
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
            {!isMobile && <FullScreenEnlistedAideCalendar backToCalendarId = {backToCalendarId} />}
            {isMobile && <MobileEnlistedAideCalendar />}
        </div>
      )
      
}