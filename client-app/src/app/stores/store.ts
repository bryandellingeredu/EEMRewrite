import ActivityStore from "./activityStore";
import { createContext, useContext} from "react";
import CommonStore from "./commonStore";
import CategoryStore from "./categoryStore";
import OrganizationStore from "./organizationStore";
import LocationStore from "./locationStore";
import GraphRoomStore from "./graphRoomStore";
import AvailabilityStore from "./availabilityStore";
import GraphUserStore from "./graphUserStore";
import ModalStore from "./modalStore";
import UserStore from "./userStore";
import EmailGroupStore from "./emailGroupStore";
import CSLCalendarLegendStore from "./cslCalendarLegendStore";
import USAHECFacilitiesUsageLegendStore from "./usahecFacilitiesUsageLegendStore";
import NavbarStore from "./navbarStore";
import BackToCalendarStore from "./backToCalendarStore";

interface Store{
    activityStore: ActivityStore
    commonStore: CommonStore
    categoryStore: CategoryStore
    organizationStore: OrganizationStore
    locationStore: LocationStore
    graphRoomStore: GraphRoomStore
    availabilityStore: AvailabilityStore
    graphUserStore: GraphUserStore
    modalStore: ModalStore
    userStore: UserStore
    emailGroupStore: EmailGroupStore
    cslCalendarLegendStore: CSLCalendarLegendStore
    usahecFacilitiesUsageLegendStore: USAHECFacilitiesUsageLegendStore
    navbarStore: NavbarStore
    backToCalendarStore: BackToCalendarStore
}

export const store: Store = {
    activityStore: new ActivityStore(),
    commonStore: new CommonStore(),
    categoryStore: new CategoryStore(),
    organizationStore: new OrganizationStore(),
    locationStore: new LocationStore(),
    graphRoomStore: new GraphRoomStore(),
    availabilityStore: new AvailabilityStore(),
    graphUserStore: new GraphUserStore(), 
    modalStore: new ModalStore(),
    userStore: new UserStore(),
    emailGroupStore: new EmailGroupStore(),
    cslCalendarLegendStore: new CSLCalendarLegendStore(),
    usahecFacilitiesUsageLegendStore: new USAHECFacilitiesUsageLegendStore(),
    navbarStore: new NavbarStore(),
    backToCalendarStore: new BackToCalendarStore(),
}

export const StoreContext = createContext(store);

export function useStore(){
    return useContext(StoreContext);
}