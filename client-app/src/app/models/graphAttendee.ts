import { GraphEmailAddress } from "./graphEmailAddress"
import { GraphStatus } from "./graphStatus"

export interface GraphAttendee{
    emailAddress: GraphEmailAddress
    status?: GraphStatus
    type: string
}