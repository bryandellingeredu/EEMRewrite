using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.Organizations
{
    public class List
    {
        public class Query : IRequest<Result<List<Organization>>> { }
        public class Handler : IRequestHandler<Query, Result<List<Organization>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<Organization>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var organizations = await _context.Organizations
                  .ToListAsync(cancellationToken);

                return Result<List<Organization>>.Success(organizations);
            }
        }
    }
}