import { GraphScheduleItem } from "./graphScheduleItem"


export interface GraphScheduleResponse{
    availabilityView: string
    scheduleId: string
    scheduleItems: GraphScheduleItem[]
}

