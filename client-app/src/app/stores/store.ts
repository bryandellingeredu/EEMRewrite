import ActivityStore from "./activityStore";
import { createContext, useContext} from "react";
import CommonStore from "./commonStore";
import CategoryStore from "./categoryStore";
import OrganizationStore from "./organizationStore";
import LocationStore from "./locationStore";
import GraphRoomStore from "./graphRoomStore";
import AvailabilityStore from "./availabilityStore";

interface Store{
    activityStore: ActivityStore
    commonStore: CommonStore
    categoryStore: CategoryStore,
    organizationStore: OrganizationStore,
    locationStore: LocationStore,
    graphRoomStore: GraphRoomStore,
    availabilityStore: AvailabilityStore
}

export const store: Store = {
    activityStore: new ActivityStore(),
    commonStore: new CommonStore(),
    categoryStore: new CategoryStore(),
    organizationStore: new OrganizationStore(),
    locationStore: new LocationStore(),
    graphRoomStore: new GraphRoomStore(),
    availabilityStore: new AvailabilityStore()   
}

export const StoreContext = createContext(store);

export function useStore(){
    return useContext(StoreContext);
}