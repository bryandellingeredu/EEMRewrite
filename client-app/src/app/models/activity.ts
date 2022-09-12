import { ActivityDate } from "./activityDate"
import { Attendee } from "./attendee"
import { EmailAddress } from "./emailAddress"
import { Location } from "./location"

export interface Activity{
    id: string
    subject: string
    bodyPreview: string
    start: ActivityDate
    end: ActivityDate
    category: string
    attendees?: Attendee[]
    location?: Location
    emailAddress?: EmailAddress
}