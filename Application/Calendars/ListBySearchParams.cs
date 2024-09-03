
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;

namespace Application.Calendars
{
    public class ListBySearchParams
    {
        public class Query : IRequest<Result<List<CalendarTableDTO>>> {
          public CalendarTableSearchParams searchParams { get; set; }
          public string Id { get; set; }    
        }
        public class Handler : IRequestHandler<Query, Result<List<CalendarTableDTO>>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }
            public async Task<Result<List<CalendarTableDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                var query = _context.Activities
                   .Include(o => o.Organization)
                   .Where(x => !x.LogicalDeleteInd)
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

                if (request.Id == "imc")
                {
                    query = query.Where(e => e.IMC);
                }
                if (request.Id == "academic")
                {
                    query = query.Where(e => e.CopiedToacademic);
                }
                if (request.Id == "asep")
                {
                    query = query.Where(e => e.CopiedToasep);
                }
                if (request.Id == "commandGroup")
                {
                    query = query.Where(e => e.CopiedTocommandGroup);
                }
                if (request.Id == "community")
                {
                    query = query.Where(e => e.CopiedTocommunity);
                }
                if (request.Id == "csl")
                {
                    query = query.Where(e => e.CopiedTocsl);
                }
                if (request.Id == "garrison")
                {
                    query = query.Where(e => e.CopiedTogarrison);
                }
                if (request.Id == "internationalfellows")
                {
                    query = query.Where(e => e.CopiedTointernationalfellows);
                }
                if (request.Id == "generalInterest")
                {
                    query = query.Where(e => e.CopiedTogeneralInterest);
                }
                if (request.Id == "holiday")
                {
                    query = query.Where(e => e.CopiedToholiday);
                }
                if (request.Id == "pksoi")
                {
                    query = query.Where(e => e.CopiedTopksoi);
                }
                if (request.Id == "socialEventsAndCeremonies")
                {
                    query = query.Where(e => e.CopiedTosocialEventsAndCeremonies);
                }
                if (request.Id == "ssiAndUsawcPress")
                {
                    query = query.Where(e => e.CopiedTossiAndUsawcPress);
                }
                if (request.Id == "ssl")
                {
                    query = query.Where(e => e.CopiedTossl);
                }
                if (request.Id == "trainingAndMiscEvents")
                {
                    query = query.Where(e => e.CopiedTotrainingAndMiscEvents);
                }
                if (request.Id == "usahec")
                {
                    query = query.Where(e => e.CopiedTousahec);
                }
                if (request.Id == "usahecFacilitiesUsage")
                {
                    query = query.Where(e => e.CopiedTousahecFacilitiesUsage);
                }
                if (request.Id == "visitsAndTours")
                {
                    query = query.Where(e => e.CopiedTovisitsAndTours);
                }
                if (request.Id == "symposiumAndConferences")
                {
                    query = query.Where(e => e.CopiedTosymposiumAndConferences);
                }
                if (request.Id == "militaryFamilyAndSpouseProgram")
                {
                    query = query.Where(e => e.MFP);
                }
                if (request.Id == "spouse")
                {
                    query = query.Where(e => e.CopiedTospouse);
                }
                if (request.Id == "battlerhythm")
                {
                    query = query.Where(e => e.CopiedTobattlerhythm);
                }
                if (request.Id == "staff")
                {
                    query = query.Where(e => e.CopiedTostaff);
                }
                if (request.Id == "studentCalendar")
                {
                    query = query.Where(e => e.CopiedTostudentCalendar);
                }
                if (request.Id == "studentcalendar")
                {
                    query = query.Where(e => e.CopiedTostudentCalendar);
                }
                if (request.Id == "cio")
                {
                    query = query.Where(e => e.CopiedTocio);
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

                List<CalendarTableDTO> reportList = new List<CalendarTableDTO>();
                reportList = activities
   .Select(activity => new CalendarTableDTO
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
           AllDayEvent = activity.AllDayEvent,
           Id= activity.Id,
           CategoryId= activity.CategoryId,
           ActionOfficer=activity.ActionOfficer,
   })
   .ToList();

                return Result<List<CalendarTableDTO>>.Success(reportList);
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