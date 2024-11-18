using Application.Core;
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

namespace Application.GraphEvents
{
    public class Details
    {
        public class Query : IRequest<Result<Event>>
        {
            public string Email { get; set; }
            public string Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Event>>
        {
            private readonly IConfiguration _config;
            private readonly DataContext _context;
            public Handler(IConfiguration config, DataContext context)
            {
                _config = config;
                _context = context;
            }

            public async Task<Result<Event>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                var activity = await _context.Activities.FirstOrDefaultAsync(x => x.EventLookup == request.Id);
                string lastUpdatedBy = null;
                string createdBy = null;
                string eventCalendarId = null;
                string eventCalendarEmail = null;
                if (activity != null)
                {
                    if (activity.LastUpdatedBy != null)
                    {
                        lastUpdatedBy = activity.LastUpdatedBy;
                    }
                    if (activity.CreatedBy != null)
                    {
                        createdBy = activity.CreatedBy;
                    }
                    if (activity.EventLookupCalendar != null)
                    {
                        eventCalendarId = activity.EventLookupCalendar;
                    }
                    if (activity.EventLookupCalendarEmail != null)
                    {
                        eventCalendarEmail = activity.EventLookupCalendarEmail;
                    }
                }

                var result = await GraphHelper.GetEventAsync(request.Email, request.Id, lastUpdatedBy, createdBy, eventCalendarId, eventCalendarEmail);
                return Result<Event>.Success(result);
            }
        }
    }
}
