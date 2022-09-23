using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.Locations
{
    public class List
    {
        public class Query : IRequest<Result<List<Location>>> { }
        public class Handler : IRequestHandler<Query, Result<List<Location>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<Location>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var locations = await _context.Locations
                  .ToListAsync(cancellationToken);

                return Result<List<Location>>.Success(locations);
            }
        }
    }
}