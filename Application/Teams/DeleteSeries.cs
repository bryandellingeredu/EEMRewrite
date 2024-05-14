using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Teams
{
    public class DeleteSeries
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context,  IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {

                    var activityFromRequest = await _context.Activities.FindAsync(request.Id);
                    if (activityFromRequest.RecurrenceInd)
                    {
                        Settings s = new Settings();
                        var settings = s.LoadSettings(_config);
                        GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                        var activities = await _context.Activities.Where(x => x.RecurrenceId == activityFromRequest.RecurrenceId).ToListAsync();
                        foreach (var activity in activities)
                        {
                            if (!string.IsNullOrEmpty(activity.TeamLookup) && !string.IsNullOrEmpty(activity.TeamRequester))
                            {
                                try
                                {
                                    var graphResult = await GraphHelper.DeleteEvent(activity.TeamLookup, activity.TeamRequester, activity.CoordinatorEmail, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar);
                                }
                                catch (Exception)
                                {
                                    //do nothing keep going
                                }
                               
                            }
                            activity.TeamRequester = null;
                            activity.TeamLookup= null;
                            activity.TeamLink= null;    
                     
                        }
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to delete the series");
                        return Result<Unit>.Success(Unit.Value);
                    }

                }

                catch (Exception ex)
                {
                    return Result<Unit>.Failure($"An error occurred: {ex.Message}");
                }
                return Result<Unit>.Failure("Uncovered case");
            }
        }
    }
}
