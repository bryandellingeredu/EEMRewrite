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
    public class AddMemberToGroup
    {
        public class Command : IRequest<Result<Unit>>
        {
            public EmailGroupMemberDTO EmailGroupMemberDTO
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

                var emailGroupMember = await _context.EmailGroupMembers.Where(x => x.Email == request.EmailGroupMemberDTO.Email).FirstOrDefaultAsync();

                if(emailGroupMember == null)
                {
                    emailGroupMember = new EmailGroupMember { DisplayName = request.EmailGroupMemberDTO.DisplayName, Email = request.EmailGroupMemberDTO.Email };
                    await _context.EmailGroupMembers.AddAsync(emailGroupMember);
                    await _context.SaveChangesAsync();
                }

                EmailGroupEmailGroupMemberJunction emailGroupMemberJuntion = new EmailGroupEmailGroupMemberJunction
                {
                    EmailGroupId = request.EmailGroupMemberDTO.GroupId,
                    EmailGroupMemberId = emailGroupMember.Id
                };


                await _context.EmailGroupEmailGroupMemberJunctions.AddAsync(emailGroupMemberJuntion);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Create Email Group Member and Junctions");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
