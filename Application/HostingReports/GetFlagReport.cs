using Application.Core;
using Application.GraphSchedules;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.HostingReports
{
    public class GetFlagReport
    {
        public class Query : IRequest<Result<List<FlagReportDTO>>>
        {
            public int Month { get; set; }
            public string Direction { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<List<FlagReportDTO>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<List<FlagReportDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                int currentYear = DateTime.Now.Year;
                int currentMonth = DateTime.Now.Month;
                int targetYear = GetTargetYear(currentMonth, request.Month, request.Direction);

            var hostingReports = await _context.HostingReports
    .Join(_context.Activities,
        hr => hr.ActivityId,
        a => a.Id,
        (hr, a) => new { HostingReport = hr, Activity = a })
    .Where(joined => joined.Activity.Report == "Hosting Report")
    .Where(joined => joined.HostingReport.FlagSupport == true)
    .Where(joined => joined.Activity.LogicalDeleteInd == false)
    .Where(joined => joined.Activity.Start.Month == request.Month && joined.Activity.Start.Year == targetYear) // Use calculated year
    .Select(joined => new
    {
        HostingReport = joined.HostingReport,
        Activity = joined.Activity
    })
    .ToListAsync(cancellationToken);

                List<FlagReportDTO> flagReports = new List<FlagReportDTO>();

                foreach (var item in hostingReports)
                {

                    flagReports.Add(new FlagReportDTO
                    {
                        StartDate = item.Activity.Start.Date.ToString("ddd, d MMM"),
                        Name = item.HostingReport.GuestName,
                        Rank = item.HostingReport.GuestRank,
                        Title = item.HostingReport.GuestTitle,
                        PurposeOfVisit = item.HostingReport.PurposeOfVisit,
                        StartTime = item.Activity.Start.ToString("ddd, d MMM HH:mm"),
                        SetupTime = item.HostingReport.FlagSetUp.HasValue
                        ? item.HostingReport.FlagSetUp.Value.ToString("ddd, d MMM HH:mm")
                        : item.Activity.Start.AddHours(-1).ToString("ddd, d MMM HH:mm"),
                    ActionOfficer = item.Activity.ActionOfficer,
                        ActionOfficerPhone = item.Activity.ActionOfficerPhone,
                        FlagDetails = item.HostingReport.FlagDetails,
                        ActivityId = item.Activity.Id,
                        CategoryId = item.Activity.CategoryId,
                        Year = item.Activity.Start.Year.ToString(),
                        Location = GetLocation(await GetLocation(item.Activity, allrooms), item.HostingReport),
                    });
                }

                return Result<List<FlagReportDTO>>.Success(flagReports);
            }

            private string GetLocation(string roomLocation, HostingReport hostingReport)
            {
                if(!hostingReport.FlagBliss && !hostingReport.FlagLectureEast && !hostingReport.FlagLectureWest && !hostingReport.FlagRoomOther) return roomLocation;
                List<string> locations = new List<string>();    
                if(hostingReport.FlagBliss) locations.Add("Bliss Auditorium");
                if (hostingReport.FlagLectureEast) locations.Add("Lecture Hall East");
                if (hostingReport.FlagLectureWest) locations.Add("Lecture Hall West");
                if (hostingReport.FlagRoomOther) locations.Add(hostingReport.FlagRoomOtherText);
                return string.Join(", ", locations);
            }

            private async Task<string> GetLocation(Activity activity, Microsoft.Graph.IGraphServicePlacesCollectionPage allrooms)
            {
                var location = activity.PrimaryLocation;
                if(!string.IsNullOrEmpty(activity.EventLookup)) {
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
                            if(room != null)
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

private int GetTargetYear(int currentMonth, int requestedMonth, string direction)
{
    int currentYear = DateTime.Now.Year;

    if (direction == "backward" && requestedMonth > currentMonth)
    {
        return currentYear - 1; // Go to the previous year
    }
    else if (direction == "forward" && requestedMonth < currentMonth)
    {
        return currentYear + 1; // Move to the next year
    }

    return currentYear; // Same year
}
        }
    }
}
