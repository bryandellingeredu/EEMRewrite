using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.EmailGroups
{
    public class ListGroups
    {
        public class Query : IRequest<Result<List<EmailGroup>>> { }
        public class Handler : IRequestHandler<Query, Result<List<EmailGroup>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<EmailGroup>>> Handle(
                Query request, CancellationToken cancellationToken) =>
              Result<List<EmailGroup>>.Success(await _context.EmailGroups.ToListAsync());
         
        }
    }
}