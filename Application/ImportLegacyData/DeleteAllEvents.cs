using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.ImportLegacyData
{
    public class DeleteAllEvents
    {
        public class Command : IRequest<Result<Unit>>
        {
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IConfiguration _config;

            public Handler(
          DataContext context, IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                foreach (var item in RoomData.Data.Values)
                {
                    try
                    {
                        await GraphHelper.DeleteRoomCalendarEvents(item["Email"]);
                    }
                    catch (Exception ex)
                    {

                        continue;
                    }
                  
                }
                 
                return Result<Unit>.Success(Unit.Value);
            }
        }

    }
}
