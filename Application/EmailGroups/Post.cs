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

namespace Application.EmailGroups
{
    public class Post
    {
        public class Command : IRequest<Result<Unit>>
        {
            public EmailGroupMemberPostData EmailGroupMemberPostData
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

                var junctionsToDelete = await  _context.EmailGroupEmailGroupMemberJunctions.Where(x => x.EmailGroupMemberId == request.EmailGroupMemberPostData.Id).ToListAsync();
                if (junctionsToDelete.Any())
                {
                    _context.EmailGroupEmailGroupMemberJunctions.RemoveRange(junctionsToDelete);
                }
               

                EmailGroupMember emailGroupMember;
                emailGroupMember = await _context.EmailGroupMembers.FirstOrDefaultAsync(x => x.Id == request.EmailGroupMemberPostData.Id);
                if (emailGroupMember == null)
                {
                    emailGroupMember = new EmailGroupMember
                    {
                        Id = request.EmailGroupMemberPostData.Id,
                        DisplayName = request.EmailGroupMemberPostData.DisplayName,
                        Email = request.EmailGroupMemberPostData.Email,
                    };
                    await _context.EmailGroupMembers.AddAsync(emailGroupMember);
                }
                else
                {
                    emailGroupMember.DisplayName = request.EmailGroupMemberPostData.DisplayName;
                    emailGroupMember.Email = request.EmailGroupMemberPostData.Email;
                }

                List<EmailGroupEmailGroupMemberJunction> junctions = new List<EmailGroupEmailGroupMemberJunction>();
                foreach (Guid emailGroupId in request.EmailGroupMemberPostData.RoleIds)
                {
                    junctions.Add(new EmailGroupEmailGroupMemberJunction { EmailGroupId = emailGroupId, EmailGroupMemberId = emailGroupMember.Id });
                }
                await _context.EmailGroupEmailGroupMemberJunctions.AddRangeAsync(junctions);

                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Create Email Group Member and Junctions");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
