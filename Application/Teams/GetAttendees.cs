using System.Threading;
using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Domain;

namespace Application.Teams
{
    public class GetAttendees
    {
        public class Query : IRequest<Result<List<TextValueUser>>>
        {
            public TeamDeleteRequestDTO TeamDeleteRequestDTO { get; set; }
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
                try
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                    // Assuming GraphHelper.GetTeamsEventAttendees is available and properly scoped
                    var attendees = await GraphHelper.GetTeamsEventAttendees(request.TeamDeleteRequestDTO.Id, request.TeamDeleteRequestDTO.TeamRequester);

                    return Result<List<TextValueUser>>.Success(attendees);
                }
                catch (Exception ex)
                {
                    return Result<List<TextValueUser>>.Failure(ex.Message);
                }
            }
        }
    }
}
