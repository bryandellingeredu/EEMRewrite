using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using Persistence.Migrations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.HostingReports
{
    public class ListOutsiderBySearchParams
    {
        public class Query : IRequest<Result<List<OutsiderReportTableDTO>>>
        {
            public OutsiderReportTableSearchParams searchParams { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<List<OutsiderReportTableDTO>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }
            public async Task<Result<List<OutsiderReportTableDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                var query = _context.Activities
                    .Where(a => a.Report == "Outsiders Report")
                   .Include(c => c.Category)
                   .Include(o => o.Organization)
                   .Include(h => h.HostingReport)
                   .Where(x => !x.LogicalDeleteInd)
                   .Where(h => h.HostingReport != null)

                   .AsQueryable();

                if (!string.IsNullOrEmpty(request.searchParams.Title))
                {
                    query = query.Where(e => EF.Functions.Like(e.Title.ToLower(), "%" + request.searchParams.Title.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.searchParams.ActionOfficer))
                {
                    query = query.Where(e => e.ActionOfficer == request.searchParams.ActionOfficer);
                }



                if (!string.IsNullOrEmpty(request.searchParams.OutsiderReportStatus))
                {
                    query = query.Where(e => e.HostingReport.OutsiderReportStatus == request.searchParams.OutsiderReportStatus);
                }

                if (!string.IsNullOrEmpty(request.searchParams.OutsiderReportDirectorate))
                {
                    query = query.Where(e => EF.Functions.Like(e.HostingReport.OutsiderReportDirectorate.ToLower(), "%" + request.searchParams.OutsiderReportDirectorate.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.searchParams.OutsiderReportEngagement))
                {
                    query = query.Where(e => EF.Functions.Like(e.HostingReport.OutsiderReportEngagement.ToLower(), "%" + request.searchParams.OutsiderReportEngagement.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.searchParams.OutsiderReportUSAWCGraduate))
                {
                    query = query.Where(e => EF.Functions.Like(e.HostingReport.OutsiderReportUSAWCGraduate.ToLower(), "%" + request.searchParams.OutsiderReportUSAWCGraduate.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.searchParams.OutsiderReportDV))
                {
                    query = query.Where(e => EF.Functions.Like(e.HostingReport.OutsiderReportDV.ToLower(), "%" + request.searchParams.OutsiderReportDV.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.searchParams.OutsiderReportNumOfPeople))
                {
                    query = query.Where(e => EF.Functions.Like(e.HostingReport.OutsiderReportNumOfPeople.ToLower(), "%" + request.searchParams.OutsiderReportNumOfPeople.ToLower() + "%"));
                }


                if (!string.IsNullOrEmpty(request.searchParams.Start))
                {
                    int month = int.Parse(request.searchParams.Start.Split("-")[0]);
                    int day = int.Parse(request.searchParams.Start.Split("-")[1]);
                    int year = int.Parse(request.searchParams.Start.Split("-")[2]);
                    DateTime start = new DateTime(year, month, day, 0, 0, 0);
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
                    query = query.OrderBy(e => e.Start).Take(500);
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
                            evt = await GraphHelper.GetEventAsync(coordinatorEmail, activity.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar);
                        }
                        catch (Exception)
                        {
                            activity.EventLookup = string.Empty;
                            activity.EventLookupCalendar = string.Empty;
                            evt = new Event();
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
                        if (!string.IsNullOrEmpty(activity.EventLookup)) activity.ActivityRooms = newActivityRooms;
                    }
                }

                if (!string.IsNullOrEmpty(request.searchParams.Location))
                {
                    activities = activities.Where(activity =>
                        activity.ActivityRooms != null && activity.ActivityRooms.Any()
                        ? activity.ActivityRooms.Any(ar => ar.Name == request.searchParams.Location)
         : activity.PrimaryLocation == request.searchParams.Location
                    ).ToList();
                }

                List<OutsiderReportTableDTO> reportList = new List<OutsiderReportTableDTO>();
                reportList = activities
                    .GroupBy(a => a.Title)
                    .Select(g => g.OrderBy(a => a.Start).First())
                   .Select(activity => new OutsiderReportTableDTO
                   {
                       Title = activity.Title,
                       Start = activity.Start,
                       End = activity.End,
                       Location = activity.ActivityRooms?.Any() == true
        ? activity.ActivityRooms.Select(x => x.Name).Any()
             ? string.Join(", ", activity.ActivityRooms.Select(x => x.Name).ToArray())
             : activity.PrimaryLocation
        : activity.PrimaryLocation,
                       OrganizationName = activity.Organization?.Name,
                       OutsiderReportStatus = activity.HostingReport.OutsiderReportStatus,
                       OutsiderReportDirectorate = activity.HostingReport.OutsiderReportDirectorate,
                       OutsiderReportEngagement =activity.HostingReport.OutsiderReportEngagement,
                       OutsiderReportUSAWCGraduate = activity.HostingReport.OutsiderReportUSAWCGraduate,
                       OutsiderReportDV = activity.HostingReport.OutsiderReportDV,
                       OutsiderReportNumOfPeople = activity.HostingReport.OutsiderReportNumOfPeople,
                       CreatedBy = activity.CreatedBy,
                       AllDayEvent = activity.AllDayEvent,
                       Id = activity.Id,
                       CategoryId = activity.CategoryId,
                       ActionOfficer = activity.ActionOfficer,
                   })
                        .ToList();

                return Result<List<OutsiderReportTableDTO>>.Success(reportList);
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