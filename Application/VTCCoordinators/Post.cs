using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.VTCCoordinators
{
    public class Post
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RoomVTCCoordinator RoomVTCCoordinator
            {
                get;
                set;
            }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(
               DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                await _context.RoomVTCCoordinators.AddAsync(request.RoomVTCCoordinator);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Create VTC Coordinator");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
