import { GraphActivityDate } from "./graphActivityDate"
import { GraphAttendee } from "./graphAttendee"
import { GraphBody } from "./graphBody"
import { GraphEmailAddress } from "./graphEmailAddress"
import { GraphLocation } from "./graphLocation"

export interface GraphEvent{
    id: string
    subject: string
    bodyPreview: string
    start: GraphActivityDate
    end: GraphActivityDate
    attendees?: GraphAttendee[]
    location?: GraphLocation
    emailAddress?: GraphEmailAddress
    body: GraphBody
    isAllDay: boolean
}