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

namespace Application.RoomDelegates
{
    public class Post
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RoomDelegate RoomDelegate
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
                await _context.RoomDelegates.AddAsync(request.RoomDelegate);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Create Room Delegate");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
