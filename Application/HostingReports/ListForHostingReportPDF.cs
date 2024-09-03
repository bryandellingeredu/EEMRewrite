using Application.Core;
using MediatR;
using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;

namespace Application.HostingReports
{
    public class ListForHostingReportPDF
    {
        public class Query : IRequest<Result<List<Activity>>> { }

        public class Handler : IRequestHandler<Query, Result<List<Activity>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<List<Activity>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                var allrooms = await GraphHelper.GetRoomsAsync();
                var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();
                var start = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 0, 0, 0);

              var activities = await _context.Activities
                      .Where(a => a.Report == "Hosting Report")
                    .Include(h => h.HostingReport)
                    .Include(o => o.Organization)
                    .Where(x => x.Start >= start)
                    .Where(x => !x.LogicalDeleteInd)
                    .Where(x => x.HostingReport != null)
                    .ToListAsync(cancellationToken); 

       /*         var activities = await _context.Activities
             .Include(h => h.HostingReport)
             .Where(x => !x.LogicalDeleteInd)
             .Where(x => x.HostingReport != null)
             .ToListAsync(cancellationToken); */



                foreach (var activity in activities)
                {
                    if (activity.Organization != null)
                    {
                        activity.Organization.Activities = null;
                    }
                    if (!string.IsNullOrEmpty(activity.EventLookup) && !string.IsNullOrEmpty(activity.CoordinatorEmail))
                    {
                        string coordinatorEmail = activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                         ? activity.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(coordinatorEmail, activity.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail   );
                        }
                        catch (Exception)
                        {

                            evt = new Event();
                            activity.EventLookup = string.Empty;
                            activity.EventLookupCalendar = string.Empty;
                        }

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
                        activity.ActivityRooms = newActivityRooms;
                    }
                }

                return Result<List<Activity>>.Success(activities);
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

