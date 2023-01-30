import { EmailGroup } from "../models/emailGroup";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";


export default class EmailGroupStore {
    emailGroupRegistry = new Map<string, EmailGroup>();
    loadingInitial = false;

    constructor() {
        makeAutoObservable(this);
      }

      get emailGroups() {
        return Array.from(this.emailGroupRegistry.values()).sort((a, b) =>
        a.name > b.name ? 1 : -1);
      }

      loadEmailGroups = async () => {
        if (!this.emailGroupRegistry.size) {
            this.setLoadingInitial(true); 
            try{
                const axiosResponse : EmailGroup[] = await agent.EmailGroups.list();
                runInAction(() => {
                axiosResponse.forEach(response => {
                    this.emailGroupRegistry.set(response.id, response);
                  })   
                })          
            } catch (error) {
              console.log(error);
             
            } finally  {
                this.setLoadingInitial(false);
                console.log('emailGroups')
            }
        } else {
            console.log('emailGroups')
        }
      }

      setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}