using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Persistence;

namespace Application.EnlistedAide
{
    public class Confirm
    {
        public class Command : IRequest<Result<Unit>>
        {
            public EnlistedAideConfirmationDTO EnlistedAideConfirmationDTO
            {
                get;
                set;
            }
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
                var activity = await _context.Activities.FindAsync(request.EnlistedAideConfirmationDTO.Id);
                activity.EnlistedAideAcknowledged = request.EnlistedAideConfirmationDTO.EnlistedAideAcknowledged;
                activity.EnlistedAideNumOfBartenders = request.EnlistedAideConfirmationDTO.EnlistedAideNumOfBartenders;
                activity.EnlistedAideNumOfServers = request.EnlistedAideConfirmationDTO.EnlistedAideNumOfServers;
                activity.EnlistedAideSupportNeeded = request.EnlistedAideConfirmationDTO.EnlistedAideSupportNeeded;
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Confirm EA");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
