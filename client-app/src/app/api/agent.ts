import { Providers, ProviderState } from '@microsoft/mgt';
import { GraphEvent } from '../models/graphEvent';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { history } from '../..';
import { store } from '../stores/store';
import { Activity } from '../models/activity';
import { Category } from '../models/category';
import { Organization } from '../models/organization';
import { Location } from '../models/location';
import { GraphRoom } from '../models/graphRoom';
import { GraphScheduleResponse } from '../models/graphScheduleResponse';
import { GraphScheduleRequest } from '../models/graphScheduleRequest';
import { NonDepartmentRoomReservationRequest } from '../models/nonDepartmentRoomReservationRequest';
import { Recurrence } from '../models/recurrence';
import { User, UserFormValues } from '../models/user';
import { CalendarEvent } from '../models/calendarEvent';
import { EmailGroupMember } from '../models/emailGroupMember';
import { EmailGroup } from '../models/emailGroup';
import { EmailGroupMemberPostData } from '../models/emailGroupMemberPostData';
import { RoomDelegate } from '../models/roomDelegate';
import { VTCCoordinator } from '../models/vtcCoordinator';
import { Attachment } from '../models/attachment';
import { CSLCalendarLegend } from '../models/cslCalendarLegend';
import { EmailGroupMemberDTO } from '../models/emailGroupMemberDTO';
import { ActivityAttachment } from '../models/activityAttachment';
import { USAHECFacilitiesUsageLegend } from '../models/usahecFacilitiesUsageLegend';

axios.defaults.baseURL = process.env.REACT_APP_API_URL

axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const armyEmail = store.graphUserStore.armyProfile?.mail
    if(armyEmail) config.headers['ArmyEmail'] = armyEmail;
    return config;
})

axios.interceptors.response.use(async response => {
   return response;
}, (error: AxiosError) => {
    const{data, status, headers} = error.response!;
    switch (status){
        case 400: 
       if(data.errors){
        const modalStateErrors = [];
        for (const key in data.errors){
            if (data.errors[key]){
                modalStateErrors.push(data.errors[key])
            }
        }
        throw modalStateErrors.flat();
       } else {
        toast.error(data);
       }
        break;
        case 401:
            if(status === 401 && headers['www-authenticate']?.startsWith('Bearer error="invalid_token"')){
                store.userStore.logout();
                //toast.error('Session expired - please login again');
            }
       
        break;
        case 404:
        history.push(`${process.env.PUBLIC_URL}/not-found`)
        break;
        case 500:
        store.commonStore.setServerError(data);
        history.push(`${process.env.PUBLIC_URL}/server-error`);
        break;
    }
    return Promise.reject(error);
});

const acedemicCalendarId ={
    p2fb: '88d59881-7b15-4adc-a756-5d10681cf99d',
    hossRob: '53c49041-d533-48e0-8c08-874a95b064ee'
} 

const graphResponseBody = (response: any) => {
    const retVal = response.value || response;
    console.log('graph response');
    console.log(retVal);
    return retVal;
} 

const axiosResponseBody = <T> (response: AxiosResponse<T>) =>{
    const retval = response.data;
    console.log('axios response');
    console.log(retval);
    return retval;
}

//const academicCalendarURL = `/groups/${process.env.ACADEMIC_CALENDAR_ID}/calendar/events`;
const academicCalendarURL = `/groups/17422b10-09fc-42c9-8d98-f0e7c2c97899/calendar/events`;
const getGraphClient = () => Providers.globalProvider.graph.client;
const IsEDUSignedIn = () => Providers.globalProvider.state === ProviderState.SignedIn;

const graphRequests = {
    isInAcademicCalendarGroup: () => getGraphClient().api("/me/transitiveMemberOf/microsoft.graph.group?$select=id&$filter=id eq '17422b10-09fc-42c9-8d98-f0e7c2c97899'")
  .get()
  .then(response => {
    if (response.status === 404) {
      console.log(response);
      console.log("404 error: edu user is not a member of the academic calendar group");
      return false;
    } else if (response.value) {
      return true;
    } else {
      return false;
    }
  })
  .catch(error => {
    console.log("the edu user is not a member of the academic calendar group:");
    return false;
  }),
    get: (url: string) => getGraphClient().api(url).orderby('start/dateTime').top(1000).get().then(graphResponseBody),
    getForCalendar: (url: string, start: string, end: string) => getGraphClient().api(url).filter(`start/dateTime ge \'${start}\' and end/dateTime le \'${end}\'`).orderby('start/dateTime').top(1000).get().then(graphResponseBody),
    getForCalendarUsingFilter: (url: string, filter: string) => getGraphClient().api(url).filter(filter).orderby('start/dateTime').top(100).get().then(graphResponseBody),
    getSingle: (url: string) => getGraphClient().api(url).get().then(graphResponseBody),
    update: (url: string, body:{}) => getGraphClient().api(url).update(body),
    create: (url: string, body:{}) => getGraphClient().api(url).create(body).then(graphResponseBody),
    delete: (url: string) => getGraphClient().api(url).delete(),
}

