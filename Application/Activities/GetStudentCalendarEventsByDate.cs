using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;
using Domain;
using Azure.Core;

namespace Application.Activities
{
    public class GetStudentCalendarEventsByDate
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

                List<StudentCalendarInfo> studentCalendarInfoList = new List<StudentCalendarInfo>
            {
                new StudentCalendarInfo{StudentType = "Resident", Color = "#006400", StudentCalendarResident = true, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false, StudentCalendarDistanceGroup4 = false},
                new StudentCalendarInfo{StudentType = "DEP2024", Color = "#FF8C00", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = true, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false, StudentCalendarDistanceGroup4 = false},
                new StudentCalendarInfo{StudentType = "DEP2025", Color = "#EE4B2B", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = true, StudentCalendarDistanceGroup3 = false,StudentCalendarDistanceGroup4 = false},
                new StudentCalendarInfo{StudentType = "DEP2026", Color = "#800080", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = true,StudentCalendarDistanceGroup4 = false},
                new StudentCalendarInfo{StudentType = "DEP2027", Color = "#B22222", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false,StudentCalendarDistanceGroup4 = true},
        };

                var activities = await _context.Activities.Include(x => x.Organization)
                           .Where(
                                            x =>
                                               (x.Start <= start && x.End <= end) ||
                                               (x.Start >= start && x.End <= end) ||
                                               (x.Start <= end && x.End >= end) ||
                                               (x.Start <= start && x.End >= end)
                                      )
                           .Where(x => x.CopiedTostudentCalendar)
                           .Where(x => !x.LogicalDeleteInd)
                           .ToListAsync();

                List<FullCalendarEventDTO> fullCalendarEventDTOs = new List<FullCalendarEventDTO>();

                foreach (var activity in activities)
                {
                    foreach (var studentCalendarInfo in studentCalendarInfoList)
                    {
                        if (studentCalendarInfo.StudentCalendarResident &&
                            (activity.StudentCalendarResident ||
                                (!activity.StudentCalendarDistanceGroup1 && !activity.StudentCalendarDistanceGroup2 && !activity.StudentCalendarDistanceGroup3 && !activity.StudentCalendarDistanceGroup4 )
                            )
                          )
                        {
                            fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, studentCalendarInfo));
                        }
                        if (studentCalendarInfo.StudentCalendarDistanceGroup1 && activity.StudentCalendarDistanceGroup1) fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, studentCalendarInfo));
                        if (studentCalendarInfo.StudentCalendarDistanceGroup2 && activity.StudentCalendarDistanceGroup2) fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, studentCalendarInfo));
                        if (studentCalendarInfo.StudentCalendarDistanceGroup3 && activity.StudentCalendarDistanceGroup3) fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, studentCalendarInfo));
                        if (studentCalendarInfo.StudentCalendarDistanceGroup4 && activity.StudentCalendarDistanceGroup4) fullCalendarEventDTOs.Add(GetFullCalendarEventDTO(activity, studentCalendarInfo));
                    }
                }
                return Result<List<FullCalendarEventDTO>>.Success(fullCalendarEventDTOs);
            }

            private FullCalendarEventDTO GetFullCalendarEventDTO(Activity activity, StudentCalendarInfo studentCalendarInfo)
            {
                return new FullCalendarEventDTO
                {
                    Id = activity.Id.ToString(),
                    Title = activity.Title,
                    Start = Helper.GetStringFromDateTime(activity.Start, activity.AllDayEvent),
                    End = Helper.GetStringFromDateTime(activity.AllDayEvent ? activity.End.AddDays(1) : activity.End, activity.AllDayEvent),
                    Color = studentCalendarInfo.Color,
                    BorderColor = (
                        (activity.StudentCalendarMandatory && studentCalendarInfo.StudentCalendarResident) ||
                        (activity.StudentCalendarDistanceGroup1Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup1) ||
                        (activity.StudentCalendarDistanceGroup2Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup2) ||
                        (activity.StudentCalendarDistanceGroup3Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup3) ||
                        (activity.StudentCalendarDistanceGroup4Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup4)
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
                                                (activity.StudentCalendarMandatory && studentCalendarInfo.StudentCalendarResident) ||
                                                (activity.StudentCalendarDistanceGroup1Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup1) ||
                                                (activity.StudentCalendarDistanceGroup2Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup2) ||
                                                (activity.StudentCalendarDistanceGroup3Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup3) ||
                                                (activity.StudentCalendarDistanceGroup4Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup4)
                                              ),
                    HyperLink = activity.Hyperlink,
                    HyperLinkDescription = activity.HyperlinkDescription,
                    EducationalCategory = activity.EducationalCategory,
                    EventPlanningPAX = activity.EventPlanningPAX,
                    EventPlanningStatus = activity.EventPlanningStatus,
                    EventClearanceLevel = activity.EventClearanceLevel,
                    TeamInd = !string.IsNullOrEmpty(activity.TeamLink) || !string.IsNullOrEmpty(activity.ArmyTeamLink) || !string.IsNullOrEmpty(activity.HyperlinkEDUTeams),
                    TeamLink = activity.TeamLink ?? activity.HyperlinkEDUTeams,
                    CopiedTosymposiumAndConferences = activity.CopiedTosymposiumAndConferences,
                    SymposiumLinkInd = activity.SymposiumLinkInd,
                    SymposiumLink = activity.SymposiumLink,
                    StudentCalendarResident = studentCalendarInfo.StudentCalendarResident,
                    StudentCalendarDistanceGroup1 = studentCalendarInfo.StudentCalendarDistanceGroup1,
                    StudentCalendarDistanceGroup2 = studentCalendarInfo.StudentCalendarDistanceGroup2,
                    StudentCalendarDistanceGroup3 = studentCalendarInfo.StudentCalendarDistanceGroup3,
                    StudentCalendarDistanceGroup4 = studentCalendarInfo.StudentCalendarDistanceGroup4,
                    StudentType = studentCalendarInfo.StudentType,
                };
            }
        }
    }

    public class StudentCalendarInfo
    {
        public string Color { get; set; }
        public string StudentType { get; set; }
        public bool StudentCalendarResident { get; set; }
        public bool StudentCalendarDistanceGroup1 { get; set; }
        public bool StudentCalendarDistanceGroup2 { get; set; }
        public bool StudentCalendarDistanceGroup3 { get; set; }
        public bool StudentCalendarDistanceGroup4 { get; set; }
    }
}
