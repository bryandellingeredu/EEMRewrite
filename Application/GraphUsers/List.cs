﻿using Application.Core;
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
    public class List
    {
        public class Query : IRequest<Result<IGraphServiceUsersCollectionPage>>
        {

        }

        public class Handler : IRequestHandler<Query, Result<IGraphServiceUsersCollectionPage>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<IGraphServiceUsersCollectionPage>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var result = await GraphHelper.GetUsersAsync();
                return Result<IGraphServiceUsersCollectionPage>.Success(result);
            }
        }
    }
}
