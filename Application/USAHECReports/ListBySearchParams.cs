using  System.Linq;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;

 namespace Application.USAHECReports
{
    public class ListBySearchParams
    {
        public class Query : IRequest<Result<List<USAHECFacilitiesUsageDTO>>> {
            public USAHECFacilitiesUsageSearchParams searchParams { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<List<USAHECFacilitiesUsageDTO>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }
            public async Task<Result<List<USAHECFacilitiesUsageDTO >>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                var query = _context.Activities
                   .Include(c => c.Category)
                   .Where(x => x.CopiedTousahecFacilitiesUsage)
                   .Where(x => !x.LogicalDeleteInd)
                   .Where(x => !string.IsNullOrEmpty(x.EventLookup))
                   .Where(x => !string.IsNullOrEmpty(x.CoordinatorEmail))
                   .AsQueryable();

                if (!string.IsNullOrEmpty(request.searchParams.Title))
                {
                    query = query.Where(e => EF.Functions.Like(e.Title.ToLower(), "%" + request.searchParams.Title.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.searchParams. ActionOfficer))
                {
                    query = query.Where(e => e.ActionOfficer == request.searchParams.ActionOfficer);
                }

                if (!string.IsNullOrEmpty(request.searchParams.CreatedBy))
                {
                    query = query.Where(e => e.CreatedBy == request.searchParams.CreatedBy);
                }

                if (!string.IsNullOrEmpty(request.searchParams.USAHECFacilityReservationType))
                {
                    query = query.Where(e => e.USAHECFacilityReservationType == request.searchParams.USAHECFacilityReservationType);
                }



                if (!string.IsNullOrEmpty(request.searchParams.Start))
                {
                    int month = int.Parse(request.searchParams.Start.Split("-")[0]);
                    int day = int.Parse(request.searchParams.Start.Split("-")[1]);
                    int year = int.Parse(request.searchParams.Start.Split("-")[2]);
                    DateTime start = new DateTime(year, month, day,0,0,0);
                    query = query.Where(e => e.Start >= start);
                }

                if (!string.IsNullOrEmpty(request.searchParams.End))
                {
                    int month = int.Parse(request.searchParams.End.Split("-")[0]);
                    int day = int.Parse(request.searchParams.End.Split("-")[1]);
                    int year = int.Parse(request.searchParams.End.Split("-")[2]);
                    DateTime end = new DateTime(year, month, day, 23, 59, 59);
                    query = query.Where(e => e.End <= end);
                }

                    query = query.OrderBy(e => e.Start);
                
                var activities = await query.ToListAsync();

                foreach (var activity in activities)
                {
                    activity.Category.Activities = null;
                    if (activity.Organization != null)
                    {
                        activity.Organization.Activities = null;
                    }

                    if (activity.Recurrence != null)
                    {
                        activity.Recurrence.Activities = null;
                    }

         
                        string coordinatorEmail = activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            ? activity.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(coordinatorEmail, activity.EventLookup);
                        }
                        catch (Exception)
                        {
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(GraphHelper.GetEEMServiceAccount(), activity.EventLookup);
                        }
                        catch (Exception)
                        {

                            activity.EventLookup = string.Empty;
                            evt = new Event();
                        }
                           
                        }

                        var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

                        List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                        int index = 0;

                       if(evt !=null && evt.Attendees !=null)
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
                       if(!string.IsNullOrEmpty(activity.EventLookup))  activity.ActivityRooms = newActivityRooms;
                    
                }

                if (!string.IsNullOrEmpty(request.searchParams.Location))
                {
                    activities = activities.Where(activity =>
                        activity.ActivityRooms != null && activity.ActivityRooms.Any() && activity.ActivityRooms.Any(ar => ar.Name == request.searchParams.Location)
                    ).ToList();
                }

                List<USAHECFacilitiesUsageDTO> reportList = new List<USAHECFacilitiesUsageDTO>();

                if (activities != null)
                {
                    reportList = activities.Where(x => x.ActivityRooms != null && x.ActivityRooms.Any())
                        .Select(activity => new USAHECFacilitiesUsageDTO
                        {
                            Title = activity.Title,
                            USAHECFacilityReservationType= activity.USAHECFacilityReservationType,
                            Start = activity.Start,
                            End = activity.End,
                            Location = activity.ActivityRooms != null ? string.Join(", ", activity.ActivityRooms.Select(x => x.Name != null ? x.Name.Replace(',', ';') : "").ToArray()) : "",
                            CreatedBy = activity.CreatedBy,
                            AllDayEvent = activity.AllDayEvent,
                            Id = activity.Id,
                            CategoryId = activity.CategoryId,
                            ActionOfficer = activity.ActionOfficer,
                        })
                         .ToList();
                }

                return Result<List<USAHECFacilitiesUsageDTO>>.Success(reportList);
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