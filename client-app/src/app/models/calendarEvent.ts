export interface CalendarEvent{
    id: string
    categoryId: string
    title: string
    start: Date | string
    end: Date | string
    allDay: boolean
    color: string
    description: string
    primaryLocation: string
    leadOrg: string
    actionOfficer: string
    actionOfficerPhone: string
    categoryName: string
    eventLookup: string
    coordinatorEmail: string
}