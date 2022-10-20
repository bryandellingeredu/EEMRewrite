using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Recurrences
{
    public class Details
    {
        public class Query : IRequest<Result<Recurrence>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Recurrence>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Recurrence>> Handle(Query request, CancellationToken cancellationToken)
            {
                var recurrence = await _context.Recurrences.Include(a => a.Activities).FirstOrDefaultAsync(a => a.Id == request.Id);
                return Result<Recurrence>.Success(recurrence);  
            }
        }

    }
}
