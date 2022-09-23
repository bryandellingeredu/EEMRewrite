import { Organization } from "../models/organization";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";

export default class OrganizationStore {
    organizationRegistry = new Map<string, Organization>();
    loadingInitial = false;

constructor() {
    makeAutoObservable(this);
  }

  get organizations() {
    return Array.from(this.organizationRegistry.values()).sort((a, b) =>
    a.name > b.name ? 1 : -1);
  }

  get organizationOptions () {
    const options : any = [];
    this.organizations.forEach(organization => {
        options.push({text: organization.name, value: organization.id })
    });
    return options
  }

  loadOrganizations = async () => {
    if (!this.organizationRegistry.size) {
        this.setLoadingInitial(true); 
        try{
            const axiosResponse : Organization[] = await agent.Organizations.list();
            runInAction(() => {
            axiosResponse.forEach(response => {
                this.organizationRegistry.set(response.id, response);
              })   
            })          
        } catch (error) {
          console.log(error);
         
        } finally  {
            this.setLoadingInitial(false);
            return this.organizations;
        }
    } else {
        return this.organizations;
    }
  }

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}