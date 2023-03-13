using  System.Linq;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;

namespace Application.HostingReports
{
    public class ListBySearchParams
    {
        public class Query : IRequest<Result<List<HostingReportTableDTO>>> {
          public HostingReportTableSearchParams searchParams { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<List<HostingReportTableDTO>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }
            public async Task<Result<List<HostingReportTableDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                var query = _context.Activities
                   .Include(c => c.Category)
                   .Include(o => o.Organization)
                   .Include(h => h.HostingReport)
                   .Where(x => !x.LogicalDeleteInd)
                   .Where(h =>h.HostingReport != null)  
                   .AsQueryable();

                if (!string.IsNullOrEmpty(request.searchParams.Title))
                {
                    query = query.Where(e => EF.Functions.Like(e.Title.ToLower(), "%" + request.searchParams.Title.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.searchParams. ActionOfficer))
                {
                    query = query.Where(e => e.ActionOfficer == request.searchParams.ActionOfficer);
                }

                if (!string.IsNullOrEmpty(request.searchParams.OrganizatonId))
                {
                    Guid organizationId = Guid.Parse(request.searchParams.OrganizatonId);
                    query = query.Where(e => e.OrganizationId == organizationId);
                }

                if (!string.IsNullOrEmpty(request.searchParams.GuestRank))
                {
                    query = query.Where(e => e.HostingReport.GuestRank == request.searchParams.GuestRank);
                }

                if (!string.IsNullOrEmpty(request.searchParams.GuestTitle))
                {
                    query = query.Where(e => e.HostingReport.GuestTitle == request.searchParams.GuestTitle);
                }

                if (!string.IsNullOrEmpty(request.searchParams.HostingReportStatus))
                {
                    query = query.Where(e => e.HostingReport.HostingReportStatus == request.searchParams.HostingReportStatus);
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


                if (string.IsNullOrEmpty(request.searchParams.Location))
                {
                    query = query.OrderBy(e => e.Start).Take(100);
                }
                else
                {
                    query = query.OrderBy(e => e.Start);
                }
         

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

                    if (!string.IsNullOrEmpty(activity.EventLookup) && !string.IsNullOrEmpty(activity.CoordinatorEmail))
                    {
                        string coordinatorEmail = activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            ? activity.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(coordinatorEmail, activity.EventLookup);
                        }
                        catch (Exception)
                        {
                            activity.EventLookup = string.Empty;
                            evt = new Event();
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
                }

                if (!string.IsNullOrEmpty(request.searchParams.Location))
                {
                    activities = activities.Where(activity =>
                        activity.ActivityRooms != null && activity.ActivityRooms.Any()
                        ? activity.ActivityRooms.Any(ar => ar.Name == request.searchParams.Location)
         :                  activity.PrimaryLocation == request.searchParams.Location
                    ).ToList();
                }

                List<HostingReportTableDTO> reportList = new List<HostingReportTableDTO>();
                 reportList = activities
                     .GroupBy(a => a.Title)
                     .Select(g => g.OrderBy(a => a.Start).First())
                    .Select(activity => new HostingReportTableDTO
                     {
                        Title = activity.Title,
                        Start = activity.Start,
                        End = activity.End,
                         Location = activity.ActivityRooms.Any()
                            ? activity.ActivityRooms.Select(x => x.Name).Any()
                                ? string.Join(", ", activity.ActivityRooms.Select(x => x.Name).ToArray())
                                 : activity.PrimaryLocation
                            : activity.PrimaryLocation,
                        OrganizatonName = activity.Organization?.Name,
                        HostingReportStatus = activity.HostingReport.HostingReportStatus,
                        GuestRank = activity.HostingReport.GuestRank,
                        GuestTitle = activity.HostingReport.GuestTitle,
                        CreatedBy = activity.CreatedBy,
                        AllDayEvent = activity.AllDayEvent,
                        Id= activity.Id,
                        CategoryId= activity.CategoryId,
                        ActionOfficer=activity.ActionOfficer,
                        })
                         .ToList();

                return Result<List<HostingReportTableDTO>>.Success(reportList);
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