using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Application.Core;
using FluentValidation;

namespace Application.GraphSchedules
{
    public class List
    {
        public class Command : IRequest<Result<ICalendarGetScheduleCollectionPage>>
        {
            public ScheduleRequestDTO ScheduleRequestDTO { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.ScheduleRequestDTO).SetValidator(new GraphScheduleValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<ICalendarGetScheduleCollectionPage>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<ICalendarGetScheduleCollectionPage>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(request.ScheduleRequestDTO);
                return Result<ICalendarGetScheduleCollectionPage>.Success(result);
            }
        }
    }
}
