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
    public class Details
    {
        public class Query : IRequest<Result<EmailGroupMemberDTO>> {
            public Guid Id { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<EmailGroupMemberDTO>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<EmailGroupMemberDTO>> Handle(Query request, CancellationToken cancellationToken)
            {
                var emailGroupMemberDTO = await _context.EmailGroupMembers
                    .Where(x => x.Id == request.Id) 
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
                    }).FirstOrDefaultAsync(cancellationToken);

                return Result<EmailGroupMemberDTO>.Success(emailGroupMemberDTO);
            }
        }
    }
}