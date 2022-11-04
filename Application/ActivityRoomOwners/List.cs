using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.ActivityRoomOwners
{
    public class List
    {
        public class Query : IRequest<Result<List<ActivityRoomOwner>>> { }
        public class Handler : IRequestHandler<Query, Result<List<ActivityRoomOwner>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<ActivityRoomOwner>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var activityRoomOwners = await _context.ActivityRoomOwners
                  .ToListAsync(cancellationToken);

                return Result<List<ActivityRoomOwner>>.Success(activityRoomOwners);
            }
        }
    }
}