using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.VTCCoordinators
{
    public class List
    {
        public class Query : IRequest<Result<List<RoomVTCCoordinator>>> { }
        public class Handler : IRequestHandler<Query, Result<List<RoomVTCCoordinator>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<RoomVTCCoordinator>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var roomVTCCoordinators = await _context.RoomVTCCoordinators
                  .ToListAsync(cancellationToken);

                return Result<List<RoomVTCCoordinator>>.Success(roomVTCCoordinators);
            }
        }
    }
}