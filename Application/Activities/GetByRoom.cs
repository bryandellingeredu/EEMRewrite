
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
                if (!activities.Any())
                {
                    var titleArray = request.Title.Split("- Requested by:");
                    var title = titleArray[0];
                    activities = await _context.Activities.Where(x => x.Title == title).ToListAsync();
                }

                if (activities.Any())
                {
                    if (activities.Count == 1)
                    {
                        activity = activities.First();
                    } else
                    {       
                        DateTime start = Helper.GetDateTimeFromRequest(request.Start);
                        DateTime end = Helper.GetDateTimeFromRequest(request.End);
                        activities = activities.Where(x => DateTime.Compare(x.Start, start) == 0).ToList();
                        if (activities.Count == 1)
                        {
                            activity = activities.First();
                        } else
                        {
                            activities = activities.Where(x => DateTime.Compare(x.End, end) == 0).ToList();
                            if (activities.Count == 1)
                            {
                                activity = activities.First();
                            }
                        }
                    }
                };

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
