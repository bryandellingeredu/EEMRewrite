
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;
using Application.GraphSchedules;

namespace Application.Activities
{
    public class GetIMCEventsByDate
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



                var activities = await _context.Activities.Include(x => x.Organization).Include(x => x.Category)
                       .Where(
                                         x =>
                                            (x.Start <= start && x.End <= end) ||
                                            (x.Start >= start && x.End <= end) ||
                                            (x.Start <= end && x.End >= end) ||
                                            (x.Start <= start && x.End >= end)
                                   ).
                    Where(x => x.IMC == true).
                    Where(x => !x.LogicalDeleteInd)
                    .ToListAsync();

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
                        Color = activity.Category.IMCColor,
                        AllDay = activity.AllDayEvent,
                        CategoryId = activity.CategoryId.ToString(),
                        CategoryName = activity.Category.Name,
                        Description = activity.Description,
                        PrimaryLocation = activity.PrimaryLocation,
                        LeadOrg = activity.Organization?.Name,
                        ActionOfficer = activity.ActionOfficer,
                        ActionOfficerPhone = activity.ActionOfficerPhone,
                        EventLookup = activity.EventLookup,
                        CoordinatorEmail = activity.CoordinatorEmail,
                        Recurring = activity.RecurrenceInd,
                        TeamInd = !string.IsNullOrEmpty(activity.TeamLink)
                    };

                    fullCalendarEventDTOs.Add(fullCalendarEventDTO);
                }


                return Result<List<FullCalendarEventDTO>>.Success(fullCalendarEventDTOs);
            }

        }
    }
}
