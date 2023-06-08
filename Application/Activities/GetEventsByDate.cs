
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;
using Domain;
using Microsoft.Graph;

namespace Application.Activities
{
    public class GetEventsByDate
    {
        public class Query : IRequest<Result<List<FullCalendarEventDTO>>>
        {
            public string RouteName { get; set; }
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

                var category = await _context.Categories.Where(x => x.RouteName.ToLower() == request.RouteName.ToLower()).FirstOrDefaultAsync();


                var activities = await _context.Activities.Include(x => x.Organization)
                        .Where(
                                         x =>
                                            ( x.Start  <= start && x.End <= end)  ||
                                            (x.Start >= start && x.End <= end) ||
                                            (x.Start <= end && x.End >= end) ||
                                            (x.Start <= start && x.End >= end)
                                   )
                                  
                         .Where(x => x.CategoryId == category.Id ||
                                      ((category.RouteName == "asep" && x.CopiedToasep) ||
                                      (category.RouteName == "commandGroup" && x.CopiedTocommandGroup) ||
                                      (category.RouteName == "community" && x.CopiedTocommunity) ||
                                      (category.RouteName == "csl" && x.CopiedTocsl) ||
                                      (category.RouteName == "garrison" && x.CopiedTogarrison) ||
                                      (category.RouteName == "GeneralInterest" && x.CopiedTogeneralInterest) ||
                                      (category.RouteName == "holiday" && x.CopiedToholiday) ||
                                      (category.RouteName == "pksoi" && x.CopiedTopksoi) ||
                                      (category.RouteName == "socialEventsAndCeremonies" && x.CopiedTosocialEventsAndCeremonies) ||
                                      (category.RouteName == "ssiAndUsawcPress" && x.CopiedTossiAndUsawcPress) ||
                                      (category.RouteName == "ssl" && x.CopiedTossl) ||
                                      (category.RouteName == "trainingAndMiscEvents" && x.CopiedTotrainingAndMiscEvents) ||
                                      (category.RouteName == "usahec" && x.CopiedTousahec) ||
                                      (category.RouteName == "usahecFacilitiesUsage" && x.CopiedTousahecFacilitiesUsage) ||
                                      (category.RouteName == "visitsAndTours" && x.CopiedTovisitsAndTours) ||
                                      (category.RouteName == "symposiumAndConferences" && x.CopiedTosymposiumAndConferences) ||
                                      (category.RouteName == "battlerhythm" && x.CopiedTobattlerhythm) ||
                                      (category.RouteName == "staff" && x.CopiedTostaff) ||
                                      (category.RouteName == "studentCalendar" && x.CopiedTostudentCalendar) ||
                                      (category.RouteName == "militaryFamilyAndSpouseProgram" && x.MFP))).
                          Where(x => !x.LogicalDeleteInd)
                          .ToListAsync();

                var cslLegend = await _context.CSLCalendarLegends.ToListAsync();
                var usahecFacilitiesUsageLegend = await _context.USAHECFacilitiesUsageLegends.ToListAsync();
                

                List<FullCalendarEventDTO> fullCalendarEventDTOs = new List<FullCalendarEventDTO>();

                foreach (var activity in activities)
                {
                    DateTime endDateForCalendar = activity.AllDayEvent ? activity.End.AddDays(1) : activity.End;
                    FullCalendarEventDTO fullCalendarEventDTO = new FullCalendarEventDTO
                    {
                        Id = activity.Id.ToString(),
                        Title = activity.Title,
                        Start = Helper.GetStringFromDateTime(activity.Start, activity.AllDayEvent),
                        End = Helper.GetStringFromDateTime(endDateForCalendar, activity.AllDayEvent),
                        Color = GetColor(category, activity, cslLegend, usahecFacilitiesUsageLegend),
                        BorderColor = activity.IMC ? "#EE4B2B" : string.Empty,
                        AllDay = activity.AllDayEvent,
                        CategoryId = category.Id.ToString(),
                        Description = activity.Description,
                        PrimaryLocation = activity.PrimaryLocation,
                        LeadOrg = activity.Organization?.Name,
                        ActionOfficer = activity.ActionOfficer,
                        ActionOfficerPhone = activity.ActionOfficerPhone,
                        EventLookup = activity.EventLookup,
                        CoordinatorEmail = activity.CoordinatorEmail,
                        Recurring = activity.RecurrenceInd,
                        StudentCalendarPresenter = activity.StudentCalendarPresenter,
                        StudentCalendarUniform = activity.StudentCalendarUniform,
                        StudentCalendarNotes = activity.StudentCalendarNotes,
                        StudentCalendarMandatory = activity.StudentCalendarMandatory
                    };

                    fullCalendarEventDTOs.Add(fullCalendarEventDTO);
                }


                return Result<List<FullCalendarEventDTO>>.Success(fullCalendarEventDTOs);
            }


            private string GetColor(Category category, Activity activity, List<CSLCalendarLegend> cslLegendList, List<USAHECFacilitiesUsageLegend> usahecFacilitiesUsageLegend)
            {
                var color = "blue";
                if (category.RouteName == "csl" && !string.IsNullOrEmpty(activity.Type))
                {
                    var legend = cslLegendList.FirstOrDefault(x => x.Name == activity.Type);
                    if (legend != null) color = legend.Color;
                }

                if (category.RouteName == "usahecFacilitiesUsage" && !string.IsNullOrEmpty(activity.USAHECFacilityReservationType)){
                     var legend = usahecFacilitiesUsageLegend.FirstOrDefault(x => x.Name == activity.USAHECFacilityReservationType);
                    if (legend != null) color = legend.Color;
                }

                if(category.RouteName =="csl" && (activity.ApprovedByOPS == "Pending" || string.IsNullOrEmpty(activity.ApprovedByOPS)))  color = "#F6BE00";

                if(category.RouteName == "studentCalendar")
                {
                    if (activity.StudentCalendarMandatory)
                    {
                        color = "green";
                    } else
                    {
                        color = "goldenrod";
                    }
                }
              
                return color;
            }
        }
    }
}
