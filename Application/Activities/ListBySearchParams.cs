using  System.Linq;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;

namespace Application.Activities
{
    public class ListBySearchParams
    {
        public class Query : IRequest<Result<List<Activity>>> {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string[] CategoryIds { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<List<Activity>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }
            public async Task<Result<List<Activity>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                var query = _context.Activities
                   .Include(c => c.Category)
                   .Include(o => o.Organization)
                   .Where(x => !x.LogicalDeleteInd)
                   .AsQueryable();

                if (!string.IsNullOrEmpty(request.Title))
                {
                    query = query.Where(e => EF.Functions.Like(e.Title.ToLower(), "%" + request.Title.ToLower() + "%"));
                }

                if (request.CategoryIds.Any())
                {
                    query = query.Where(e => request.CategoryIds.ToList().Contains(e.CategoryId.ToString()));           
                }

                if (!string.IsNullOrEmpty(request.Start))
                {
                    int month = int.Parse(request.Start.Split("-")[0]);
                    int day = int.Parse(request.Start.Split("-")[1]);
                    int year = int.Parse(request.Start.Split("-")[2]);
                    DateTime start = new DateTime(year, month, day,0,0,0);
                    query = query.Where(e => e.Start >= start);
                }

                if (!string.IsNullOrEmpty(request.End))
                {
                    int month = int.Parse(request.End.Split("-")[0]);
                    int day = int.Parse(request.End.Split("-")[1]);
                    int year = int.Parse(request.End.Split("-")[2]);
                    DateTime end = new DateTime(year, month, day, 23, 59, 59);
                    query = query.Where(e => e.End <= end);
                }



                query = query.OrderBy(e => e.Start).Take(100);

                var activities = await query.ToListAsync();

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
                        string coordinatorEmail = activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            ? activity.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(coordinatorEmail, activity.EventLookup);
                        }
                        catch (Exception)
                        {
                            activity.EventLookup = string.Empty;
                            evt = new Event();
                        }

                        var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                        List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                        int index = 0;

                       if(evt !=null && evt.Attendees !=null)
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

                return Result<List<Activity>>.Success(activities);
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