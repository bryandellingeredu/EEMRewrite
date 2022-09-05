import {  makeAutoObservable, runInAction  } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";

export default class ActivityStore  {
   activities: Activity[] = [];
   selectedActivity: Activity | undefined = undefined;
   editMode = false;
   loading = false;
   loadingInitial = false;

    constructor(){
        makeAutoObservable(this);
    }

    loadActivites = async() => {
        if(agent.IsSignedIn()){
        this.setLoadingInitial(true);
        try{
           const response : Activity[] = await agent.Activities.list();
           runInAction(() => {
           this.activities = [];
           response.forEach(activity =>{
             activity.category = 'Academic Calendar';
             activity.bodyPreview = activity.bodyPreview.split('\r')[0];
             this.activities.push(activity);
            })
           })
           this.setLoadingInitial(false);
           console.log('activities');
           console.log(this.activities);
        }catch(error){
          console.log(error);
          this.setLoadingInitial(false);
        }
    }
  }

  createActivity = async (activity: Activity) => {
    this.loading = true;
    try{
     const response =  await agent.Activities.create(activity);
     runInAction(() =>{
        console.log('id');
        console.log(response);
        const newActivity = {...response, category: activity.category, bodyPreview: activity.bodyPreview};
        this.activities.push(newActivity);
        this.selectedActivity = newActivity;
        this.editMode = false;
        this.loading = false;
     })
    }catch(error){
        console.log(error);
        runInAction(() =>{
            this.loading = false;
        })
    }
  }

  updateActivity = async (activity: Activity) => {
    this.loading = true;
    try{
      await agent.Activities.update(activity);
      runInAction(() =>{
       this.activities = [...this.activities.filter(a => a.id !== activity.id), activity];  
       this.selectedActivity = activity;
       this.editMode = false;
       this.loading = false;    
    })
    }catch(error){
        console.log(error);
        runInAction(() =>{
            this.loading = false;
        })
    }
  }

  deleteActivity = async(id: string) =>{
    this.loading = true;
    try{
      await agent.Activities.delete(id);
      runInAction(() =>{
        this.activities = [...this.activities.filter(a => a.id !== id)]; 
        if(this.selectedActivity?.id === id) this.cancelSelectedActivity();
       this.loading = false;
      })
    }
    catch(error){
        console.log(error);
        runInAction(() =>{
            this.loading = false;
        })
    }
  }

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;

  selectActivity = (id: string) => this.selectedActivity = this.activities.find(x => x.id === id);
  
  cancelSelectedActivity = () => this.selectedActivity = undefined;

  openForm = (id?: string) => {
    id ? this.selectActivity(id) : this.cancelSelectedActivity();
    this.editMode = true;
  }

  closeForm = () => this.editMode = false;

}