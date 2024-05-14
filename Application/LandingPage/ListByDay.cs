using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using System.Diagnostics;

namespace Application.LandingPage
{
    public class ListByDay
    {
        public class Query : IRequest<Result<List<LandingPageEventDTO>>>
        {
            public DateTime Day { get; set; }
        }

        public class Handler: IRequestHandler<Query, Result<List<LandingPageEventDTO>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<List<LandingPageEventDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                List<LandingPageEventDTO> events = new List<LandingPageEventDTO>();

                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                var activities = await _context.Activities
                    .Include(x => x.Category)
                    .Where(x => x.Start < request.Day.Date.AddDays(1) && x.End >= request.Day.Date)
                    .Where(x => x.IMC == true)
                   . Where(x => !x.LogicalDeleteInd)
                    .ToListAsync();

                foreach (var activity in activities) {
                    string formatString = activity.AllDayEvent ? "MM-dd-yyyy" : "MM-dd-yyyy hh:mm tt";
                    string formattedStart = activity.Start.ToString(formatString);
                    string formattedEnd = activity.End.ToString(formatString);
                    string location = string.IsNullOrEmpty(activity.EventLookup) ? activity.PrimaryLocation : await GetLocation(activity.EventLookup, activity .PrimaryLocation, activity.CoordinatorEmail, allrooms);

                    events.Add(new LandingPageEventDTO
                    {
                        Title= activity.Title,
                        Description= activity.Description,
                        POC = activity.ActionOfficer,
                        Start = formattedStart,    
                        End = formattedEnd,
                        Location = location,
                        Link =  $"https://apps.armywarcollege.edu/eem?id={activity.Id}&categoryid={activity.CategoryId}"
                    });
                }

                return Result<List<LandingPageEventDTO>>.Success(events);
            }

            private async Task<string> GetLocation(string eventLookup, string primaryLocation, string coordinator, IGraphServicePlacesCollectionPage allrooms)
            {
                string coordinatorEmail = coordinator.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? coordinator : GraphHelper.GetEEMServiceAccount();
                Event evt;
                try
                {
                    evt = await GraphHelper.GetEventAsync(coordinatorEmail, eventLookup, null, null, null);
                }
                catch (Exception)
                {
                    try
                    {
                        evt = await GraphHelper.GetEventAsync(GraphHelper.GetEEMServiceAccount(), eventLookup, null, null, null );
                    }
                    catch (Exception)
                    {

                        return primaryLocation;
                    }
                   
                }
                var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();
                List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                int index = 0;

                if (evt != null && evt.Attendees != null)
                {
                    foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                    {

                        newActivityRooms.Add(new ActivityRoom
                        {
                            Id = index++,
                            Name = getName(item, allrooms),
                            Email = item.EmailAddress.Address
                        });
                    }
                }

                if (newActivityRooms.Any()) return string.Join(", ", newActivityRooms.Select(x => x.Name.Replace(',', ';')).ToArray());
                return primaryLocation; 
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
