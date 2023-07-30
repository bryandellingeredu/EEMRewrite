using Application.Core;
using AutoMapper;
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

namespace Application.EnlistedAide
{
    public class Details
    {
        public class Query : IRequest<Result<EnlistedAideCheckList>>
        {
            public Guid ActivityId { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<EnlistedAideCheckList>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context) => _context = context;

            public async Task<Result<EnlistedAideCheckList>> Handle(Query request, CancellationToken cancellationToken)
            {
                var enlistedAideCheckList = await _context.EnlistedAideCheckLists
                     .Include(a => a.Activity)
                     .Where(x => x.Activity.LogicalDeleteInd == false)
                     .FirstOrDefaultAsync(x => x.ActivityId == request.ActivityId);

                if (enlistedAideCheckList == null) return null;

                return Result<EnlistedAideCheckList>.Success(enlistedAideCheckList);

            }
        }
    }
}
