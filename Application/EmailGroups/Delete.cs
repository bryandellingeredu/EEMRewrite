using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailGroups
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var emailGroupMember = await _context.EmailGroupMembers.FindAsync(request.Id, cancellationToken);
                if (emailGroupMember == null) return null;
               var junctions = await _context.EmailGroupEmailGroupMemberJunctions.Where(x => x.EmailGroupMemberId == request.Id).ToListAsync();
                if (junctions.Any())
                {
                    _context.EmailGroupEmailGroupMemberJunctions.RemoveRange(junctions);
                }   
                _context.EmailGroupMembers.Remove(emailGroupMember);
                var success = await _context.SaveChangesAsync() > 0;
                if (success) return Result<Unit>.Success(Unit.Value);
                return Result<Unit>.Failure("Problem deleting email group member");
            }
        }
        

        }
}
