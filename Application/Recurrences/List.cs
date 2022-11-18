using Application.Core;
using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;

namespace Application.Recurrences
{
    public class List
    {
        public class Query : IRequest<Result<List<Domain.Recurrence>>> { }

        public class Handler : IRequestHandler<Query, Result<List<Domain.Recurrence>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<Domain.Recurrence>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var recurrences = await _context.Recurrences.Include(a => a.Activities).ToListAsync(cancellationToken);
                return Result<List<Domain.Recurrence>>.Success(recurrences);
            }
        }
    }
}
