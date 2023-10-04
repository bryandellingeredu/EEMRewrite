using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Application.Interfaces;
using Application.Emails;
using Application.GraphSchedules;
using System.Globalization;

namespace Application.ApproveEvent
{
    public class GetPlace
    {
        public class Query : IRequest<Result<Event[]>>
        {
            public string Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Event[]>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly ICACAccessor _cacAccessor;


            public Handler(DataContext context, IConfiguration config, ICACAccessor cacAccesor)
            {
                _context = context;
                _config = config;   
                _cacAccessor = cacAccesor;
            }

            public async Task<Result<Event[]>> Handle(Query request, CancellationToken cancellationToken)
            {

                try
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    var rooms = await GraphHelper.GetRoomsAsync();
                    var room = rooms.Where(x => x.Id == request.Id).FirstOrDefault();

                    if (room == null)
                    {
                        return Result<Event[]>.Failure("Room not found");
                    }

                    var result = await GraphHelper.GetRoomEvents(room.AdditionalData["emailAddress"].ToString());
                    return Result<Event[]>.Success(result);
                }
                catch (Exception ex)
                {
                    // Log the exception or handle it as needed
                    return Result<Event[]>.Failure($"An error occurred: {ex.Message}");
                }

            }


  

        }
    }
}
