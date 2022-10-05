import {GraphUser} from "../models/graphUser"
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";

export default class GraphUserStore {
    graphUser: GraphUser | undefined = undefined;
    loadingInitial = false;

    constructor() {
        makeAutoObservable(this);
      }

      loadUser = async () => {
        if(!agent.IsSignedIn){
           this.graphUser = undefined;
           return this.graphUser;
        }
        if (!this.graphUser) {
            this.setLoadingInitial(true); 
            try{
                const graphResponse: GraphUser = await agent.GraphUser.details();
                runInAction(() => {
                this.graphUser = graphResponse
                  })          
            } catch (error) {
              console.log(error);            
            } finally  {
                this.setLoadingInitial(false);
                return this.graphUser;
            }
        } else {
            return this.graphUser;
        }
      }

      setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}