import { ActivityDate } from "./activityDate"

export interface Activity{
    id: string
    subject: string
    bodyPreview: string
    start: ActivityDate
    end: ActivityDate
    category: string
}