import { Category } from "../models/category";
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { OptionStyles } from "@fluentui/web-components";

export default class CategoryStore {
    categoryRegistry = new Map<string, Category>();
    loadingInitial = false;


constructor() {
    makeAutoObservable(this);
  }

  get categories() {
    return Array.from(this.categoryRegistry.values()).sort((a, b) =>
    a.name > b.name ? 1 : -1);
  }

  get categoryOptions () {
    const options : any = [];
    this.categories.forEach(category => {
        options.push({text: category.name, value: category.id })
    });
    return options
  }

  loadCategories = async () => {
    if (!this.categoryRegistry.size) {
        this.setLoadingInitial(true); 
        try{
            const axiosResponse : Category[] = await agent.Categories.list();
            axiosResponse.forEach(response => {
                this.categoryRegistry.set(response.id, response);
              })            
        } catch (error) {
          console.log(error);
         
        } finally  {
            this.setLoadingInitial(false);
            return this.categories;
        }
    } else {
        return this.categories;
    }
  }

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}