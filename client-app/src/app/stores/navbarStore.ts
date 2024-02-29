import { makeAutoObservable } from "mobx"

export default class NavbarStore{
    navbarType = '';
    page = 'calendar';
    icalUrl = '';
    calendarName = '';

    constructor() {
        makeAutoObservable(this)
    }

    setNavbarTypeFromUrl = (url: string) => {
        if(url.toLowerCase().endsWith('eem/studentcalendar') ){
            this.setNavbarType('studentCalendar');
            this.setICALUrl('webcal://apps.armywarcollege.edu/eem/api/SyncCalendar/studentCalendar.ics');
            this.setCalendarName('Student Calendar');
        } else if(url.toLowerCase().endsWith('eem/msfp')){
            this.setNavbarType('msfp');
            this.setICALUrl('webcal://apps.armywarcollege.edu/eem/api/SyncCalendar/militaryFamilyAndSpouseProgram.ics');
            this.setCalendarName('Military Spouse and Family Program Calendar');
        }
        else if(url.toLowerCase().endsWith('eem/community')){
            this.setNavbarType('community');
            this.setICALUrl('webcal://apps.armywarcollege.edu/eem/api/SyncCalendar/community.ics');
            this.setCalendarName('Community Calendar');
        }
         else{
            this.setNavbarType('eem');
        }
    }

    setPage = (page: string) => {
        this.page = page;
    }

    private setNavbarType = (type: string) => {
        this.navbarType = type;
      }

      private setICALUrl = (url: string) => {
        this.icalUrl = url;
      }

      private setCalendarName = (name: string) => {
        this.calendarName = name;
      }
}