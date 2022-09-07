import { Providers, ProviderState } from '@microsoft/mgt';
import { Activity } from '../models/activity';

const acedemicCalendarId ={
    p2fb: '88d59881-7b15-4adc-a756-5d10681cf99d',
    hossRob: '53c49041-d533-48e0-8c08-874a95b064ee'
} 

const responseBody = (response: any) => {
    const retVal = response.value || response;
    console.log('response');
    console.log(retVal);
    return retVal;
} 
const academicCalendarURL = `/groups/${acedemicCalendarId.hossRob}/calendar/events`;
const getGraphClient = () => Providers.globalProvider.graph.client;
const IsSignedIn = () => Providers.globalProvider.state === ProviderState.SignedIn;

const requests = {
    get: (url: string) => getGraphClient().api(url).orderby('start/dateTime').top(20).get().then(responseBody),
    update: (url: string, body:{}) => getGraphClient().api(url).update(body),
    create: (url: string, body:{}) => getGraphClient().api(url).create(body).then(responseBody),
    delete: (url: string) => getGraphClient().api(url).delete()
}

const getGraphEvent = (activity: Activity) => {
    const { category, ...rest  } = activity;
    const body = {'contentType': 'html', 'content': `<b>${activity.bodyPreview}</b>` };
    return {...rest, body};
}

const Activities = {
    list: () => requests.get(academicCalendarURL),
    update: (activity: Activity) => requests.update(`${academicCalendarURL}/${activity.id}`, getGraphEvent(activity)),
    create: (activity: Activity) => requests.create(academicCalendarURL, getGraphEvent(activity)),
    delete: (id: string) =>requests.delete(`${academicCalendarURL}/${id}`),
    details: (id: string) => requests.get(`${academicCalendarURL}/${id}`)
    }

const agent = {
    Activities,
    IsSignedIn
}

export default agent;

//groups/{id}/calendar/events/{id}{id}
