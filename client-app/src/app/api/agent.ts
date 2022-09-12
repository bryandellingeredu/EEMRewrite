import { Providers, ProviderState } from '@microsoft/mgt';
import { Activity } from '../models/activity';
import axios, { AxiosResponse } from 'axios';

axios.defaults.baseURL = 'https://localhost:7285/api';

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

const axiosResponseBody = (response: AxiosResponse) =>{
    const retval = response.data;
    console.log('axios response');
    console.log(retval);
    return retval;
}

const academicCalendarURL = `/groups/${acedemicCalendarId.hossRob}/calendar/events`;
const getGraphClient = () => Providers.globalProvider.graph.client;
const IsSignedIn = () => Providers.globalProvider.state === ProviderState.SignedIn;

const graphRequests = {
    get: (url: string) => getGraphClient().api(url).orderby('start/dateTime').top(20).get().then(graphResponseBody),
    update: (url: string, body:{}) => getGraphClient().api(url).update(body),
    create: (url: string, body:{}) => getGraphClient().api(url).create(body).then(graphResponseBody),
    delete: (url: string) => getGraphClient().api(url).delete()
}

const axiosRequest = {
    get: (url: string) => axios.get(url).then(axiosResponseBody)
}

const getGraphEvent = (activity: Activity) => {
    const { category, ...rest  } = activity;
    const body = {'contentType': 'html', 'content': `<b>${activity.bodyPreview}</b>` };
    return {...rest, body};
}

const Activities = {
    list: () => graphRequests.get(academicCalendarURL),
    update: (activity: Activity) => graphRequests.update(`${academicCalendarURL}/${activity.id}`, getGraphEvent(activity)),
    create: (activity: Activity) => graphRequests.create(academicCalendarURL, getGraphEvent(activity)),
    delete: (id: string) =>graphRequests.delete(`${academicCalendarURL}/${id}`),
    details: (id: string) => graphRequests.get(`${academicCalendarURL}/${id}`)
    }

const RoomActivities = {
    list: () => axiosRequest.get('/graphEvents'),
    details: (email: string, id: string) => axiosRequest.get(`/graphEvents/${email}/events/${id}`)
}

const agent = {
    Activities,
    RoomActivities,
    IsSignedIn
}

export default agent;

//groups/{id}/calendar/events/{id}{id}
