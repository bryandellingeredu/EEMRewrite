
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Azure.Core;
using Microsoft.Graph;


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


                var activity = new Activity();

                var activities = await _context.Activities
                .Include(x => x.Organization)
                .Include(x => x.Category)
                .Where(x => !x.LogicalDeleteInd)
                .Where(x => !string.IsNullOrWhiteSpace(x.EventLookup))
                .Where(x => x.Title == request.Title).ToListAsync();
                var multipleActivities = new List<Activity>();


                if (activities.Any())
                {
                    List<Activity>  filteredActivities = new List<Activity>();

                    foreach (var item in activities)
                    {
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(GraphHelper.GetEEMServiceAccount(), item.EventLookup);
                        }
                        catch (Exception)
                        {
                            try
                            {
                                evt = await GraphHelper.GetEventAsync(item.CoordinatorEmail, item.EventLookup);
                            }
                            catch (Exception)
                            {

                                evt = new Event();
                            }
                        }
                        if (evt != null && evt.Attendees != null && evt.Attendees.Any(x => x.EmailAddress.Address == roomEmail))
                        {
                            filteredActivities.Add(item);
                        }
                    }


                    if (filteredActivities.Count == 1)
                    {
                            activity = filteredActivities.First();
                    }
                    else
                    {
                        DateTime start = Helper.GetDateTimeFromRequest(request.Start);
                        DateTime end = Helper.GetDateTimeFromRequest(request.End);

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
                                activity = activities.First();
                            }
                        }
                    }
                    // if activity is still null just try to use the first one in the filtered Activities
                    if (activity == null || activity.Id == Guid.Empty)
                    {
                        if (filteredActivities.Any())
                        {
                            activity= filteredActivities.First();   
                        }
                    }
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
        }
    }
}
