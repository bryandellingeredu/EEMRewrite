import { GraphActivityDate } from "./graphActivityDate"

export interface GraphScheduleRequest{
    Schedules: string[]
    StartTime: GraphActivityDate
    EndTime: GraphActivityDate
    availabilityViewInterval: string
}