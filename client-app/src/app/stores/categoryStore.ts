import { Category } from "../models/category";
import { makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";

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
    options.push({ text: ' ', value: this.categories.find(x => x.name === 'Other')?.id });
    this.categories.forEach(category => {
        if (category.name !== 'Other' && category.name != 'USAHEC Calendar') {
            options.push({
               text: category.name === 'Academic Calendar' ? 'Student Calendar Academic Year 2023' :
                     category.name === 'Academic IMC Event' ? 'Faculty Calendar' :
                     category.name === 'Military Family and Spouse Program' ? 'Military Spouse and Family Program' :
                     category.name === 'USAHEC Facilities Usage Calendar' ? 'USAHEC Calendar' :
                     category.name === 'SSL Calendar' ? 'SSL Admin Calendar' : category.name,
            value: category.id });
        }
    });
    return options
  }

  loadCategories = async () => {
    if (!this.categoryRegistry.size) {
        this.setLoadingInitial(true); 
        try{
            const axiosResponse : Category[] = await agent.Categories.list();
            runInAction(() => {
            axiosResponse.forEach(response => {
                this.categoryRegistry.set(response.id, response);
              })   
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

  getAcademicCalendarCategory = async() => {
    try{
       const categories = await this.loadCategories();
       const academicCategory = categories.find(x => x.name === 'Academic Calendar');
       return academicCategory;
    } catch(error){
      console.log(error);
    }
  }

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;
}