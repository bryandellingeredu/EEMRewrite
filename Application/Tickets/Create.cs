using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using System;


namespace Application.Tickets
{
    public class Create
    {
        public class Command : IRequest<Result<Unit>>
        {
            public TicketDTO TicketDTO { get; set; }

            public string Email { get; set; }

        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                DateTime startDateTime = DateTime.Parse(request.TicketDTO.Start);
                DateTime endDateTime = DateTime.Parse(request.TicketDTO.End);

                string formattedStartDate = startDateTime.ToString("MMMM dd, yyyy h:mm tt");
                string formattedEndDate = endDateTime.ToString("MMMM dd, yyyy h:mm tt");

                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                string subject = "A ticket was entered for an EEM room event";
                string body = $"<p>A ticket was entered for an EEM room event by {request.Email}</p>";
                body = body + $"<p><strong>Room: </strong> {request.TicketDTO.Room}</p>";
                body = body + $"<p><strong>Title: </strong> {request.TicketDTO.Title}</p>";
                body = body + $"<p><strong>Start: </strong> {formattedStartDate}</p>";
                body = body + $"<p><strong>End: </strong> {formattedEndDate}</p>";
                if(!string.IsNullOrEmpty(request.TicketDTO.Comments)) {
                    body = body + $"<p><strong>Comments: </strong> {request.TicketDTO.Comments}</p>";
                }
                body = body + "<p></p><p></p><p> An email will be sent to you when the event has been fixed </p>";

                List<string> recipients = new List<string>();
                recipients.Add("bryan.d.dellinger.civ@army.mil");
                recipients.Add(request.Email);

                await GraphHelper.SendEmail(recipients.ToArray(), subject, body);
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
