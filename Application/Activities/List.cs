
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Application.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<Result<List<Activity>>> { }
        public class Handler : IRequestHandler<Query, Result<List<Activity>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly IUserAccessor _userAccessor;
            private readonly UserManager<AppUser> _userManager;

            public Handler(DataContext context, IConfiguration config, IUserAccessor userAccessor, UserManager<AppUser> userManager)
            {
                _context = context;
                _config = config;
                _userAccessor = userAccessor;
                _userManager = userManager;
            }
            public async Task<Result<List<Activity>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var userEmail = _userAccessor.GetUsername();
                var user = await _userManager.FindByEmailAsync(userEmail);
                bool isIFCalendarAdmin = false;
                if (user != null) isIFCalendarAdmin = await _userManager.IsInRoleAsync(user, "ifCalendarAdmin");

                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();
                
                
                var activities = await _context.Activities
                   .Include(c => c.Category)
                   .Include(o => o.Organization)
                   .Include(r => r.Recurrence)
                   .Where(x => !x.LogicalDeleteInd)
                   .Where(x => !x.InternationalFellowsStaffEventPrivate)
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
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(coordinatorEmail, activity.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                        }
                        catch (Exception)
                        {
                            evt = new Event();
                            activity.EventLookup = string.Empty;
                            activity.EventLookupCalendar = string.Empty;
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