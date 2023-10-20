
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;

namespace Application.Activities
{
    public class GetAllEventsByDate
    {
        public class Query : IRequest<Result<List<FullCalendarEventDTO>>>
        {
            public string Start { get; set; }
            public string End { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<FullCalendarEventDTO>>>
        {
            private readonly DataContext _context;


            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
            }

            public async Task<Result<List<FullCalendarEventDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                DateTime start = Helper.GetDateTimeFromRequest(request.Start);
                DateTime end = Helper.GetDateTimeFromRequest(request.End);
                var categories = await _context.Categories.ToListAsync();


                var activities = await _context.Activities.Include(x => x.Organization).Include(x => x.Category)
                       .Where(
                                         x =>
                                            (x.Start <= start && x.End <= end) ||
                                            (x.Start >= start && x.End <= end) ||
                                            (x.Start <= end && x.End >= end) ||
                                            (x.Start <= start && x.End >= end)
                                   ).
                    Where(x => !x.LogicalDeleteInd)
                    .Where(x => x.Category.RouteName != "other")
                    .ToListAsync();

                List<FullCalendarEventDTO> fullCalendarEventDTOs = new List<FullCalendarEventDTO>();

                foreach (var activity in activities)
                {
                    if (activity.CopiedToasep)  fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "asep"), activity));
                    if (activity.CopiedTocommandGroup) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "commandGroup"), activity));
                    if (activity.CopiedTocommunity) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "community"), activity));
                    if (activity.CopiedTocsl) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "csl"), activity));
                    if (activity.CopiedTogarrison) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "garrison"), activity));
                    if (activity.CopiedTogeneralInterest) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "generalInterest"), activity));
                    if (activity.CopiedToholiday) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "holiday"), activity));
                    if (activity.CopiedTopksoi) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "pksoi"), activity));
                    if (activity.CopiedTosocialEventsAndCeremonies) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "socialEventsAndCeremonies"), activity));
                    if (activity.CopiedTossiAndUsawcPress) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "ssiAndUsawcPress"), activity));
                    if (activity.CopiedTossl) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "ssl"), activity));
                    if (activity.CopiedTotrainingAndMiscEvents) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "trainingAndMiscEvents"), activity));
                    if (activity.CopiedTousahec) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "usahec"), activity));
                    if (activity.CopiedTousahecFacilitiesUsage) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "usahecFacilitiesUsage"), activity));
                    if (activity.CopiedTovisitsAndTours) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "visitsAndTours"), activity));
                    if (activity.CopiedTosymposiumAndConferences) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "symposiumAndConferences"), activity));
                    if (activity.CopiedTobattlerhythm) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "battlerhythm"), activity));
                    if (activity.CopiedTostaff) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "staff"), activity));
                    if (activity.CopiedTostudentCalendar) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "studentCalendar"), activity));
                    if (activity.CopiedToacademic) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "academic"), activity));
                    if (activity.MFP) fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(categories.First(x => x.RouteName == "militaryFamilyAndSpouseProgram"), activity));
                }


                return Result<List<FullCalendarEventDTO>>.Success(fullCalendarEventDTOs);
            }

            private FullCalendarEventDTO CreateFullCalendarEventDTO(Category category, Activity activity)
            {
                DateTime endDateForCalendar = activity.AllDayEvent ? activity.End.AddDays(1) : activity.End;
                return new FullCalendarEventDTO
                {
                    Id = activity.Id.ToString(),
                    Title = activity.Title,
                    Start = Helper.GetStringFromDateTime(activity.Start, activity.AllDayEvent),
                    End = Helper.GetStringFromDateTime(endDateForCalendar, activity.AllDayEvent),
                    Color = category.IMCColor,
                    AllDay = activity.AllDayEvent,
                    CategoryId = category.Id.ToString(),
                    ActivityCategoryId = activity.CategoryId.ToString(),    
                    CategoryName = category.Name,
                    Description = activity.Description,
                    PrimaryLocation = activity.PrimaryLocation,
                    LeadOrg = activity.Organization?.Name,
                    ActionOfficer = activity.ActionOfficer,
                    ActionOfficerPhone = activity.ActionOfficerPhone,
                    EventLookup = activity.EventLookup,
                    CoordinatorEmail = activity.CoordinatorEmail,
                    Recurring = activity.RecurrenceInd,
                    BorderColor = activity.IMC ? "#EE4B2B" : string.Empty,
                    TeamInd = !string.IsNullOrEmpty(activity.TeamLink)
                };
            }
        }
    }
}
