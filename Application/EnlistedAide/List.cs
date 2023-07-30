using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.EnlistedAide
{
    public class List
    {
        public class Query : IRequest<Result<List<EnlistedAideCheckList>>> { }
        public class Handler : IRequestHandler<Query, Result<List<EnlistedAideCheckList>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context) =>  _context = context;

            public async Task<Result<List<EnlistedAideCheckList>>> Handle(Query request, CancellationToken cancellationToken) =>
                Result<List<EnlistedAideCheckList>>.Success(
                    await _context.EnlistedAideCheckLists
                        .Include(x => x.Activity)
                        .Where(x => x.Activity.LogicalDeleteInd == false)
                        .ToListAsync(cancellationToken)
           );
          }
        }
    }
