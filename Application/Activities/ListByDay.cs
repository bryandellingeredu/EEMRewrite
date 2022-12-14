using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;

namespace Application.Activities
{
    public class ListByDay
    {
        public class Query : IRequest<Result<List<Activity>>> {
            public DateTime Day { get; set; }
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

                var activities = await _context.Activities
                   .Include(c => c.Category)
                   .Include(o => o.Organization)
                   .Include(r => r.Recurrence)
                   .Where(a => request.Day.Date >= a.Start.Date && request.Day.Date <= a.End.Date)
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
                        string coordinatorEmail = activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            ? activity.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                        var evt = await GraphHelper.GetEventAsync(coordinatorEmail, activity.EventLookup);
                        var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                        List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                        int index = 0;

                        foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                        {

                            newActivityRooms.Add(new ActivityRoom
                            {
                                Id = index++,
                                Name = getName(item, allrooms),
                                Email = item.EmailAddress.Address
                            });
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