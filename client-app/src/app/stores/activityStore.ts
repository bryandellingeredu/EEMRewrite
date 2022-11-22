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
import { string } from "yup";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  loadingInitial = false;
  loading = false;
  reloadActivities = false;
  day = new Date();
  

  constructor() {
    makeAutoObservable(this);
  }

  get activities() {
    return Array.from(this.activityRegistry.values()).sort((a, b) =>
      a.start!.getTime() - b.start!.getTime());
  }

  get events () {
   const events: CalendarEvent[] = [];
  /* events.push(	{
  id: '1',
  title: 'Long Event',
   start: '2022-09-07',
   end: '2022-09-10',
   categoryId: '65fb3e98-6877-464d-9c6b-13b00588c35a',
  allDay: true}) */
  this.activities.forEach(activity => {
    events.push({
      title: activity.title,
      start: activity.allDayEvent
       ? format(activity.start, 'yyyy-MM-dd')
       : `${format(activity.start, 'yyyy-MM-dd')}`,
      end: activity.allDayEvent
       ? format(activity.end, 'yyyy-MM-dd')
       : `${format(activity.end, 'yyyy-MM-dd')}`,
      allDay: activity.allDayEvent,
      id: activity.id,
      categoryId: activity.categoryId
    });
  }); 
    return events;
  }

  get academicEvents() {
    const categoryStore = store.categoryStore;
    const { categories } = categoryStore;
    const academicCalendarCategory = categories.find(
      x => x.name === 'Academic Calendar');
    return this.events.filter(x => x.categoryId === academicCalendarCategory?.id)
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


  subtractMinutes  = (dt: Date, minutes: number) : Date => {
    dt.setMinutes( dt.getMinutes() - minutes );
    return dt
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
              start: store.commonStore.convertDateToGraph(activity.start, activity.allDayEvent, false),
              end: store.commonStore.convertDateToGraph(activity.start, activity.allDayEvent, true),
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
          const graphResponse: GraphEvent[] = await agent.GraphEvents.list();
          runInAction(() => {
            graphResponse.forEach(graphEvent => {
              const activity: Activity = this.convertGraphEventToActivity(
                graphEvent, categories.find(x => x.name === "Academic Calendar")!);
              this.activityRegistry.set(activity.id, activity);
            })
          })
        }
       // this.populateEventsForFullCalendar();
        this.setLoadingInitial(false);
        this.setReloadActivities(false);
      } catch (error) {
        console.log(error);
        this.setLoadingInitial(false);
      }
  }

  loadActivity = async (id: string, categoryId: string) => {
      this.loadingInitial = true;
      this.setReloadActivities(true);
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
      debugger;
      await agent.Activities.create(activity);
      const loadEvents = await this.loadActivites();
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
      const loadEvents = await this.loadActivites();
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
      start: new Date(graphEvent.start.dateTime),
      end: graphEvent.isAllDay ? this.subtractMinutes(new Date(graphEvent.end.dateTime),1) : new Date(graphEvent.end.dateTime),
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
      recurrence: null
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

  setReloadActivities = (state: boolean) => this.reloadActivities = state;

  }

