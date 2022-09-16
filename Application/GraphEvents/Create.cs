using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;

namespace Application.GraphEvents
{
    public class Create
    {
        public class Command : IRequest<Result<Event>>
        {
            public Event Event { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Event>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<Event>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                try
                {
                    Event result = await GraphHelper.CreateEvent(request.Event);
                    if (result == null)
                    {
                        return Result<Event>.Failure("Failed to Create an Activity");
                    }
                    return Result<Event>.Success(result);
                }
                catch (Exception e)
                {

                    return Result<Event>.Failure(e.Message);
                }
              
            }
        }

    }
}

