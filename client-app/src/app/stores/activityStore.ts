import {  makeAutoObservable, runInAction  } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";

export default class ActivityStore  {
   activityRegistry = new Map<string, Activity>();
   selectedActivity: Activity | undefined = undefined;
   editMode = false;
   loading = false;
   loadingInitial = true;

    constructor(){
        makeAutoObservable(this);
    }

    /*get activitiesByDate(){
      return Array.from(this.activityRegistry.values()).sort((a, b) =>
       Date.parse(a.start.dateTime) - Date.parse(b.start.dateTime));
    }*/

    get activities(){
      return Array.from(this.activityRegistry.values());
    }

    loadActivites = async() => {
      this.setLoadingInitial(true);
        if(agent.IsSignedIn()){
        try{
           const response : Activity[] = await agent.Activities.list();
           runInAction(() => {
           this.activityRegistry.clear();
           response.forEach(activity =>{
             activity.category = 'Academic Calendar';
             activity.bodyPreview = activity.bodyPreview.split('\r')[0];
             this.activityRegistry.set(activity.id, activity);
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

  loadActivity = async(id: string) =>{

    this.setLoadingInitial(true);
      try{
      const activity = await agent.Activities.details(id);
       if(activity){
        activity.category = 'Academic Calendar';
        activity.bodyPreview = activity.bodyPreview.split('\r')[0];
        this.setActivity(activity);
        runInAction(() =>{
          this.selectedActivity = activity;
        })    
        this.setLoadingInitial(false);
        return activity;
       }     
      }catch(error){
        console.log(error)
        this.setLoadingInitial(false);
      }
  }

   private setActivity = (activity: Activity) => this.activityRegistry.set(activity.id, activity);

  createActivity = async (activity: Activity) => {
    this.loading = true;
    try{
     const response =  await agent.Activities.create(activity);
     runInAction(() =>{
        console.log('response');
        console.log(response);
        this.activityRegistry.set(activity.id, activity);
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

  updateActivity = async (activity: Activity) => {
    this.loading = true;
    try{
      await agent.Activities.update(activity);
      runInAction(() =>{
       this.activityRegistry.set(activity.id, activity);
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
        this.activityRegistry.delete(id);
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

}