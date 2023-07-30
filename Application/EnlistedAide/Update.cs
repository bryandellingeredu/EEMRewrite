using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;

namespace Application.EnlistedAide
{
    public class Update
    {
        public class Command : IRequest<Result<Unit>>
        {
            public EnlistedAideCheckList EnlistedAideCheckList
            {
                get;
                set;
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;


            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }


            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var enlistedAideCheckList = await _context.EnlistedAideCheckLists.FindAsync(request.EnlistedAideCheckList.Id);
                _mapper.Map(request.EnlistedAideCheckList, enlistedAideCheckList);
                if (enlistedAideCheckList == null) return null;
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Update Enlisted Aide Check List");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
