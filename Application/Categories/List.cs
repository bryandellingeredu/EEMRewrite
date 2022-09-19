using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.Categories
{
    public class List
    {
        public class Query : IRequest<Result<List<Category>>> { }
        public class Handler : IRequestHandler<Query, Result<List<Category>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<Category>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var categories = await _context.Categories
                  .ToListAsync(cancellationToken);

                return Result<List<Category>>.Success(categories);
            }
        }
    }
}