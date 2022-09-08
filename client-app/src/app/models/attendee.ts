import { EmailAddress } from "./emailAddress"
import { Status } from "./status"

export interface Attendee{
    emailAddress: EmailAddress
    status: Status
    type: string
}