using  System.Linq;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Application.Activities
{
    public class ListCIOEventPlanningBySearchParams
    {
        public class Query : IRequest<Result<List<Activity>>> {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Location { get; set; }    
            public string ActionOfficer { get; set; }
            public string EventPlanningExternalEventPOCName { get; set; }
            public string EventPlanningExternalEventPOCEmail { get; set; }
            public string EventPlanningStatus { get; set; }
            public string EventPlanningPAX { get; set; }
            public string EventPlanningSetUpDate { get; set; }
            public string EventClearanceLevel { get; set; }

        }
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

                var query = _context.Activities
                   .Include(c => c.Category)
                   .Include(o => o.Organization)
                   .Where(x => !x.LogicalDeleteInd)
                   .Where(x => x.CopiedTocio)
                   .AsQueryable();

                if (!string.IsNullOrEmpty(request.Title))
                {
                    query = query.Where(e => EF.Functions.Like(e.Title.ToLower(), "%" + request.Title.ToLower() + "%"));
                }

 

                if (!string.IsNullOrEmpty(request.ActionOfficer))
                {
                    query = query.Where(e => EF.Functions.Like(e.ActionOfficer.ToLower(), "%" + request.ActionOfficer.ToLower() + "%"));
                }



                if (!string.IsNullOrEmpty(request.EventPlanningExternalEventPOCName))
                {
                    query = query.Where(e => EF.Functions.Like(e.EventPlanningExternalEventPOCName.ToLower(), "%" + request.EventPlanningExternalEventPOCName.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.EventPlanningExternalEventPOCEmail))
                {
                    query = query.Where(e => EF.Functions.Like(e.EventPlanningExternalEventPOCEmail.ToLower(), "%" + request.EventPlanningExternalEventPOCEmail.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.EventPlanningStatus))
                {
                    if (request.EventPlanningStatus == "Pending")
                    {
                        query = query.Where(e => e.EventPlanningStatus == request.EventPlanningStatus || string.IsNullOrEmpty(e.EventPlanningStatus));
                    }
                    else
                    {
                        query = query.Where(e => e.EventPlanningStatus == request.EventPlanningStatus);
                    }
                  
                }

                if (!string.IsNullOrEmpty(request.EventClearanceLevel))
                {
                    if (request.EventPlanningStatus == "Undetermined")
                    {
                        query = query.Where(e => e.EventClearanceLevel == request.EventClearanceLevel || string.IsNullOrEmpty(e.EventClearanceLevel));
                    }
                    else
                    {
                        query = query.Where(e => e.EventClearanceLevel == request.EventClearanceLevel);
                    }

                }

                if (!string.IsNullOrEmpty(request.EventPlanningPAX))
                {
                    query = query.Where(e => e.EventPlanningPAX.ToLower() == request.EventPlanningPAX.ToLower());
                }



                if (!string.IsNullOrEmpty(request.Start))
                {
                    int month = int.Parse(request.Start.Split("-")[0]);
                    int day = int.Parse(request.Start.Split("-")[1]);
                    int year = int.Parse(request.Start.Split("-")[2]);
                    DateTime start = new DateTime(year, month, day,0,0,0);
                    query = query.Where(e => e.Start >= start);
                }

                if (!string.IsNullOrEmpty(request.End))
                {
                    int month = int.Parse(request.End.Split("-")[0]);
                    int day = int.Parse(request.End.Split("-")[1]);
                    int year = int.Parse(request.End.Split("-")[2]);
                    DateTime end = new DateTime(year, month, day, 23, 59, 59);
                    query = query.Where(e => e.End <= end);
                }

                if (!string.IsNullOrEmpty(request.EventPlanningSetUpDate))
                {
                    string Dt = request.EventPlanningSetUpDate.Split("T")[0];
                    int month = int.Parse(Dt.Split("-")[1]);
                    int day = int.Parse(Dt.Split("-")[2]);
                    int year = int.Parse(Dt.Split("-")[0]);
                    DateTime eventPlanningSetUpDate = new DateTime(year, month, day, 0, 0, 0);
                    query = query.Where(e => e.EventPlanningSetUpDate != null && e.EventPlanningSetUpDate.Value >= eventPlanningSetUpDate);
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

                    if (!string.IsNullOrEmpty(activity.EventLookup))
                    {
                        string coordinatorEmail = activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                            ? activity.CoordinatorEmail : GraphHelper.GetEEMServiceAccount();
                        Event evt;
                        try
                        {
                            evt = await GraphHelper.GetEventAsync(activity.CoordinatorEmail, activity.EventLookup, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail  );
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
                        if (newActivityRooms.Any())
                        {
                            activity.PrimaryLocation = String.Join(", ", newActivityRooms.Select(x => x.Name));
                        }
                    }
                }

               if(!string.IsNullOrEmpty(request.Location) && !string.IsNullOrWhiteSpace(request.Location))
                {
                    return Result<List<Activity>>.Success(
                     activities.AsEnumerable()
                     .Where(e => e.PrimaryLocation.ToLower().Contains(request.Location.ToLower()))
                     .ToList());
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