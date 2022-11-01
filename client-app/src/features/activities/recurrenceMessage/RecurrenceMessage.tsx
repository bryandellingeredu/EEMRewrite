import { observer } from 'mobx-react-lite';
import { Message } from 'semantic-ui-react';
import { Recurrence } from '../../../app/models/recurrence';
import { format } from "date-fns";

interface Props {
    values: Recurrence
    weeklyRepeatType: string
    monthlyDayType: string
    monthlyRepeatType: string
}

export default observer(function RecurrenceMessage({ values, weeklyRepeatType, monthlyDayType, monthlyRepeatType } : Props) {


    return (
        <>
        {values.interval === 'daily' && 
        <Message
            info
            header='Daily repeating information'
            content={`this event will repeat daily starting on ${format(new Date(values.intervalStart), 'MMMM d, yyyy')} and will repeat for  ${values.daysRepeating} days 
            ${values.weekendsIncluded === 'yes' ? 'including' : 'not including '} weekends.
            ` } 
          />
        }
        {values.interval === 'weekly' &&
                <Message
    info
    header='Weekly repeating information'
    content={`this event will start on ${format(new Date(values.intervalStart), 'MMMM d, yyyy')} and will repeat 
    ${values.weekInterval === '1' ? 'every week' : values.weekInterval === '2' ? 'every other week' : 'every third week' }
    on  ${values.sunday ? 'Sunday' : ''} ${values.monday ? 'Monday' : ''}  ${values.tuesday ? 'Tuesday' : ''}  ${values.wednesday ? 'Wednesday' : ''}
    ${values.thursday ? 'Thursday' : ''} ${values.friday ? 'Friday' : ''} ${values.saturday ? 'Saturday' : ''}.
     ${weeklyRepeatType === 'number' ? 'This series will repeat' : 'ending on'} 
     ${weeklyRepeatType === 'number' ? values.weeksRepeating : format(new Date(values.intervalEnd), 'MMMM d, yyyy')}
     ${weeklyRepeatType === 'number' ? 'time/s' : ''}
    ` } 
  />
}
{
  values.interval === 'monthly' &&
  <Message 
  info
  header='Monthly repeating information'
  content={`this event will start on ${format(new Date(values.intervalStart), 'MMMM d, yyyy')} ${monthlyDayType === 'number' ? ' and occur on ' : ''}
  ${monthlyDayType === 'number' ? 
     values.weekOfMonth === '1' ? 'the first ' : values.weekOfMonth === '2' ? 'the second ' : values.weekOfMonth === '3' ? 'the third ' : 'the fourth'
     :   ''}  
 ${monthlyDayType === 'number' ? 
     values.weekdayOfMonth === '0' ? 'Sunday of each month. ' : values.weekdayOfMonth === '1' ? 'Monday of each month. ' : values.weekdayOfMonth === '2' ? 'Tuesday of each month. ' :
     values.weekdayOfMonth === '3' ? 'Wednesday of each month. ' :   values.weekdayOfMonth === '4' ? 'Thursday of each month. ' :
       values.weekdayOfMonth === '5' ? 'Friday of each month. ' : 'Saturday of each month. '
     :   ''}  
 ${monthlyDayType === 'date' ? 
     values.dayOfMonth === '1' ? 'and repeat on the 1st' : values.dayOfMonth === '2' ? 'and repeat on the 2nd ' : values.dayOfMonth === '3' ? 'and repeat on the 3rd ' : 'and repeat on the' + values.dayOfMonth + 'th'
     :   ''}  
 ${monthlyDayType === 'date' ? 'of each month.' :   ''} 

 ${monthlyRepeatType === 'number' ? 'This event will repeat ' + values.monthsRepeating + ' time/s' :
 'this event will repeat until '}

 ${monthlyRepeatType === 'date' ? format(new Date(values.intervalEnd), 'MMMM d, yyyy') : ''}

  `}

  />
}
        </>
    )
})