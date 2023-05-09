
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Azure.Core;


namespace Application.Activities
{
    public class GetByRoom
    {
        public class Query : IRequest<Result<Activity>>
        {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Activity>>
        {
            private readonly DataContext _context;


            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
            }

            public async Task<Result<Activity>> Handle(Query request, CancellationToken cancellationToken)
            {
                var activity = new Activity();

                var activities = await _context.Activities
                .Include(x => x.Organization)
                .Include(x => x.Category)
                .Where(x => !x.LogicalDeleteInd)
                .Where(x => x.Title == request.Title).ToListAsync();
                var multipleActivities = new List<Activity>();
                if (activities.Any())
                {
                    if (activities.Count == 1)
                    {
                        activity = activities.First();
                    }
                    else
                    {
                        DateTime start = Helper.GetDateTimeFromRequest(request.Start);
                        DateTime end = Helper.GetDateTimeFromRequest(request.End);

                        // Look for the title where the date is anytime between the start date at midnight and the end date plus a day
                        var dateRangeActivities = activities.Where(x => x.Start.Date >= start.Date && x.End.Date <= end.Date).ToList();

                        if (dateRangeActivities.Count == 1)
                        {
                            activity = dateRangeActivities.First();
                        }
                        else
                        {
                            // If there is still more than one, do the exact match
                            activities = dateRangeActivities.Where(x => DateTime.Compare(x.Start, start) == 0 && DateTime.Compare(x.End, end) == 0).ToList();
                            if (activities.Count == 1)
                            {
                                activity = activities.First();
                            }
                            else if (dateRangeActivities.Any()) // If the exact match returns none, return the first one from the date range check
                            {
                                activity = dateRangeActivities.First();
                            }
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
