export interface IFAddEventRequest{
    startDate: Date
    endDate: Date
    title: string
    description: string
    actionOfficer: string
    actionOfficerPhone: string
    needRoom: boolean
    selectedRoomEmail: string
    primaryLocation: string
    eventTypeStudent: boolean
    internationalFellowsStaffEventPrivate: boolean
    internationalFellowsStaffEventCategory: string
    studentAttendanceMandatory: boolean
    studentCalendarPresenter: string
    studentCalendarUniform: string
    studentCalendarNotes: string
}