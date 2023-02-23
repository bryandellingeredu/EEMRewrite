using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.CSLLegend
{
    public class List
    {
        public class Query : IRequest<Result<List<Domain.CSLCalendarLegend>>> { }
        public class Handler : IRequestHandler<Query, Result<List<Domain.CSLCalendarLegend>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<CSLCalendarLegend>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var  legend = await _context.CSLCalendarLegends
                  .ToListAsync(cancellationToken);

                return Result<List<CSLCalendarLegend>>.Success(legend);
            }
        }
    }
}