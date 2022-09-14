using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Core;

namespace Application.GraphEvents
{
    public class List
    {
        public class Query : IRequest<Result<IUserEventsCollectionPage>>
        {
            public string Email { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<IUserEventsCollectionPage>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<IUserEventsCollectionPage>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var result = await GraphHelper.GetEventsAsync(request.Email);
                return Result<IUserEventsCollectionPage>.Success(result);
            }
        }
    }
}
