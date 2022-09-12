import {  makeAutoObservable, runInAction  } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { CalendarEvent } from "../models/calendarEvent"

export default class ActivityStore  {
   activityRegistry = new Map<string, Activity>();
   selectedActivity: Activity | undefined = undefined;
   editMode = false;
   loading = false;
   loadingInitial = true;
   events: CalendarEvent[] = []

    constructor(){
        makeAutoObservable(this);
    }

    get activities(){
      return Array.from(this.activityRegistry.values());
    }

    

    get groupedActivities(){
      return Object.entries(
        this.activities.reduce((activities, activity) =>{
          const date = activity.start.dateTime.split('T')[0];
          activities[date] = activities[date] ? [...activities[date], activity] : [activity]
          return activities;
        }, {} as {[key: string]: Activity[]})
      )
    }

    loadActivites = async() => {
      if(!this.activityRegistry.size){
      this.setLoadingInitial(true);
        if(agent.IsSignedIn()){
        try{
           const graphResponse : Activity[] = await agent.Activities.list();
           const roomResponse : Activity[] = await agent.RoomActivities.list();
           runInAction(() => {
           this.activityRegistry.clear();
           graphResponse.forEach(activity =>{
             activity.category = 'Academic Calendar';
             this.activityRegistry.set(activity.id, activity);
            })
            roomResponse.forEach(activity =>{
              activity.category = activity.location?.displayName || 'Academic Calendar';
              this.activityRegistry.set(activity.id, activity);
             })
           })
           debugger;
           this.getEvents();
           this.setLoadingInitial(false);
        }catch(error){
          console.log(error);
          this.setLoadingInitial(false);
        }
    }
  }
}

  loadActivity = async(id: string, email: string) =>{
    let activity = this.getActivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
  } else {
    this.setLoadingInitial(true);
      try{
      if (email && email !== 'undefined'){
        let activity = await agent.RoomActivities.details(email, id);
        const category = activity.location?.displayName || 'Unknown';     
        this.processLoadActivity(activity, category);
        return activity;
      } else {
        let activity = await agent.Activities.details(id);
        this.processLoadActivity(activity, 'Academic Calendar');
        return activity;
      }         
      }catch(error){
        console.log(error)
        this.setLoadingInitial(false);
      }
  }}

  
  processLoadActivity(activity: Activity, category: string){    
    if(activity){
      activity.category = category;
      this.setActivity(activity);
      runInAction(() =>{
        this.selectedActivity = activity;
      })    
      this.setLoadingInitial(false);
      return activity;
     } 
  }

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
}



   private setActivity = (activity: Activity) => this.activityRegistry.set(activity.id, activity);

  createActivity = async (activity: Activity) => {
    this.loading = true;
    try{
     const response =  await agent.Activities.create(activity);
     runInAction(() =>{
        console.log('response');
        console.log(response);
        activity.id = response.id;
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
        this.loading = false;
     });
     return activity;
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

  getEvents = () => {
    debugger;
    console.log('activities')
    console.log(this.activities)
     this.events = [];
     this.activities.forEach(activity => 
      {
        this.events.push({title: activity.subject, date: new Date(activity.start.dateTime)})
      });
      console.log('events');
      console.log(this.events);
  }

}