import { CSLCalendarLegend } from "../models/cslCalendarLegend";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";

export default class CSLCalendarLegendStore {
    legendRegistry = new Map<string, CSLCalendarLegend>();
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
                const axiosResponse : CSLCalendarLegend[] = await agent.CSLLegend.list();
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
