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
            public Guid MemberId { get; set; }
            public Guid GroupId { get; set; }
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
                var emailGroupMemberJunctions = await _context.EmailGroupEmailGroupMemberJunctions
                    .Where(x => x.EmailGroupId == request.GroupId)
                    .Where(x => x.EmailGroupMemberId == request.MemberId)
                    .ToListAsync();


                if (emailGroupMemberJunctions.Any())
                {
                    _context.EmailGroupEmailGroupMemberJunctions.RemoveRange(emailGroupMemberJunctions);
                }

                var success = await _context.SaveChangesAsync() > 0;

               var emailGroupEmailGroupMemberJunctions2 = await _context.EmailGroupEmailGroupMemberJunctions
                    .Where(x => x.EmailGroupMemberId == request.MemberId)
                    .ToListAsync();

                if (!emailGroupEmailGroupMemberJunctions2.Any())
                {
                    var emailGroupMember = await _context.EmailGroupMembers.FindAsync(request.MemberId);
                    _context.EmailGroupMembers.Remove(emailGroupMember);
                    await _context.SaveChangesAsync();
                }

                if (success) return Result<Unit>.Success(Unit.Value);
                return Result<Unit>.Failure("Problem deleting email group member");
            }
        }

        }
}