const axiosRequest = {
    get: <T> (url: string) => axios.get<T>(url).then(axiosResponseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(axiosResponseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(axiosResponseBody),
    del: <T> (url: string) => axios.delete<T>(url).then(axiosResponseBody),
}

const GraphEvents = {
    isInAcademicCalendarGroup: () => graphRequests.isInAcademicCalendarGroup(),
    list: () => graphRequests.get(academicCalendarURL),
    listForCalendar: (start: string, end: string) => graphRequests.getForCalendar(academicCalendarURL, start, end),
    listForCalendarUsingFilter: (filter: string) => graphRequests.getForCalendarUsingFilter(academicCalendarURL, filter),
    update: (graphEvent: GraphEvent) => graphRequests.update(`${academicCalendarURL}/${graphEvent.id}`, graphEvent),
    create: (graphEvent: GraphEvent) => graphRequests.create(academicCalendarURL, graphEvent),
    delete: (id: string) =>graphRequests.delete(`${academicCalendarURL}/${id}`),
    details: (id: string) => graphRequests.get(`${academicCalendarURL}/${id}`)
    }

 const GraphUser = {
    details: () => graphRequests.getSingle('https://graph.microsoft.com/v1.0/me')
 }

const Activities = {
    list: (day: Date) => axiosRequest.get<Activity[]>(`/activities/getByDay/${day.toISOString()}`),
    listDeleted: () => axiosRequest.get<Activity[]>('activities/getDeleted'),
    listBySearchParams: (data: any) => axiosRequest.post<Activity[]>('/activities/listBySearchParams', data),
    details: (id: string) => axiosRequest.get<Activity>(`/activities/${id}`),
    create: (activity: Activity) => axiosRequest.post<void>('/activities', activity),
    update: (activity: Activity, id: string) => axiosRequest.put<void>(`/activities/${id}`, activity),
    cancelRoomReservations: (id: string) => axiosRequest.put<void>(`/activities/cancelRoomReservations/${id}`, {}),
    cancel: ( id: string, reason: string,) => axiosRequest.put<void>(`/activities/cancel/${id}`, {activityId: id, reason}),
    updateSeries: (activity: Activity, id: string) => axiosRequest.put<void>(`/activities/updateSeries/${id}`, activity),
    delete: (id: string) =>  axiosRequest.del<void>(`/activities/${id}`),
    restore: (id: string) => axiosRequest.put<void>(`/activities/restore/${id}`, {}),
    reserveNonDepartmentRoom: (
        room: NonDepartmentRoomReservationRequest) => axiosRequest.post<string>(
            '/activities/reserveNonDepartmentRoom', room ),
    listPossibleByRecurrence: (recurrence: Recurrence) => axiosRequest.post<Activity[]>('/activities/listPossibleByRecurrence', recurrence),
    getByRoom: (title: string, start: string, end: string) => axiosRequest.get<Activity>(`/activities/getByRoom/${title}/${start}/${end}`),
    getRoomNames: (eventLookup: string, coordinatorEmail: string) => axiosRequest.get<string>(`/activities/getRoomNames/${eventLookup}/${coordinatorEmail}`),
    getIMCEventsByDate: (start: string, end: string) => axiosRequest.get<CalendarEvent[]>(`/activities/getIMCEventsByDate?start=${start}&end=${end}`),
    getLocations: () => axiosRequest.get<string[]>('activities/getLocations'),
    getActionOfficers: () => axiosRequest.get<string[]>('activities/getActionOfficers'),
    getCreatedBy: () => axiosRequest.get<string[]>('activities/getCreatedBy'),
}

const Categories = {
    list: () => axiosRequest.get<Category[]>('/categories'),
}

const RoomDelegates = {
    list: () => axiosRequest.get<RoomDelegate[]>('/roomDelegate'),
    create: (data : RoomDelegate) => axiosRequest.post<void>('/roomDelegate', data),
    delete: (id: string) => axiosRequest.del<void>(`/roomDelegate/${id}`)
}

const VTCCoordinators = {
    list: () => axiosRequest.get<VTCCoordinator[]>('/VTCCoordinators'),
    create: (data : VTCCoordinator) => axiosRequest.post<void>('/VTCCoordinators', data),
    delete: (id: string) => axiosRequest.del<void>(`/VTCCoordinators/${id}`)
}



const Organizations = {
    list: () => axiosRequest.get<Organization[]>('/organizations'),
}

const Locations = {
    list: () => axiosRequest.get<Location[]>('/locations'),
}

const GraphRooms = {
    list: () => axiosRequest.get<GraphRoom[]>('/graphrooms'),
}

const GraphSchedules = {
    list: (graphScheduleRequest : GraphScheduleRequest) => axiosRequest.post<GraphScheduleResponse[]>('/graphschedule', graphScheduleRequest)
}

const Account = {
    current: () => axiosRequest.get<User>('/account'),
    login: (user: UserFormValues) => axiosRequest.post<User>('/account/login', user),
    register: (user: UserFormValues) => axiosRequest.post<User>('/account/register', user),
    signInGraphUser: (user: UserFormValues) => axiosRequest.post<User>('/account/signInGraphUser', user),
    signInCacUser: () => axiosRequest.post<User>('/account/signInCACUser', {}),
    refreshToken: () => axiosRequest.post<User>('/account/refreshToken',{}),
    verifyEmail: (token: string, email: string) => 
                axiosRequest.post<void>(`/account/verifyEmail?token=${token}&email=${email}`, {}),
    resendEmailConfirm: (email: string) => 
                axiosRequest.get(`/account/resendEmailConfirmationLink?email=${email}`),
    getRoles: (userEmail: string) => axiosRequest.get<string[]>(`/account/getRoles/${userEmail}`)
}

const Uploads = {
    uploadDocument: (file: any) => {
      let formData = new FormData();
      formData.append('File', file);
      return axios.post('upload', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
    },
    uploadActivityDocument: (file: any, activityAttachmentGroupId: string, activityAttachmentId : string) => {
        let formData = new FormData();
        formData.append('File', file);
        formData.append('activityAttachmentGroupId', activityAttachmentGroupId );
        formData.append('activityAttachmentId', activityAttachmentId  );
        return axios.post('upload/addActivityAttachment', formData, {
          headers: {'Content-Type': 'multipart/form-data'}
        })
      },
    downloadDocument: (id: number) => axiosRequest.get<any>(`upload/${id}`),
    downloadActivityDocument: (id: string) => axiosRequest.get<any>(`upload/ActivityAttachment/${id}`)
}

const EmailGroups ={
    getEmailGroupMembers : () => axiosRequest.get<EmailGroupMember[]>('/emailGroup'),
    list : () => axiosRequest.get<EmailGroup[]>('/emailGroup/GetGroups'),
    post : (data: EmailGroupMemberPostData) => axiosRequest.post<void>('/emailGroup', data),
    details: (id: string) => axiosRequest.get<EmailGroupMember>(`/emailGroup/${id}`),
    delete: (memberid: string, groupid: string) => axiosRequest.del<void>(`/emailGroup/${memberid}/${groupid}`),
    create: (data : EmailGroupMemberDTO) => axiosRequest.post<void>('/emailGroup/addMemberToGroup', data),
}

const Attachments = {
    details: (id: number) => axiosRequest.get<Attachment>(`/upload/metadata/${id}`),
    activityDetails: (activityGroupId: string) =>axiosRequest.get<ActivityAttachment[]>(`/upload/ActivityAttachmentsMetaData/${activityGroupId}`),
    activityAttachmentDetails: (id: string) => axiosRequest.get<ActivityAttachment>(`/upload/ActivityAttachmentMetaData/${id}`),
    deleteActvityAttachment: (id: string) => axiosRequest.del<void>(`/upload/deleteActivityAttachment/${id}`),
}

const CSLLegend = {
    list: () => axiosRequest.get<CSLCalendarLegend[]>('/CSLCalendarLegend')
}

const USAHECFacilitiesUsageCalendarLegend = {
    list: () => axiosRequest.get<USAHECFacilitiesUsageLegend[]>('/USAHECFacilitiesUsageLegend')
} 

const USAHECReports = {
    listBySearchParams: (data: any) => axiosRequest.post<any>('/USAHECFacilitiesUsage/listBySearchParams', data),
}

const HostingReports = {
    getGuestTitles: () => axiosRequest.get<string[]>('/HostingReports/getGuestTitles'),
    listBySearchParams: (data: any) => axiosRequest.post<any>('/hostingReports/listBySearchParams', data),
    listForHostingReportPDF: () => axiosRequest.get<Activity[]>('/hostingReports/ListForHostingReportPDF'),
}

const Calendars = {
    listBySearchParams: (data: any, id: string) => axiosRequest.post<any>(`/calendar/listBySearchParams/${id}`, data),
}

const agent = {
    Activities,
    Account,
    Categories,
    RoomDelegates,
    VTCCoordinators,
    Organizations,
    Locations,
    GraphEvents,
    GraphRooms,
    GraphSchedules,
    GraphUser,
    IsEDUSignedIn,
    Uploads,
    EmailGroups,
    Attachments,
    CSLLegend,
    USAHECFacilitiesUsageCalendarLegend,
    HostingReports,
    USAHECReports,
    Calendars 
}

export default agent;

