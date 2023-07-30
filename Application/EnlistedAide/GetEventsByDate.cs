
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;
using Application.Activities;
using Persistence.Migrations;

namespace Application.EnlistedAide
{
    public class GetEventsByDate
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
                DateTime start = Helper.GetDateTimeFromRequest(request.Start).AddMonths(-3);
                DateTime end = Helper.GetDateTimeFromRequest(request.End).AddMonths(3);


                var checklists = await _context.EnlistedAideCheckLists.Include(x => x.Activity)
                       .Where(
                                         x =>
                                            (x.Activity.Start > start && x.Activity.End < end)
                                   ).
                    Where(x => !x.Activity.LogicalDeleteInd)
                    .ToListAsync();

                List<FullCalendarEventDTO> fullCalendarEventDTOs = new List<FullCalendarEventDTO>();

                foreach (var checkList in checklists)
                {
                   fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Event", checkList.Activity.AllDayEvent, checkList.Activity.Start, checkList.Activity.End));
                    if (checkList.AlcoholEstimate)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Alcohol Estimate", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                            checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PrepareLegalReview)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                            checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PreparePRAForm)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare PR&A Form With Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                             checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PrepareGuestList)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare Guest List With Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                               checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.Prepare4843GuestList)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare 4843 Guest List With Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                             checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PrepareMenu)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Menu Preparation", true,
                            checkList.Activity.Start.Date.AddDays(-21),
                                checkList.Activity.Start.Date.AddDays(-21)
                            ));
                    }
                    if (checkList.SendToLegalForApproval)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Submit Legal Review For Approval", true,
                            checkList.Activity.Start.Date.AddDays(-21),
                             checkList.Activity.Start.Date.AddDays(-21)
                            ));
                    }
                    if (checkList.MenuReviewedByPrincipal)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Menu Reviewed By Principal", true,
                            checkList.Activity.Start.Date.AddDays(-14),
                              checkList.Activity.Start.Date.AddDays(-14)
                            ));
                    }
                    if (checkList.OrderAlcohol)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Order Alcohol", true,
                            checkList.Activity.Start.Date.AddDays(-14),
                              checkList.Activity.Start.Date.AddDays(-14)
                            ));
                    }
                    if (checkList.GFEBS)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "GFEBS (upon Legal Review document approval)", true,
                            checkList.Activity.Start.Date.AddDays(-14),
                              checkList.Activity.Start.Date.AddDays(-14)
                            ));
                    }
                    if (checkList.GatherIce)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Gather ICE", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.HighTopsAndTables)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "High Tops and Tables", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.SweepAndMop)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Sweep and Mop", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.PolishSilver)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Polish Silver", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.CleanCutlery)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Clean Cutlery", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.CleanPlates)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Clean Plates", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.CleanServiceItems)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Clean Service Items", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.NapkinsPressed)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Napkins Pressed", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.NapkinsRolled)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Napkins Rolled", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.FoodShopping)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Food Shopping", true,
                            checkList.Activity.Start.Date.AddDays(-2),
                              checkList.Activity.Start.Date.AddDays(-2)
                            ));
                    }
                    if (checkList.FoodPrep)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Food Prep", true,
                            checkList.Activity.Start.Date.AddDays(-2),
                              checkList.Activity.Start.Date.AddDays(-2)
                            ));
                    }
                    if (checkList.TentSetUp)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Tent Set Up", true,
                            checkList.Activity.Start.Date.AddDays(-2),
                              checkList.Activity.Start.Date.AddDays(-2)
                            ));
                    }
                    if (checkList.Dust)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Dust", true,
                            checkList.Activity.Start.Date.AddDays(-1),
                              checkList.Activity.Start.Date.AddDays(-1)
                            ));
                    }
                    if (checkList.Cook)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Cook", true,
                            checkList.Activity.Start.Date.AddDays(-0),
                              checkList.Activity.Start.Date.AddDays(-0)
                            ));
                    }
                    if (checkList.Coffee)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Coffee", false,
                            checkList.Activity.Start.AddHours(-1),
                              checkList.Activity.Start
                            ));
                    }
                    if (checkList.IceBeverages)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Ice Beverages", false,
                            checkList.Activity.Start.AddHours(-1),
                              checkList.Activity.Start
                            ));
                    }
                    if (checkList.Sterno)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Sterno", false,
                            checkList.Activity.Start.AddMinutes(-30),
                              checkList.Activity.Start
                            ));
                    }
                }


                return Result<List<FullCalendarEventDTO>>.Success(fullCalendarEventDTOs);
            }

            private FullCalendarEventDTO CreateFullCalendarEventDTO(Domain.EnlistedAideCheckList checkList, string task, bool allDayEvent, DateTime start, DateTime end)
            {
                DateTime endDateForCalendar = allDayEvent ? end.AddDays(1) : end;
                return new FullCalendarEventDTO
                {
                    Id = checkList.Id.ToString(),
                    CategoryId = checkList.Activity.CategoryId.ToString(),
                    ActivityId = checkList.Activity.Id.ToString(),
                    Title = $"{task}  ( {checkList.Activity.Title} )",
                    Start = Helper.GetStringFromDateTime(start, allDayEvent),
                    End = Helper.GetStringFromDateTime(endDateForCalendar, allDayEvent),
                    Color = GetColor(task),
                    AllDay = allDayEvent,
                    ActionOfficer = checkList.Activity.ActionOfficer,
                    ActionOfficerPhone = checkList.Activity.ActionOfficerPhone,
                    EventTitle = checkList.Activity.Title,
                    Task = task,
                    EnlistedAideFundingType = checkList.Activity.EnlistedAideFundingType,
                    EnlistedAideVenue = checkList.Activity.EnlistedAideVenue,
                    EnlistedAideGuestCount = checkList.Activity.EnlistedAideGuestCount,
                    EnlistedAideCooking = checkList.Activity.EnlistedAideCooking,
                    EnlistedAideDietaryRestrictions = checkList.Activity.EnlistedAideDietaryRestrictions,
                    EnlistedAideAlcohol = checkList.Activity.EnlistedAideAlcohol,
                    EnlistedAideNumOfBartenders = checkList.Activity.EnlistedAideNumOfBartenders,
                    EnlistedAideNumOfServers = checkList.Activity.EnlistedAideNumOfServers,
                    EnlistedAideSupportNeeded = checkList.Activity.EnlistedAideSupportNeeded
                };
                }

            private string GetColor(string task)
            {
                switch (task)
                {
                    case "Event":
                        return "#00008B";
                    case "Alcohol Estimate":
                        return "#800080";
                    case "Prepare Legal Review":
                        return "#FF8C00";
                    case "Prepare PR&A Form With Legal Review":
                        return "#8B0000";
                    case "Prepare Guest List With Legal Review":
                        return "#006400";
                    case "Prepare 4843 Guest List With Legal Review":
                        return "#00008B";
                    case "Menu Preparation":
                        return "#008B8B";
                    case "Submit Legal Review For Approval":
                        return "#808000";
                    case "Order Alcohol":
                        return "#A9A9A9";
                    case "GFEBS (upon Legal Review document approval)":
                        return "#654321";
                    case "Gather ICE":
                        return "#2F4F4F";
                    case "High Tops and Tables":
                        return "#556B2F";
                    case "Sweep and Mop":
                        return "#8FBC8F";
                    case "Polish Silver":
                        return "#BDB76B";
                    case "Clean Cutlery":
                        return "#B8860B";
                    case "Clean Plates":
                        return "#E9967A";
                    case "Clean Service Items":
                        return "#9400D3";
                    case "Napkins Pressed":
                        return "#00CED1";
                    case "Napkins Rolled":
                        return "#E75480";
                    case "Food Shopping":
                        return "#734F50";
                    case "Food Prep":
                        return "#555D50";
                    case "Tent Set Up":
                        return "#00CED1";
                    case "Dust":
                        return "#967117";
                    case "Cook":
                        return "#7C0A02";
                    case "Coffee":
                        return "#A52A2A";
                    case "Ice Beverages":
                        return "#B7410E";
                    case "Sterno":
                        return "#D2691E";
                    default:
                        return "#483D8B";
                }
            }
        }
    }
}
