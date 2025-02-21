import { Recurrence } from "./recurrence"

export interface CheckForSetUpTearDownDoubleBookingDTO{
    start: string
    end: string
    type: string
    minutes: string
    recurrence: Recurrence | null
    roomEmails: string[]
}