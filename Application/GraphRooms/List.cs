using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphRooms
{
    public class List
    {
        public class Query : IRequest<IGraphServicePlacesCollectionPage>
        {
        }

        public class Handler : IRequestHandler<Query, IGraphServicePlacesCollectionPage>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<IGraphServicePlacesCollectionPage> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var result = await GraphHelper.GetRoomsAsync();
                return result;
            }
        }
    }
}
