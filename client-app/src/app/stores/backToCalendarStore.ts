import { makeAutoObservable, runInAction} from "mobx";
import { BackToCalendarInfo } from "../models/backToCalendarInfo";

export default class BackToCalendarStore {
    backToCalendarRegistry = new Map<string, BackToCalendarInfo>();
    
    constructor() {
        makeAutoObservable(this);
      }

      addBackToCalendarInfoRecord = (record: BackToCalendarInfo) =>
       this.backToCalendarRegistry.set(record.id, record);

       getBackToCalendarInfoRecord = (id: string): BackToCalendarInfo | undefined => {
        return this.backToCalendarRegistry.get(id);
    }
}