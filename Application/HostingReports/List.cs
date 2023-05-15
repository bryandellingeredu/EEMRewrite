using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.HostingReports
{
    public class List
    {
        public class Query : IRequest<Result<List<HostingReport>>> { }
        public class Handler : IRequestHandler<Query, Result<List<HostingReport>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<HostingReport>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var hostingReports = await _context.HostingReports
                     .Join(_context.Activities,
                       hr => hr.ActivityId,
                        a => a.Id,
                        (hr, a) => new { HostingReport = hr, Activity = a })
                     .Where(joined => joined.Activity.Report == "Hosting Report")
                    .Select(joined => joined.HostingReport)
                    .ToListAsync(cancellationToken);

                return Result<List<HostingReport>>.Success(hostingReports);
            }
        }
    }
}