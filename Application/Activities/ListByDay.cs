using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
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

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<Activity>>> Handle(Query request, CancellationToken cancellationToken)
            {

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

                }

                return Result<List<Activity>>.Success(activities);
            }
        }
    }
}