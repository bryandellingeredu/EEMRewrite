import { GraphActivityDate } from "./graphActivityDate"

export interface GraphScheduleItem {
    end: GraphActivityDate
    isPrivate: boolean
    location: string
    start: GraphActivityDate
    status: string
    subject: string
    isMeeting: boolean
    isRecurring: boolean
    isException: boolean
    isReminderSet: boolean
}