
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;
using System.Diagnostics;
using Microsoft.Graph;

namespace Application.Activities
{
    public class GetRoomNames
    {
        public class Query : IRequest<Result<string>>
        {
            public string EventLookup { get; set; }
            public string CoordinatorEmail { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<string>>
        {

            private readonly IConfiguration _config;

            public Handler(IConfiguration config)
            {
                _config = config;
            }

            public async Task<Result<string>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                string coordinatorEmail = request.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            ? request.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                var evt = await GraphHelper.GetEventAsync(coordinatorEmail, request.EventLookup);
                var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                int index = 0;

                foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                {

                    newActivityRooms.Add(new ActivityRoom
                    {
                        Id = index++,
                        Name = getName(item, allrooms),
                        Email = item.EmailAddress.Address
                    });
                }

                string roomNames = string.Empty;

                if (newActivityRooms.Any())
                {
                    roomNames = String.Join( ", ", newActivityRooms.Select(x => x.Name).ToArray());
                }

                return Result<string>.Success(roomNames);
            }

            private string getName(Attendee item, IGraphServicePlacesCollectionPage allrooms)
            {
                var room = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == item.EmailAddress.Address).FirstOrDefault();
                string name = room.DisplayName;
                return name;
            }

        }
    }
}
