import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { GraphEvent } from "../models/graphEvent";
import { Activity } from "../models/activity";
import { CalendarEvent } from "../models/calendarEvent"
import { GraphBody } from "../models/graphBody";
import { GraphActivityDate } from "../models/graphActivityDate";
import { format } from "date-fns";
import { store } from "./store";
import { Category } from "../models/category";
import { GraphLocation } from "../models/graphLocation";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  loadingInitial = false;
  loading = false;
  day = new Date();
  

  constructor() {
    makeAutoObservable(this);
  }

  get activities() {
    return Array.from(this.activityRegistry.values()).sort((a, b) =>
      a.start!.getTime() - b.start!.getTime());
  }



  get groupedActivities() {
    return Object.entries(
      this.activities.reduce((activities, activity) => {
        const date = format(activity.start!, 'dd MMM yyyy');
        activities[date] = activities[date] ? [...activities[date], activity] : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    )
  }


  getActivityIdByRoom = async(title: string, startStr: string, endStr: string)  =>{
    try{
      const activity: Activity = await agent.Activities.getByRoom(title, startStr, endStr)
      if(activity && activity.id !== "00000000-0000-0000-0000-000000000000"){
      this.setActivity(activity);
      return activity;
      }
    }catch(error){
      console.log(error);
    }
  }

  getAcademicCalendarEvents = async (start: string, end: string) => {
    const startArray = start.split('T');
    const endArray = end.split('T');
    const startForGraph = `${startArray[0]}T00:00:00Z`;
    const endForGraph = `${endArray[0]}T00:00:00Z`;
    if (agent.IsSignedIn()) {
     try{
      const events: CalendarEvent[] = [];
      const categoryStore = store.categoryStore;
      const categories: Category[] = await categoryStore.loadCategories();  
      const graphResponse: GraphEvent[] = await agent.GraphEvents.listForCalendar(startForGraph, endForGraph);
      runInAction (() => {
        graphResponse.forEach(graphEvent => {
          const activity: Activity = this.convertGraphEventToActivity(
            graphEvent, categories.find(x => x.name === "Academic Calendar")!);
            events.push({
              title: activity.title,
              start: activity.start,
              end: activity.end,
              allDay: activity.allDayEvent,
              id: activity.id,
              categoryId: activity.categoryId
            });
        })
      })
      return events;
     }  catch (error) {
      console.log(error);
    }
    }
  }

  loadActivites = async (day? : Date) => {
    if (typeof day !== 'undefined') {
      debugger;
      this.day = day;
  }
    const categoryStore = store.categoryStore;
      this.setLoadingInitial(true);
      try { 
        const categories: Category[] = await categoryStore.loadCategories();  
        const axiosResponse: Activity[] = await agent.Activities.list(this.day);
        this.activityRegistry.clear();
        runInAction(() => {
          axiosResponse.forEach(response => {
            response.start = new Date(response.start);
            response.end = new Date(response.end);
            this.activityRegistry.set(response.id, response);
          })
        })
        if (agent.IsSignedIn()) {
          const start = store.commonStore.convertDateToGraph(store.commonStore.addDays(this.day, -10), true, false);
          const end = store.commonStore.convertDateToGraph(store.commonStore.addDays(this.day, 10), true, true);
          const graphResponse: GraphEvent[] = await agent.GraphEvents.listForCalendar(start, end);
          runInAction(() => {
            graphResponse.forEach(graphEvent => {
              const activity: Activity = this.convertGraphEventToActivity(
                graphEvent, categories.find(x => x.name === "Academic Calendar")!);
              this.activityRegistry.set(activity.id, activity);
            })
          })
        }
        this.setLoadingInitial(false);
      } catch (error) {
        console.log(error);
        this.setLoadingInitial(false);
      }
  }

  loadActivity = async (id: string, categoryId: string) => {
      this.loadingInitial = true;
      try {
        const categoryStore = store.categoryStore;
        const categories: Category[] = await categoryStore.loadCategories();
        const category = categories.find(x => x.id === categoryId)!;
        if (category.name === "Academic Calendar") {
        const  activity = this.convertGraphEventToActivity(
            await agent.GraphEvents.details(id), category);
          this.activityRegistry.set(activity.id, activity);
          runInAction(() => {
            this.setLoadingInitial(false);
            this.selectedActivity = activity;
          })
          return activity;
        } else {
          const activity = await agent.Activities.details(id);
          activity.start = new Date(activity.start);
          activity.end = new Date(activity.end);
          this.activityRegistry.set(activity.id, activity);
          runInAction(() => {
            this.setLoadingInitial(false);
            this.selectedActivity = activity;
          })
          return activity;
        }
      } catch (error) {
        console.log(error)
        this.setLoadingInitial(false);
      }  
  }


  private setActivity = (activity: Activity) => {
    this.activityRegistry.set(activity.id, activity);
  }

  updateGraphEvent = async (activity: Activity) => {
    const graphEvent: GraphEvent = this.convertActivityToGraphEvent(activity)
    try {
      await agent.GraphEvents.update(graphEvent);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
      })
    } catch (error) {
      console.log(error);
    }
  }

  createGraphEvent = async (activity: Activity) => {
    const graphEvent: GraphEvent = this.convertActivityToGraphEvent(activity);
    try {
      const response = await agent.GraphEvents.create(graphEvent);
      activity.id = response.id;
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
      });
      return activity;
    }
    catch (error) {
      console.log(error);
    }
  }

  createActivity = async (activity: Activity) => {
    try {
      await agent.Activities.create(activity);
      await this.loadActivites();
      const newActivity  = await this.loadActivity(activity.id, activity.category.id )
      runInAction(() => {
      if(newActivity){
        this.setActivity(newActivity );
      }
      })
      runInAction(() => {
        this.selectedActivity = activity;
      })
    } catch (error) {
      console.log(error);
    }
  }

  updateActivity = async (activity: Activity, manageSeries: string) => {
    if(!manageSeries || manageSeries === 'false')
    {
    try {
      await agent.Activities.update(activity, activity.id);
      this.activityRegistry.delete(activity.id);
      const newActivity  = await this.loadActivity(activity.id, activity.category.id )
      runInAction(() => {
        if (newActivity && newActivity.id) {
          this.activityRegistry.set(newActivity.id, newActivity as Activity);
          this.selectedActivity = newActivity as Activity;
        }
      })
    } catch (error) {
      console.log(error);
    }
  } else {
    try{
      await agent.Activities.updateSeries(activity, activity.id);
      await this.loadActivites();
      const updatedActivity  = await this.loadActivity(activity.id, activity.category.id )
      runInAction(() => {
        if(updatedActivity){
          this.setActivity(updatedActivity );
        }
        })
        runInAction(() => {
          this.selectedActivity = updatedActivity;
        })
    } catch (error) {
      console.log(error);
    }
  }
}


  

  convertActivityToGraphEvent(activity: Activity): GraphEvent {
    const body: GraphBody = { contentType: 'Html', content: activity.description }
    const start: GraphActivityDate = { 
      dateTime: store.commonStore.convertDateToGraph(activity.end, activity.allDayEvent, false),
      timeZone: 'UTC' }
    const end: GraphActivityDate = {
       dateTime: store.commonStore.convertDateToGraph(activity.end, activity.allDayEvent, true),
       timeZone: 'UTC' }
    const location : GraphLocation ={
      displayName: activity.primaryLocation
    }
    return {
      id: activity.id || '',
      subject: activity.title,
      bodyPreview: activity.description,
      body,
      start,
      end,
      isAllDay: activity.allDayEvent,
      location
    }
  }

  convertGraphEventToActivity(graphEvent: GraphEvent, category: Category): Activity {
    const activity: Activity = {
      id: graphEvent.id,
      title: graphEvent.subject,
      description: graphEvent.bodyPreview,
      category,
      categoryId: category.id,
      organization: null,
      organizationId: null,
      actionOfficer: '',
      actionOfficerPhone: '',
      start: graphEvent.isAllDay ? 
      store.commonStore.addDays(store.commonStore.convertUTCtoEST(new Date(graphEvent.start.dateTime)),1) :
      store.commonStore.convertUTCtoEST(new Date(graphEvent.start.dateTime)),
      end: graphEvent.isAllDay ? 
      store.commonStore.addDays(store.commonStore.convertUTCtoEST(new Date(graphEvent.end.dateTime)),1) :
      store.commonStore.convertUTCtoEST(new Date(graphEvent.end.dateTime)),
      allDayEvent: graphEvent.isAllDay,
      primaryLocation: graphEvent.location?.displayName || '',
      roomEmails: [],
      startDateAsString: graphEvent.start.dateTime,
      endDateAsString: graphEvent.end.dateTime,
      coordinatorEmail: graphEvent.organizer?.emailAddress.address || '',
      coordinatorFirstName: '',
      coordinatorLastName: '',
      coordinatorName: graphEvent.organizer?.emailAddress.name || '',
      activityRooms: [],
      eventLookup: graphEvent.id,
      recurrenceInd: false,
      recurrenceId: '',
      recurrence: null,
      numberAttending: '',
      roomSetUp: '',
      vtc: false,
      phoneNumberForRoom: '',
      roomSetUpInstructions: '',
      g5Calendar: false,
      g5Organization: '',
      hyperlink: '',
      hyperlinkDescription: '',
      eventClearanceLevel : '',
      communityEvent: false,
      checkedForOpsec: false,
      commandantRequested: false,
      dptCmdtRequested: false,
      provostRequested: false,
      cofsRequested: false,
      deanRequested: false,
      ambassadorRequested:  false,
      cSMRequested: false,
      mfp: false,
      report: 'none'
    }
    return activity;
  }

  deleteGraphEvent = async (id: string) => {
    this.loading = true;
    try {
      await agent.GraphEvents.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id);
        this.loading = false;
      })
    }
    catch (error) {
      console.log(error);
      this.loading = false;
    }
  }

  setLoadingInitial = (state: boolean) => this.loadingInitial = state;

  }

