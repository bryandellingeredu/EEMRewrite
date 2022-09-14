using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
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
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<Event>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var result = await GraphHelper.GetEventAsync(request.Email, request.Id);
                return Result<Event>.Success(result);
            }
        }
    }
}
