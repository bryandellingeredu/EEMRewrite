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

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  loadingInitial = false;
  loading = false;
  reloadActivities = false;
  

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
       : activity.start,
      end: activity.allDayEvent
       ? format(this.addDays(activity.end,1), 'yyyy-MM-dd')
       : activity.end,
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

  get cslEvents() {
    const categoryStore = store.categoryStore;
    const { categories } = categoryStore;
    const cslCalendarCategory = categories.find(
      x => x.name === 'CSL Calendar');
    return this.events.filter(x => x.categoryId === cslCalendarCategory?.id)
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

  addDays = (date : Date, days: number) => {
    var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
  }


  loadActivites = async () => {
    const categoryStore = store.categoryStore;
      this.setLoadingInitial(true);
      try { 
        const categories: Category[] = await categoryStore.loadCategories();  
        const axiosResponse: Activity[] = await agent.Activities.list();
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
    let activity = this.getActivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.loadingInitial = true;
      this.setReloadActivities(true);
      try {
        const categoryStore = store.categoryStore;
        const categories: Category[] = await categoryStore.loadCategories();
        const category = categories.find(x => x.id === categoryId)!;
        if (category.name === "Academic Calendar") {
          activity = this.convertGraphEventToActivity(
            await agent.GraphEvents.details(id), category);
          this.activityRegistry.set(activity.id, activity);
          runInAction(() => {
            this.setLoadingInitial(false);
            this.selectedActivity = activity;
          })
        } else {
          activity = await agent.Activities.details(id);
          activity.start = new Date(activity.start);
          activity.end = new Date(activity.end);
          this.activityRegistry.set(activity.id, activity);
          runInAction(() => {
            this.setLoadingInitial(false);
            this.selectedActivity = activity;
          })
        }

        return activity;
      } catch (error) {
        console.log(error)
        this.setLoadingInitial(false);
      }
    }
  }


  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
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
      this.setActivity(activity);
      runInAction(() => {
        this.selectedActivity = activity;
      })
    } catch (error) {
      console.log(error);
    }
  }

  updateActivity = async (activity: Activity) => {
    debugger;
    try {
      await agent.Activities.update(activity, activity.id);
      runInAction(() => {
        if (activity.id) {
          let updatedActivity = { ...this.getActivity(activity.id), ...activity }
          this.activityRegistry.set(activity.id, updatedActivity as Activity);
          this.selectedActivity = updatedActivity as Activity;
        }
      })
    } catch (error) {
      console.log(error);
    }
  }


  convertDateToGraph = (date: Date): string => {
    const isoStringDate = date.toISOString().split('T')[0];
    const hour = ("0" + date.getHours()).slice(-2);
    const minute = ("0" + date.getMinutes()).slice(-2);
    const convertedDate = `${isoStringDate}T${hour}:${minute}:00.0000000`
    return convertedDate;
  }

  convertActivityToGraphEvent(activity: Activity): GraphEvent {
    const body: GraphBody = { contentType: 'Html', content: activity.description }
    const start: GraphActivityDate = { dateTime: this.convertDateToGraph(activity.start), timeZone: 'UTC' }
    const end: GraphActivityDate = { dateTime: this.convertDateToGraph(activity.end), timeZone: 'UTC' }
    return {
      id: activity.id || '',
      subject: activity.title,
      bodyPreview: activity.description,
      body,
      start,
      end
    }
  }

  convertGraphEventToActivity(graphEvent: GraphEvent, category: Category): Activity {
    const activity: Activity = {
      id: graphEvent.id,
      title: graphEvent.subject,
      description: graphEvent.bodyPreview,
      category,
      categoryId: category.id,
      start: new Date(graphEvent.start.dateTime),
      end: new Date(graphEvent.end.dateTime),
      allDayEvent: false
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

