using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.USAHECFacilitiesUsageCalendarLegend
{
    public class List
    {
        public class Query : IRequest<Result<List<Domain.USAHECFacilitiesUsageLegend>>> { }
        public class Handler : IRequestHandler<Query, Result<List<Domain.USAHECFacilitiesUsageLegend>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<USAHECFacilitiesUsageLegend>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var  legend = await _context.USAHECFacilitiesUsageLegends
                  .ToListAsync(cancellationToken);

                return Result<List<USAHECFacilitiesUsageLegend>>.Success(legend);
            }
        }
    }
}