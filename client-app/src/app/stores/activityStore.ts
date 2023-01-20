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
import { SearchFormValues } from "../models/searchFormValues";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  loadingInitial = false;
  loading = false;
  day = new Date();
  uploading = false;
  

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
    if (agent.IsEDUSignedIn()) {
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
              categoryId: activity.categoryId,
              color: '',
              description: '',
              primaryLocation: '',
              leadOrg: '',
              actionOfficer: '',
              actionOfficerPhone: '',
              categoryName: '',
              eventLookup: '',
              coordinatorEmail: ''
            });
        })
      })
      return events;
     }  catch (error) {
      console.log(error);
    }
    }
  }

  getIMCalendarEvents = async(start: string, end: string) =>{
    try{
       const academicCategory = await store.categoryStore.getAcademicCalendarCategory();
       const academicEvents  = await(this.getAcademicCalendarEvents(start, end));
       const newAcademicEvents = academicEvents!.map(obj  => (
        { ...obj, categoryId: academicCategory!.id, categoryName: 'Academic Calendar' }
        ))
       const nonAcademicEvents  = await(agent.Activities.getIMCEventsByDate(start, end));
       const allEvents  = newAcademicEvents?.concat(nonAcademicEvents)
       return allEvents;
    } catch(error){
      console.log(error);
    }
  }



  getActivities = async( day : Date) =>{
    let activities : Activity[] = []
    const categoryStore = store.categoryStore;
    try{
      const categories: Category[] = await categoryStore.loadCategories();
      const axiosResponse: Activity[] = await agent.Activities.list(day); 
      runInAction(() => {
        axiosResponse.forEach(response => {
          response.start = new Date(response.start);
          response.end = new Date(response.end);
          activities.push(response);
        })
      })
      if (agent.IsEDUSignedIn()) {
        const start = store.commonStore.convertDateToGraph(store.commonStore.addDays(day, -10), true, false);
        const end = store.commonStore.convertDateToGraph(store.commonStore.addDays(day, 10), true, true);
        const graphResponse: GraphEvent[] = await agent.GraphEvents.listForCalendar(start, end);
        runInAction(() => {
          graphResponse.forEach(graphEvent => {
            const activity: Activity = this.convertGraphEventToActivity(
              graphEvent, categories.find(x => x.name === "Academic Calendar")!);
            activity.category.id = activity.categoryId
            activity.category.name = 'Academic Calendar'
            //activity.start = store.commonStore.convertUTCtoEST(activity.start)
            //activity.end = store.commonStore.convertUTCtoEST(activity.end)
           activities.push(activity);
          })
        })
      }
      return activities
    }
    catch (error) {
      console.log(error);
    }
  }

  getActivitiesBySearchParams = async(searchParams : SearchFormValues) => {
    let activities : Activity[] = [];
    const categoryStore = store.categoryStore;
    const categories: Category[] = await categoryStore.loadCategories();
    const academicCategory = await store.categoryStore.getAcademicCalendarCategory();
    const academicCategoryId = academicCategory!.id;
    try{
      
    const data = {...searchParams,
       start: searchParams.start ? format(searchParams.start, 'MM-dd-yyy') : '',
       end:  searchParams.end ? format(searchParams.end, 'MM-dd-yyy') : ''}
    const axiosResponse: Activity[] = await agent.Activities.listBySearchParams(data);
    runInAction(() => {
      axiosResponse.forEach(response => {
        response.start = new Date(response.start);
        response.end = new Date(response.end);
        activities.push(response);
      })
    })
    if (agent.IsEDUSignedIn() && 
    (!searchParams.categoryIds || !searchParams.categoryIds.length || searchParams.categoryIds.includes(academicCategoryId))
    ) {
       let graphResponse: GraphEvent[] = [];
        let filter : string = '';
        if(searchParams.start){
          const graphStart = store.commonStore.convertDateToGraph(store.commonStore.addDays(searchParams.start, -1), true, false);
          filter = `start/dateTime ge \'${graphStart}\'`
        }
        if(searchParams.end){
          const graphEnd = store.commonStore.convertDateToGraph(searchParams.end, true, true);
          if(filter){
            filter = filter + ` and end/dateTime lt \'${graphEnd}\'`
          } else{
            filter = `end/dateTime lt \'${graphEnd}\'`
          }
        }
        if(searchParams.title){
          if(filter){
            filter = filter + ` and contains(subject, \'${searchParams.title}\')`
          } else{
            filter = `contains(subject, \'${searchParams.title}\')`
          }
        }
        if(filter){
            graphResponse = await(agent.GraphEvents.listForCalendarUsingFilter(filter))
        } else {
          const start = store.commonStore.convertDateToGraph(store.commonStore.addDays(new Date(), -10), true, false);
          const end = store.commonStore.convertDateToGraph(store.commonStore.addDays(new Date(), 10), true, true);
          graphResponse = await agent.GraphEvents.listForCalendar(start, end);
        }
        runInAction(() => {
          graphResponse.forEach(graphEvent => {
            const activity: Activity = this.convertGraphEventToActivity(
              graphEvent, categories.find(x => x.name === "Academic Calendar")!);
            activity.category.id = activity.categoryId
            activity.category.name = 'Academic Calendar'
           activities.push(activity);
          })
        })
    }
    return activities
    }
    catch (error) {
      console.log(error);
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
        if (agent.IsEDUSignedIn()) {
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
          if(activity.hostingReport && activity.hostingReport.arrival){
            activity.hostingReport.arrival = new Date(activity.hostingReport.arrival);
          } 
          if(activity.hostingReport && activity.hostingReport.departure){
            activity.hostingReport.departure = new Date(activity.hostingReport.departure);
          } 
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
      hostingReport: null,
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
      type: '',
      report: 'none',
      color: '',
      dti: false,
      education: false,
      cslDirectorateCSL: false,
      cslDirectorateDSW: false,
      cslDirectorateDTI: false,
      cslDirectorateOPS: false,
      cslDirectorateSLFG: false,
      cslDirectorateFellows: false,
      pax: '',
      roomRequirementBasement: false,
      roomRequirement1: false,
      roomRequirement2: false,
      roomRequirement3: false,
      participationCmdt: false,
      participationGO: false,
      participationDir: false,
      participationForeign:	false,
      automationProjection:	false,
      automationCopiers: false,
      automationPC:	false,
      automationVTC: false,
      automationTaping:	false,
      automationComments: '',
      communicationSupport: '',
      faxClassification: '',
      communicationComments: '',
      catering: false,
      cateringAreaArdennes: false,
      cateringArea18: false,
      cateringArea22: false,
      cateringBreakArea18: false,
      cateringBreakArea22: false,
      cateringComments: '',
      transportation: '',
      parkingPasses: false,
      parkingSpaces: '',
      transportationComments: '',
      securityBadgeIssue: false,
      securityAfterDutyAccess: false,
      securityComments: '',
      registration: false,
      registrationLocation: '',
      suppliesComments: '',
      otherComments: '',
      approvedByOPS: '',
      garrisonCategory: '',
      marketingRequest: false,
      sslCategories: '',
      usahecDirectorate: '',
      usahecCalendarCategory: '',
      usahecFacilityReservationType: '',
      copyToUSAHECCalendar: false,
      pocketCalNonAcademicEvent: false,
    pocketCalWeek: '',
    pocketCalLessonNumber: '',
    pocketCalPresenter: '',
    pocketCalPresenterOrg: '',
    pocketCalNotes: '',
    imc: false,
    educationalCategory: '',
    vtcClassification: '',
    distantTechPhoneNumber:	'',
    requestorPOCContactInfo: '',
    dialInNumber: '',
    siteIDDistantEnd:	'',
    gosesInAttendance :	false,
    seniorAttendeeNameRank : '',
    additionalVTCInfo :	'',
    vtcStatus : '',
    attachmentLookup: null,
    logicalDeleteInd: false,
    deletedAt: null,
    deletedBy: ''
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

  uploadDocument = async (file: any) => {
    this.uploading = true;
    try{
      const response = await agent.Uploads.uploadDocument(file);
      const attachment = response.data;
      runInAction(() => {
        this.uploading = false;
      })
      return attachment;
    } catch(error){
      console.log(error);
      runInAction(() => {
        this.uploading = false;
      })
    }
  }



  }

