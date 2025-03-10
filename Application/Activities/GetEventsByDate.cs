﻿
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;
using Domain;

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

                string routeName = request.RouteName.ToLower();
                var category = await _context.Categories.Where(x => x.RouteName.ToLower() == routeName).FirstOrDefaultAsync();


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
                                      (category.RouteName == "internationalfellows" && x.CopiedTointernationalfellows) ||
                                      (category.RouteName == "exec" && x.CopiedToexec) ||
                                      (category.RouteName == "generalInterest" && x.CopiedTogeneralInterest) ||
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
                                      (category.RouteName == "residentAndDistanceStudentCalendar" && x.CopiedTostudentCalendar) ||
                                      (category.RouteName == "academic" && x.CopiedToacademic) ||
                                      (category.RouteName == "cio" && x.CopiedTocio) ||
                                      (category.RouteName == "spouse" && x.CopiedTospouse) ||
                                      (category.RouteName == "militaryFamilyAndSpouseProgram" && x.MFP))).
                          Where(x => !x.LogicalDeleteInd && !x.InternationalFellowsStaffEventPrivate)

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
                        StudentCalendarMandatory = activity.StudentCalendarMandatory,
                        HyperLink = activity.Hyperlink,
                        HyperLinkDescription = activity.HyperlinkDescription,
                        EducationalCategory = activity.EducationalCategory,
                        SpouseCategory = activity.SpouseCategory,
                        ExecCategory = activity.ExecCategory,
                        EventPlanningPAX = activity.EventPlanningPAX,
                        EventPlanningStatus = activity.EventPlanningStatus,
                        EventClearanceLevel = activity.EventClearanceLevel,
                        TeamInd = !string.IsNullOrEmpty(activity.TeamLink) || !string.IsNullOrEmpty(activity.ArmyTeamLink) || !string.IsNullOrEmpty(activity.HyperlinkEDUTeams),
                        TeamLink = activity.TeamLink.CoalesceWhitespace(activity.HyperlinkEDUTeams),
                        CopiedTosymposiumAndConferences = activity.CopiedTosymposiumAndConferences,
                        SymposiumLinkInd = activity.SymposiumLinkInd,
                        SymposiumLink = activity.SymposiumLink,
                        FromExternalCalendarInd = activity.CategoryId != category.Id
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

                if (category.RouteName == "studentCalendar")
                 
                  
                        {
                            if (activity.StudentCalendarMandatory)
                            {
                                color = "green";
                            }
                            else
                            {
                                color = "goldenrod";
                            }
                        }
                    
                if(category.RouteName == "spouse" && !string.IsNullOrEmpty(activity.SpouseCategory)){
                   switch (activity.SpouseCategory){
                    case "ACS":
                      return "#8A3324";
                     case "Chapel":
                     return "#C2B280";
                    case "Dunham":
                     return "#FF8C00";
                    case "Fitness":
                     return "#301934";
                    case "MSFP":
                     return "#E75480";
                    case "MWR":
                     return "#8B0000";
                    case "USAWC":
                     return "#006400";
                    case "AHEC":
                        return "#008080";
                    case "Carlisle Community":
                        return "#A179C4";
                    case "USAG":
                        return "#B8860B";
                    case "Holiday":
                        return "#9495FC";
                     default:
                      return "#00008B";
                   }
                }

                if(category.RouteName == "exec" && !string.IsNullOrEmpty (activity.ExecCategory)){
                    switch (activity.ExecCategory){
                        case "Class Lectures NTL/EL":
                            return "#ffa14e";
                         case "CSL":
                            return "#800080";
                        case "DV Visits":
                            return "#0579cc";
                        case "Events":
                            return "#819e43";
                        case "Graduation & Service B-Day Celebrations":
                            return "#d1c9a2";
                        case "Off-Sites & Outreach":
                            return "#058a8a";
                        case "SLDS":
                            return "#ffcc05";
                        case "Socials":
                            return "#e6a19f";
                        default:
                            return "#00008B";
                    }
                }

                if(category.RouteName == "militaryFamilyAndSpouseProgram" && !string.IsNullOrEmpty(activity.EducationalCategory)) 
                {
                   switch (activity.EducationalCategory)
                    {
                        case "Leadership & Readiness":
                            return "#00008B";
                        case "Personal Finance Management":
                            return "#FF8C00";
                        case "Personal Growth and Fitness":
                            return "#8B0000";
                        case "Family Growth & Resiliency":
                            return "#006400";
                        case "TS-SCI":
                            return "#00008B";
                        default:
                            return "#483D8B";
                    }
                }

                if(category.RouteName == "cio"){
                    switch(activity.EventPlanningStatus){
                        case "Ready":
                        return "#006633";
                        case "Closed":
                        return "#FF3333";
                        default:
                        return "#F2BA49";
                        
                    }
                }
              
                return color;
            }
        }
    }
}
