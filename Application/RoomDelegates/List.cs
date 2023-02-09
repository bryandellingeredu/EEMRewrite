using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.RoomDelegates
{
    public class List
    {
        public class Query : IRequest<Result<List<RoomDelegate>>> { }
        public class Handler : IRequestHandler<Query, Result<List<RoomDelegate>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<RoomDelegate>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var roomDelegates = await _context.RoomDelegates
                  .ToListAsync(cancellationToken);

                return Result<List<RoomDelegate>>.Success(roomDelegates);
            }
        }
    }
}