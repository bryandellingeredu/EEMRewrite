using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;

namespace Application.Activities
{
    public class ListByDay
    {
        public class Query : IRequest<Result<List<Activity>>>
        {
            public DateTime Day { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<Activity>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly IMemoryCache _cache;
            private static readonly TimeSpan CacheExpiration = TimeSpan.FromHours(8);

            public Handler(DataContext context, IConfiguration config, IMemoryCache cache)
            {
                _context = context;
                _config = config;
                _cache = cache;
            }

            public async Task<Result<List<Activity>>> Handle(Query request, CancellationToken cancellationToken)
            {
                try
                {
                    string cacheKey = $"GetActivities_{request.Day:yyyy-MM-dd}";

                    // Check if the result is in the cache
                    if (!_cache.TryGetValue(cacheKey, out List<Activity> cachedActivities))
                    {
                        Settings s = new Settings();
                        var settings = s.LoadSettings(_config);
                        GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                        var allrooms = await GraphHelper.GetRoomsAsync();

                        var activities = await _context.Activities
                           .Include(c => c.Category)
                           .Include(o => o.Organization)
                           .Include(r => r.Recurrence)
                           .Where(a => request.Day.Date >= a.Start.Date && request.Day.Date <= a.End.Date)
                           .Where(x => !x.LogicalDeleteInd)
                          .ToListAsync(cancellationToken);

                        foreach (var activity in activities)
                        {
                            activity.Category.Activities = null;
                            if (activity.Organization != null)
                            {
                                activity.Organization.Activities = null;
                            }

                            if (activity.Recurrence != null)
                            {
                                activity.Recurrence.Activities = null;
                            }

                            if (!string.IsNullOrEmpty(activity.EventLookup) && !string.IsNullOrEmpty(activity.CoordinatorEmail))
                            {
                                Event evt;
                                try
                                {
                                    evt = await GraphHelper.GetEventAsync(activity.CoordinatorEmail, activity.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar);
                                }
                                catch (Exception)
                                {
                                    evt = new Event();
                                }

                                var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                                List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                                int index = 0;

                                if (evt != null && evt.Attendees != null)
                                {
                                    foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                                    {
                                        newActivityRooms.Add(new ActivityRoom
                                        {
                                            Id = index++,
                                            Name = getName(item, allrooms),
                                            Email = item.EmailAddress.Address
                                        });
                                    }
                                }

                                activity.ActivityRooms = newActivityRooms;
                            }
                        }

                        // Store the result in the cache
                        _cache.Set(cacheKey, activities, CacheExpiration);

                        cachedActivities = activities;
                    }

                    return Result<List<Activity>>.Success(cachedActivities);
                }
                catch (Exception)
                {
                    throw;
                }
            }

            private string getName(Attendee item, IGraphServicePlacesCollectionPage allrooms)
            {
                var room = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == item.EmailAddress.Address).FirstOrDefault();
                string name = room.DisplayName;
                return name;
            }
        }
    }
}
