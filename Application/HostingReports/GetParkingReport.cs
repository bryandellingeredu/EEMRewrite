using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using Application.Core;

namespace Application.HostingReports
{
    public class GetParkingReport
    {

        public class Query : IRequest<Result<List<ParkingReportDTO>>>
        {
            public int Month { get; set; }
            public string Direction { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<ParkingReportDTO>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<List<ParkingReportDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                int currentYear = DateTime.Now.Year;

                var hostingReports = await _context.HostingReports
            .Join(_context.Activities,
                hr => hr.ActivityId,
                a => a.Id,
                (hr, a) => new { HostingReport = hr, Activity = a })
            .Where(joined => joined.HostingReport.ParkingRequirements == true)
            .Where(joined => joined.Activity.LogicalDeleteInd == false)
            .Where(joined => joined.Activity.InternationalFellowsStaffEventPrivate == false)
            .Where(joined => request.Direction == "forward" ?
                (joined.Activity.Start.Month == request.Month && joined.Activity.Start.Year >= currentYear) :
                (joined.Activity.Start.Month == request.Month && joined.Activity.Start.Year <= currentYear))
            .Select(joined => new
            {
                HostingReport = joined.HostingReport,
                Activity = joined.Activity
            })
            .ToListAsync(cancellationToken);

                List<ParkingReportDTO> parkingReports = new List<ParkingReportDTO>();

                foreach (var item in hostingReports)
                {
                    parkingReports.Add(new ParkingReportDTO
                    {
                        StartDate = item.Activity.Start.Date.ToString("ddd, d MMM"),
                        Name = item.HostingReport.GuestName,
                        Rank = item.HostingReport.GuestRank,
                        Title = item.HostingReport.GuestTitle,
                        PurposeOfVisit = item.HostingReport.PurposeOfVisit,
                        ActionOfficer = item.Activity.ActionOfficer,
                        ActionOfficerPhone = item.Activity.ActionOfficerPhone,
                        ParkingDetails = item.HostingReport.ParkingDetails,
                        ActivityId = item.Activity.Id,
                        CategoryId = item.Activity.CategoryId,
                        Year = item.Activity.Start.Year.ToString(),
                        Location = await GetLocation(item.Activity, allrooms)
                    });
                }
                return Result<List<ParkingReportDTO>>.Success(parkingReports);
            }

            private async Task<string> GetLocation(Activity activity, Microsoft.Graph.IGraphServicePlacesCollectionPage allrooms)
            {
                var location = activity.PrimaryLocation;
                if (!string.IsNullOrEmpty(activity.EventLookup))
                {
                    Event evt;
                    try
                    {
                        evt = await GraphHelper.GetEventAsync(activity.CoordinatorEmail, activity.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail  );
                    }
                    catch (Exception)
                    {
                        return location;
                    }
                    if (evt != null && evt.Attendees != null)
                    {
                        var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();
                        List<string> roomNames = new List<string>();
                        foreach (var item in evt.Attendees.Where(x => allroomEmails.Contains(x.EmailAddress.Address)))
                        {
                            var room = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == item.EmailAddress.Address).FirstOrDefault();
                            if (room != null)
                            {
                                roomNames.Add(room.DisplayName);
                            }
                        }
                        if (roomNames.Any())
                        {
                            location = string.Join(", ", roomNames);
                        }
                    }
                }
                return location;
            }
        }


    }
}
