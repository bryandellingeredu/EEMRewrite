import { makeAutoObservable } from "mobx"

export default class NavbarStore{
    navbarType = 'eem';
    page = 'calendar';

    constructor() {
        makeAutoObservable(this)
    }

    setNavbarTypeFromUrl = (url: string) => {
        if(url.toLowerCase().endsWith('eem/studentcalendar')){
            this.setNavbarType('studentCalendar');
        } else if(url.toLowerCase().endsWith('eem/msfp')){
            this.setNavbarType('msfp');
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
}