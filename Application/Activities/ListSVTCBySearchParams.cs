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
    public class ListSVTCBySearchParams
    {
        public class Query : IRequest<Result<List<Activity>>> {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Location { get; set; }    
            public string ActionOfficer { get; set; }
            public string VTCClassification { get; set; }
            public string DistantTechPhoneNumber { get; set; }
            public string RequestorPOCContactInfo { get; set; }
            public string DialInNumber { get; set; }
            public string SiteIDDistantEnd { get; set; }
            public string GOSESInAttendance { get; set; }
            public string SeniorAttendeeNameRank { get; set; }
            public string AdditionalVTCInfo { get; set; }
            public string VTCStatus { get; set; }
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
                   .Where(x => x.VTC)
                   .AsQueryable();

                if (!string.IsNullOrEmpty(request.Title))
                {
                    query = query.Where(e => EF.Functions.Like(e.Title.ToLower(), "%" + request.Title.ToLower() + "%"));
                }

 

                if (!string.IsNullOrEmpty(request.ActionOfficer))
                {
                    query = query.Where(e => EF.Functions.Like(e.ActionOfficer.ToLower(), "%" + request.ActionOfficer.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.VTCClassification))
                {
                    query = query.Where(x => x.VTCClassification == request.VTCClassification);
                }


                if (!string.IsNullOrEmpty(request.DistantTechPhoneNumber))
                {
                    query = query.Where(e => EF.Functions.Like(e.DistantTechPhoneNumber.ToLower(), "%" + request.DistantTechPhoneNumber.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.RequestorPOCContactInfo))
                {
                    query = query.Where(e => EF.Functions.Like(e.RequestorPOCContactInfo.ToLower(), "%" + request.RequestorPOCContactInfo.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.DialInNumber))
                {
                    query = query.Where(e => EF.Functions.Like(e.DialInNumber.ToLower(), "%" + request.DialInNumber.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.SiteIDDistantEnd))
                {
                    query = query.Where(e => EF.Functions.Like(e.SiteIDDistantEnd.ToLower(), "%" + request.SiteIDDistantEnd.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.GOSESInAttendance))
                {
                    if (request.GOSESInAttendance == "Yes")
                    {
                        query = query.Where(x => x.GOSESInAttendance == true);
                    }
                    else
                    {
                        query = query.Where(x => x.GOSESInAttendance == false);
                    }
                }

                if (!string.IsNullOrEmpty(request.SeniorAttendeeNameRank))
                {
                    query = query.Where(e => EF.Functions.Like(e.SeniorAttendeeNameRank.ToLower(), "%" + request.SeniorAttendeeNameRank.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.AdditionalVTCInfo))
                {
                    query = query.Where(e => EF.Functions.Like(e.AdditionalVTCInfo.ToLower(), "%" + request.AdditionalVTCInfo.ToLower() + "%"));
                }

                if (!string.IsNullOrEmpty(request.VTCStatus))
                {
                    if (request.VTCStatus == "Tentative")
                    {
                        query = query.Where(x => x.VTCStatus != "Confirmed" && x.VTCStatus != "Cancelled");
                    }
                    else
                    {
                        query = query.Where(x => x.VTCStatus == request.VTCStatus);
                    }
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