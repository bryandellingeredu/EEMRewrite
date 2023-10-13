using Application.Core;
using Domain;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphUsers
{
    public class ListTextValue
    {
        public class Query : IRequest<Result<List<TextValueUser>>>
        {

        }

        public class Handler : IRequestHandler<Query, Result<List<TextValueUser>>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<List<TextValueUser>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var result = await GraphHelper.GetAllUsersTextValueAsync();
                return Result<List<TextValueUser>>.Success(result);
            }
        }
    }
}
