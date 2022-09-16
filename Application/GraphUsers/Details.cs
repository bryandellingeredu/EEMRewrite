using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
namespace Application.GraphUsers
{
    public class Details
    {
        public class Query : IRequest<Result<User>>
        {
            public string Email { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<User>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<User>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var result = await GraphHelper.GetUserAsync(request.Email);
                return Result<User>.Success(result);
            }
        }
    }
}
