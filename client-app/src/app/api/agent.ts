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

axios.defaults.baseURL = process.env.REACT_APP_API_URL

axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
const IsSignedIn = () => Providers.globalProvider.state === ProviderState.SignedIn;

const graphRequests = {
    get: (url: string) => getGraphClient().api(url).orderby('start/dateTime').top(1000).get().then(graphResponseBody),
    getForCalendar: (url: string, start: string, end: string) => getGraphClient().api(url).filter(`start/dateTime ge \'${start}\' and end/dateTime le \'${end}\'`).orderby('start/dateTime').top(1000).get().then(graphResponseBody),
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
    list: () => graphRequests.get(academicCalendarURL),
    listForCalendar: (start: string, end: string) => graphRequests.getForCalendar(academicCalendarURL, start, end),
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
    listTen: (day: Date) => axiosRequest.get<Activity[]>(`/activities/getTen/${day.toISOString()}`),
    details: (id: string) => axiosRequest.get<Activity>(`/activities/${id}`),
    create: (activity: Activity) => axiosRequest.post<void>('/activities', activity),
    update: (activity: Activity, id: string) => axiosRequest.put<void>(`/activities/${id}`, activity),
    updateSeries: (activity: Activity, id: string) => axiosRequest.put<void>(`/activities/updateSeries/${id}`, activity),
    delete: (id: string) =>  axiosRequest.del<void>(`/activities/${id}`),
    reserveNonDepartmentRoom: (
        room: NonDepartmentRoomReservationRequest) => axiosRequest.post<string>(
            '/activities/reserveNonDepartmentRoom', room ),
    listPossibleByRecurrence: (recurrence: Recurrence) => axiosRequest.post<Activity[]>('/activities/listPossibleByRecurrence', recurrence),
    getByRoom: (title: string, start: string, end: string) => axiosRequest.get<Activity>(`/activities/getByRoom/${title}/${start}/${end}`),
    getRoomNames: (eventLookup: string, coordinatorEmail: string) => axiosRequest.get<string>(`/activities/getRoomNames/${eventLookup}/${coordinatorEmail}`),
    getIMCEventsByDate: (start: string, end: string) => axiosRequest.get<CalendarEvent[]>(`/activities/getIMCEventsByDate?start=${start}&end=${end}`)
}

const Categories = {
    list: () => axiosRequest.get<Category[]>('/categories'),
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
                axiosRequest.get(`/account/resendEmailConfirmationLink?email=${email}`)
}

const agent = {
    Activities,
    Account,
    Categories,
    Organizations,
    Locations,
    GraphEvents,
    GraphRooms,
    GraphSchedules,
    GraphUser,
    IsSignedIn
}

export default agent;

