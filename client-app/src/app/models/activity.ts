import { ActivityDate } from "./activityDate"
import { Attendee } from "./attendee"

export interface Activity{
    id: string
    subject: string
    bodyPreview: string
    start: ActivityDate
    end: ActivityDate
    category: string
    attendees: Attendee[] | null
}