
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Azure.Core;
using Microsoft.Graph;
using System.Text.RegularExpressions;
using System.Globalization;
using System;

namespace Application.Activities
{
    public class GetByRoom
    {
        public class Query : IRequest<Result<Activity>>
        {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Activity>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<Activity>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allRooms = await GraphHelper.GetRoomsAsync();
                var room = allRooms.Where(r => r.Id == request.Id).FirstOrDefault();
                string roomEmail = room.AdditionalData["emailAddress"].ToString();

                DateTime start = Helper.GetDateTimeFromRequest(request.Start);
                DateTime end = Helper.GetDateTimeFromRequest(request.End);
                DateTime startDate = start.Date.AddMonths(-2);
                DateTime endDate = end.Date.AddMonths(2);

                var activity = new Activity();

                var titleRequest = Regex.Replace(request.Title.Trim().ToLower(), @"[^a-zA-Z0-9]", "");

                var activities = await _context.Activities
                                .Include(x => x.Organization)
                                .Include(x => x.Category)
                                .Where(x => !x.LogicalDeleteInd)
                                .Where(x => !string.IsNullOrWhiteSpace(x.EventLookup))
                                .Where(x => x.Title.Trim().ToLower() == request.Title.Trim().ToLower())
                                .ToListAsync();

                if (!activities.Any())
                {
                    activities = await _context.Activities
                                .Include(x => x.Organization)
                                .Include(x => x.Category)
                                .Where(x => !x.LogicalDeleteInd)
                                .Where(x => !string.IsNullOrWhiteSpace(x.EventLookup))
                                .Where(x => x.Start.Date >= startDate)
                                .Where(x => x.End.Date <= endDate)
                                .ToListAsync();

                    activities = activities
                                .Where(x => Regex.Replace(x.Title.Trim().ToLower(), @"[^a-zA-Z0-9]", "") == titleRequest)
                                .ToList();
                }



                if (activities.Any())
                {
                    List<ActivityEvent> filteredActivityEvents = new List<ActivityEvent>();

                    foreach (var item in activities)
                    {
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(item.CoordinatorEmail, item.EventLookup, item.LastUpdatedBy, item.CreatedBy, item.EventLookupCalendar, item.EventLookupCalendarEmail);
                        }
                        catch (Exception)
                        {
                            evt = new Event();
                        }
                        if (evt != null && evt.Attendees != null && evt.Attendees.Any(x => x.EmailAddress.Address == roomEmail))
                        {
                            filteredActivityEvents.Add(new ActivityEvent(item, evt));
                        }
                    }

                    TimeZoneInfo easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
                    string requestStartAsString = request.Start;
                    string requestEndAsString = request.End;
                    DateTimeOffset startDateTimeOffset = DateTimeOffset.Parse(requestStartAsString, CultureInfo.InvariantCulture);
                    DateTimeOffset endDateTimeOffset = DateTimeOffset.Parse(requestEndAsString, CultureInfo.InvariantCulture);
                    DateTime requestStartEasternTime = TimeZoneInfo.ConvertTime(startDateTimeOffset, easternZone).DateTime;
                    DateTime requestEndEasternTime = TimeZoneInfo.ConvertTime(endDateTimeOffset, easternZone).DateTime;

                    foreach (ActivityEvent activityEvent in filteredActivityEvents)
                    {
                     
                        var eventStartUTCString = activityEvent.GraphEvent.Start.DateTime;
                        var eventEndUTCString = activityEvent.GraphEvent.End.DateTime;
                        DateTime eventStartUtcDateTime = DateTime.ParseExact(
                            eventStartUTCString, "yyyy-MM-ddTHH:mm:ss.fffffff",
                            CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);
                        DateTime eventEndUtcDateTime = DateTime.ParseExact(eventEndUTCString,
                            "yyyy-MM-ddTHH:mm:ss.fffffff",
                            CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);
                      
                       
                        DateTime eventStartEasternTime = TimeZoneInfo.ConvertTimeFromUtc(eventStartUtcDateTime, easternZone);
                        DateTime eventEndEasternTime = TimeZoneInfo.ConvertTimeFromUtc(eventEndUtcDateTime, easternZone);

                        DateTime activityStartEasternTime = activityEvent.Activity.Start;
                        DateTime activityEndEasternTime = activityEvent.Activity.End;

                        bool isStartMatch, isEndMatch;

                        if (activityEvent.Activity.AllDayEvent)
                        {
                            isStartMatch = requestStartEasternTime.Date.AddDays(-1) == eventStartEasternTime.Date;
                            isEndMatch = requestEndEasternTime.Date.AddDays(-1) == eventEndEasternTime.Date;

                        }
                        else
                        {

                            isStartMatch = requestStartEasternTime.Year == eventStartEasternTime.Year &&
                                requestStartEasternTime.Month == eventStartEasternTime.Month &&
                                requestStartEasternTime.Day == eventStartEasternTime.Day &&
                                requestStartEasternTime.Hour == eventStartEasternTime.Hour &&
                                requestStartEasternTime.Minute == eventStartEasternTime.Minute;

                            // Compare end times (year, month, day, hour, minute)
                             isEndMatch = requestEndEasternTime.Year == eventEndEasternTime.Year &&
                                              requestEndEasternTime.Month == eventEndEasternTime.Month &&
                                              requestEndEasternTime.Day == eventEndEasternTime.Day &&
                                              requestEndEasternTime.Hour == eventEndEasternTime.Hour &&
                                              requestEndEasternTime.Minute == eventEndEasternTime.Minute;
                        }

                        if (isStartMatch && isEndMatch)
                        {
                            activity = activityEvent.Activity;
                            break;
                            
                        }
                    }




                 /*   if (filteredActivities.Count == 1)
                    {
                            activity = filteredActivities.First();
                    }
                    else
                    {
      

                        // Look for the title where the date is anytime between the start date at midnight and the end date plus a day
                        var dateRangeActivities = filteredActivities.Where(x => x.Start.Date >= start.Date && x.End.Date <= end.Date && !string.IsNullOrEmpty(x.EventLookup)).ToList();

                        if (dateRangeActivities.Count == 1)
                        {
                            activity = dateRangeActivities.First();
                        }
                        else
                        {
                            // If there is still more than one, do the exact match
                            activities = dateRangeActivities.Where(x => DateTime.Compare(x.Start, start) == 0 && DateTime.Compare(x.End, end) == 0).ToList();
                            if (dateRangeActivities.Any())
                            {
                                activity = dateRangeActivities.First();
                            }
                        }
                    } */
                    // if activity is still null just try to use the first one in the filtered Activities
                    /*  if (activity == null || activity.Id == Guid.Empty)
                      {
                          if (filteredActivities.Any())
                          {
                              activity= filteredActivities.First();   
                          }
                      } */
                }

          

                if (activity.Organization != null)
                {
                    activity.Organization.Activities = null;
                }
                if (activity.Category != null)
                {
                    activity.Category.Activities = null;
                }            

                if (activity.Recurrence != null)
                {
                    activity.Recurrence.Activities = null;
                }
                return Result<Activity>.Success(activity);
            }

            public class ActivityEvent
            {
                public Activity Activity { get; set; }
                public Event GraphEvent { get; set; }

                public ActivityEvent(Activity activity, Event graphEvent)
                {
                    Activity = activity;
                    GraphEvent = graphEvent;
                }
            }
        }
    }
}
