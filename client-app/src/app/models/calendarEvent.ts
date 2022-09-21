export interface CalendarEvent{
    id: string
    categoryId: string
    title: string
    start: Date | string
    end: Date | string
    allDay: boolean
}