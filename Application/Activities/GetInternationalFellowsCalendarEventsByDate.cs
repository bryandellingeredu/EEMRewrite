using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;
using Domain;
using Azure.Core;
using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Application.Activities
{
    public class GetInternationalFellowsCalendarEventsByDate
    {
        public class Query : IRequest<Result<List<FullCalendarEventDTO>>>
        {
            public string Start { get; set; }
            public string End { get; set; }
            public string IFCalendarAdmin { get; set; }
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

                bool isCalendarAdmin = false;
                if (request.IFCalendarAdmin == "true") isCalendarAdmin = true;


                DateTime start = Helper.GetDateTimeFromRequest(request.Start);
                DateTime end = Helper.GetDateTimeFromRequest(request.End);

                List<InternationalFellowCalendarInfo> internationalFellowInfoList = new List<InternationalFellowCalendarInfo>
            {
                new InternationalFellowCalendarInfo{InternationalFellowType = "Resident", Color = "#006400", InternationalFellowCalendarResident = true, InternationalFellowCalendarDistanceGroup1 = false, InternationalFellowCalendarDistanceGroup2 = false, InternationalFellowCalendarDistanceGroup3 = false, InternationalFellowCalendarDistanceGroup4 = false, InternationalFellowsStaffEvent = false},
                new InternationalFellowCalendarInfo{InternationalFellowType = "DEP2024", Color = "#FF8C00", InternationalFellowCalendarResident = false, InternationalFellowCalendarDistanceGroup1 = true, InternationalFellowCalendarDistanceGroup2 = false, InternationalFellowCalendarDistanceGroup3 = false, InternationalFellowCalendarDistanceGroup4 = false , InternationalFellowsStaffEvent = false },
                new InternationalFellowCalendarInfo{InternationalFellowType = "DEP2025", Color = "#EE4B2B", InternationalFellowCalendarResident = false, InternationalFellowCalendarDistanceGroup1 = false, InternationalFellowCalendarDistanceGroup2 = true, InternationalFellowCalendarDistanceGroup3 = false,InternationalFellowCalendarDistanceGroup4 = false , InternationalFellowsStaffEvent = false},
                new InternationalFellowCalendarInfo{InternationalFellowType = "DEP2026", Color = "#800080", InternationalFellowCalendarResident = false, InternationalFellowCalendarDistanceGroup1 = false, InternationalFellowCalendarDistanceGroup2 = false, InternationalFellowCalendarDistanceGroup3 = true,InternationalFellowCalendarDistanceGroup4 = false , InternationalFellowsStaffEvent = false},
                new InternationalFellowCalendarInfo{InternationalFellowType = "DEP2027", Color = "#B22222", InternationalFellowCalendarResident = false, InternationalFellowCalendarDistanceGroup1 = false, InternationalFellowCalendarDistanceGroup2 = false, InternationalFellowCalendarDistanceGroup3 = false,InternationalFellowCalendarDistanceGroup4 = true , InternationalFellowsStaffEvent = false},
                new InternationalFellowCalendarInfo{InternationalFellowType = "Staff", Color = "#708090", InternationalFellowCalendarResident = false, InternationalFellowCalendarDistanceGroup1 = false, InternationalFellowCalendarDistanceGroup2 = false, InternationalFellowCalendarDistanceGroup3 = false,InternationalFellowCalendarDistanceGroup4 = false , InternationalFellowsStaffEvent = true},
        };

                IQueryable<Activity> query = _context.Activities.Include(x => x.Organization)
                .Where(x =>
                        (x.Start <= start && x.End <= end) ||
                        (x.Start >= start && x.End <= end) ||
                        (x.Start <= end && x.End >= end) ||
                        (x.Start <= start && x.End >= end)
                       )
                .Where(x => x.CopiedTointernationalfellows)
                .Where(x => !x.LogicalDeleteInd);

                if (!isCalendarAdmin)
                {
                    query = query.Where(x => !x.InternationalFellowsStaffEventPrivate);
                }

                var activities = await query.ToListAsync();


                List<FullCalendarEventDTO> fullCalendarEventDTOs = new List<FullCalendarEventDTO>();

                var category = await _context.Categories.Where(x => x.RouteName == "internationalfellows").FirstOrDefaultAsync();

                foreach (var activity in activities)
                {
                     bool putInCategory = false;
                    foreach (var internationalFellowCalendarInfo in internationalFellowInfoList)
                    {
                        
                        if (internationalFellowCalendarInfo.InternationalFellowCalendarResident && activity.StudentCalendarResident){
                            putInCategory = true;
                            fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, internationalFellowCalendarInfo, category));
                        } 
                        if (internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup1 && activity.StudentCalendarDistanceGroup1){
                            fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, internationalFellowCalendarInfo, category));
                            putInCategory = true;  
                        }
                        if (internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup2 && activity.StudentCalendarDistanceGroup2){
                        fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, internationalFellowCalendarInfo, category));
                        putInCategory = true; 
                        }
                        if (internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup3 && activity.StudentCalendarDistanceGroup3){
                            fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, internationalFellowCalendarInfo,category));
                            putInCategory = true; 
                        }
                        if (internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup4 && activity.StudentCalendarDistanceGroup4){
                            fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, internationalFellowCalendarInfo,category));
                             putInCategory = true;
                        } 
                        if (internationalFellowCalendarInfo.InternationalFellowsStaffEvent && activity.InternationalFellowsStaffEvent){
                             fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, internationalFellowCalendarInfo,category));
                              putInCategory = true;
                        }
                       
                    }
                     if(!putInCategory){
                          if(activity.StudentCalendarMandatory || 
                            !string.IsNullOrEmpty(activity.StudentCalendarNotes) ||
                            !string.IsNullOrEmpty(activity.StudentCalendarPresenter) ||
                            !string.IsNullOrEmpty(activity.StudentCalendarUniform) ||
                            activity.CopiedTostudentCalendar
                             ){
                                activity.InternationalFellowsStudentEvent=true;
                                fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, 
                                new   InternationalFellowCalendarInfo
                                {InternationalFellowType = "Resident", Color = "#006400", InternationalFellowCalendarResident = true,
                                 InternationalFellowCalendarDistanceGroup1 = false, InternationalFellowCalendarDistanceGroup2 = false,
                                InternationalFellowCalendarDistanceGroup3 = false, InternationalFellowCalendarDistanceGroup4 = false,
                                InternationalFellowsStaffEvent = false},category));
                             }else{
                                activity.InternationalFellowsStaffEvent=true;
                                  fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, 
                                 new InternationalFellowCalendarInfo{
                                    InternationalFellowType = "Staff", Color = "#708090", InternationalFellowCalendarResident = false,
                                    InternationalFellowCalendarDistanceGroup1 = false, InternationalFellowCalendarDistanceGroup2 = false,
                                    InternationalFellowCalendarDistanceGroup3 = false,InternationalFellowCalendarDistanceGroup4 = false ,
                                    InternationalFellowsStaffEvent = true},category));
                             }
                        }
                }
                return Result<List<FullCalendarEventDTO>>.Success(fullCalendarEventDTOs);
            }

            private FullCalendarEventDTO GetFullCalendarEventDTO(Activity activity, InternationalFellowCalendarInfo internationalFellowCalendarInfo, Category category)
            {
                return new FullCalendarEventDTO
                {
                    Id = activity.Id.ToString(),
                    Title = activity.Title,
                    Start = Helper.GetStringFromDateTime(activity.Start, activity.AllDayEvent),
                    End = Helper.GetStringFromDateTime(activity.AllDayEvent ? activity.End.AddDays(1) : activity.End, activity.AllDayEvent),
                    Color = (internationalFellowCalendarInfo.InternationalFellowType == "Staff" && !string.IsNullOrEmpty(activity.InternationalFellowsStaffEventCategory)) 
                    ? GetStaffColor(activity.InternationalFellowsStaffEventCategory)
                    : internationalFellowCalendarInfo.Color,
                    BorderColor = (
                        (activity.StudentCalendarMandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarResident) ||
                        (activity.StudentCalendarDistanceGroup1Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup1) ||
                        (activity.StudentCalendarDistanceGroup2Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup2) ||
                        (activity.StudentCalendarDistanceGroup3Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup3) ||
                        (activity.StudentCalendarDistanceGroup4Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup4)
                        )? "#EE4B2B" : string.Empty,
                    AllDay = activity.AllDayEvent,
                    CategoryId = activity.CategoryId.ToString(),
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
                    StudentCalendarMandatory = (
                                                (activity.StudentCalendarMandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarResident) ||
                                                (activity.StudentCalendarDistanceGroup1Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup1) ||
                                                (activity.StudentCalendarDistanceGroup2Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup2) ||
                                                (activity.StudentCalendarDistanceGroup3Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup3) ||
                                                (activity.StudentCalendarDistanceGroup4Mandatory  && internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup4)
                                              ),
                    HyperLink = activity.Hyperlink,
                    HyperLinkDescription = activity.HyperlinkDescription,
                    EducationalCategory = activity.EducationalCategory,
                    EventPlanningPAX = activity.EventPlanningPAX,
                    EventPlanningStatus = activity.EventPlanningStatus,
                    EventClearanceLevel = activity.EventClearanceLevel,
                    TeamInd = !string.IsNullOrEmpty(activity.TeamLink) || !string.IsNullOrEmpty(activity.ArmyTeamLink) || !string.IsNullOrEmpty(activity.HyperlinkEDUTeams),
                    TeamLink = activity.TeamLink.CoalesceWhitespace(activity.HyperlinkEDUTeams),
                    CopiedTosymposiumAndConferences = activity.CopiedTosymposiumAndConferences,
                    SymposiumLinkInd = activity.SymposiumLinkInd,
                    SymposiumLink = activity.SymposiumLink,
                    StudentCalendarResident = internationalFellowCalendarInfo.InternationalFellowCalendarResident,
                    StudentCalendarDistanceGroup1 = internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup1,
                    StudentCalendarDistanceGroup2 = internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup2,
                    StudentCalendarDistanceGroup3 = internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup3,
                    StudentCalendarDistanceGroup4 = internationalFellowCalendarInfo.InternationalFellowCalendarDistanceGroup4,
                    StudentType = internationalFellowCalendarInfo.InternationalFellowType,
                    InternationalFellowsStaffEvent = activity.InternationalFellowsStaffEvent && internationalFellowCalendarInfo.InternationalFellowsStaffEvent,
                    FromExternalCalendarInd = activity.CategoryId != category.Id,
                    InternationalFellowsStaffEventCategory = activity.InternationalFellowsStaffEventCategory
                };
            }

           private string GetStaffColor(string internationalFellowsStaffEventCategory)
{
    switch (internationalFellowsStaffEventCategory)
    {
        case "Leave/TDY":
            return "#000000";
        case "FSP":
            return "#D87093";
        case "MTGS":
            return "#B8860B";
        case "Office Birthday":
            return "#654321";
        case "IF Birthday":
            return "#008080";
        case "IF Holiday":
            return "#808000";
        default:
            // Return a default color if the category is not found
            return "#708090";
    }
}
        }
    }

    public class InternationalFellowCalendarInfo
    {
        public string Color { get; set; }
        public string InternationalFellowType { get; set; }
        public bool InternationalFellowCalendarResident { get; set; }
        public bool InternationalFellowCalendarDistanceGroup1 { get; set; }
        public bool InternationalFellowCalendarDistanceGroup2 { get; set; }
        public bool InternationalFellowCalendarDistanceGroup3 { get; set; }
        public bool InternationalFellowCalendarDistanceGroup4 { get; set; }
        public bool InternationalFellowsStaffEvent { get; set; }
    }
}
