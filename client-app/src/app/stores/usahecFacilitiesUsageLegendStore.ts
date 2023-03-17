import { USAHECFacilitiesUsageLegend } from "../models/usahecFacilitiesUsageLegend";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";

export default class USAHECFacilitiesUsageLegendStore {
    legendRegistry = new Map<string, USAHECFacilitiesUsageLegend>();
    loadingInitial = false;

    constructor() {
        makeAutoObservable(this);
      }

      get legend() {
        return Array.from(this.legendRegistry.values()).sort((a, b) =>
        a.name > b.name ? 1 : -1);
      }

      loadLegend = async () => {
        if (!this.legendRegistry.size) {
            this.setLoadingInitial(true); 
            try{
                const axiosResponse : USAHECFacilitiesUsageLegend[] = await agent.USAHECFacilitiesUsageCalendarLegend.list();
                runInAction(() => {
                axiosResponse.forEach(response => {
                    this.legendRegistry.set(response.id, response);
                  })   
                })          
            } catch (error) {
              console.log(error);
             
            } finally  {
                this.setLoadingInitial(false);
                return this.legend;
            }
        } else {
            return this.legend;
        }
      }
    
      setLoadingInitial = (state: boolean) => this.loadingInitial = state;
    
}
