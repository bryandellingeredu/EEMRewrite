using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Teams
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public TeamDeleteRequestDTO TeamDeleteRequestDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                    var graphResult = await GraphHelper.DeleteEvent(request.TeamDeleteRequestDTO.Id, request.TeamDeleteRequestDTO.TeamRequester);
                    if (!graphResult) // Assuming DeleteEvent returns a bool indicating success
                    {
                        return Result<Unit>.Failure("Failed to delete the Teams event.");
                    }

                    var activity = await _context.Activities
                        .FirstOrDefaultAsync(x => x.TeamLookup == request.TeamDeleteRequestDTO.Id, cancellationToken);

                    if (activity != null)
                    {
                        activity.TeamLookup = null;
                        activity.TeamRequester = null;
                        activity.TeamLink = null;
                        await _context.SaveChangesAsync(cancellationToken);
                    }

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {
                    return Result<Unit>.Failure($"An error occurred: {ex.Message}");
                }
            }

        }


    }
}
