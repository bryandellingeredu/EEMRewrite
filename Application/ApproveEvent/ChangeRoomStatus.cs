using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.ApproveEvent
{
    public class ChangeRoomStatus
    {
        public class Command : IRequest<Result<Unit>>
        {
            public ChangeRoomStatusDTO ChangeRoomStatusDTO
            {
                get;
                set;
            }
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
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                await GraphHelper.ChangeRoomStatus(request.ChangeRoomStatusDTO.Id, request.ChangeRoomStatusDTO.RoomEmail, request.ChangeRoomStatusDTO.Status);
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
