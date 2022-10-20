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
    public class Details
    {
        public class Query : IRequest<Result<Activity>>
        {
            public Guid Id { get; set; }
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
                var activity = await _context.Activities
                    .Include(c => c.Category)
                    .Include(o => o.Organization)
                    .Include(r => r.Recurrence)
                .FirstOrDefaultAsync(x => x.Id == request.Id);

                if (activity.Organization != null)
                {
                    activity.Organization.Activities = null;
                }
                activity.Category.Activities = null;

                if (activity.Recurrence != null)
                {
                    activity.Recurrence.Activities = null;
                }

                if (!string.IsNullOrEmpty(activity.EventLookup) && !string.IsNullOrEmpty(activity.CoordinatorEmail))
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    var evt = await GraphHelper.GetEventAsync(activity.CoordinatorEmail, activity.EventLookup);

                    var allrooms = await GraphHelper.GetRoomsAsync();

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

                return Result<Activity>.Success(activity);
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
