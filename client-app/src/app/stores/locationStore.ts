import { Location } from "../models/location";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";

export default class LocationStore {
    locationRegistry = new Map<string, Location>();
    loadingInitial = false;

constructor() {
    makeAutoObservable(this);
  }

  get locations() {
    return Array.from(this.locationRegistry.values()).sort((a, b) =>
    a.name > b.name ? 1 : -1);
  }

  get locationOptions () {
    const options : any = [];
    this.locations.forEach(location => {
        options.push(location.name)
    });
    return options;
  }

  loadLocations = async () => {
    if (!this.locationRegistry.size) {
        this.setLoadingInitial(true); 
        try{
            const axiosResponse : Location[] = await agent.Locations.list();
            runInAction(() => {
            axiosResponse.forEach(response => {
                this.locationRegistry.set(response.id, response);
              })   
            })          
        } catch (error) {
          console.log(error);
         
        } finally  {
            this.setLoadingInitial(false);
            return this.locations;
        }
    } else {
        return this.locations;
    }
  }

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}