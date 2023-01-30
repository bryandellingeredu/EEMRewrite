using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
namespace Application.EmailGroups
{
    public class List
    {
        public class Query : IRequest<Result<List<EmailGroupMemberDTO>>> { }
        public class Handler : IRequestHandler<Query, Result<List<EmailGroupMemberDTO>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<EmailGroupMemberDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var emailGroupMemberDTOs = await _context.EmailGroupMembers
                    .Include(x => x.EmailGroups)
                    .ThenInclude(x => x.EmailGroup)
                    .Select(egm => new EmailGroupMemberDTO
                    {
                        Id = egm.Id,
                        DisplayName = egm.DisplayName,
                        Email = egm.Email,
                        EmailGroups = egm.EmailGroups.Select(junction => new EmailGroupDTO
                        {
                            Id = junction.EmailGroup.Id,
                            Name = junction.EmailGroup.Name
                        }).ToList()
                    }).ToListAsync(cancellationToken);

                return Result<List<EmailGroupMemberDTO>>.Success(emailGroupMemberDTOs);
            }
        }
    }
}