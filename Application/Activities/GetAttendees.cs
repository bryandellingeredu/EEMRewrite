using System.Threading;
using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities
{
    public class GetAttendees
    {
        public class Query : IRequest<Result<List<TextValueUser>>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<TextValueUser>>>
        {
            private readonly IConfiguration _config;
            private readonly DataContext _context;

            public Handler(IConfiguration config, DataContext context)
            {
                _config = config;
                _context = context; 
            }

            public async Task<Result<List<TextValueUser>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.Where(x => x.Id == request.Id).FirstAsync();
                if (activity != null &&
                   !string.IsNullOrEmpty(activity.EventLookup) &&
                   !string.IsNullOrWhiteSpace(activity.EventLookup) &&
                   !string.IsNullOrEmpty(activity.EventLookupCalendarEmail) &&
                   !string.IsNullOrWhiteSpace(activity.EventLookupCalendarEmail)
                   )
                {
                    try
                    {
                        Settings s = new Settings();
                        var settings = s.LoadSettings(_config);
                        GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                        // Assuming GraphHelper.GetTeamsEventAttendees is available and properly scoped
                        var attendees = await GraphHelper.GetEventAttendees(activity.EventLookup, activity.EventLookupCalendarEmail);

                        return Result<List<TextValueUser>>.Success(attendees);
                    }
                    catch (Exception ex)
                    {
                        return Result<List<TextValueUser>>.Success(new List<TextValueUser>());
                    }
                }
                return Result<List<TextValueUser>>.Success(new List<TextValueUser>());
            }
        }
    }
}
