
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using Microsoft.Extensions.Configuration;


namespace Application.Activities
{
    public class GetByRoom
    {
        public class Query : IRequest<Result<Activity>>
        {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Activity>>
        {
            private readonly DataContext _context;


            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
            }

            public async Task<Result<Activity>> Handle(Query request, CancellationToken cancellationToken)
            {
                var activity = new Activity();

                var activities = await _context.Activities.Where(x => x.Title == request.Title).ToListAsync();

                if (activities.Any())
                {
                    if (activities.Count == 1)
                    {
                        activity = activities.First();
                    } else
                    {
                        var startArray = request.Start.Split('T');
                        var endArray = request.End.Split('T');
                        var startDateArray = startArray[0].Split('-');
                        var endDateArray = endArray[0].Split('-');
                        var startTimeArray = startArray[1].Split(':');
                        var endTimeArray = endArray[1].Split(':');
                        int startYear = Int32.Parse(startDateArray[0]);
                        int endYear = Int32.Parse(endDateArray[0]);
                        int startMonth = Int32.Parse(startDateArray[1]);
                        int endMonth = Int32.Parse(endDateArray[1]);
                        int startDay = Int32.Parse(startDateArray[2]);
                        int endDay = Int32.Parse(endDateArray[2]);
                        int startHour = Int32.Parse(startTimeArray[0]);
                        int endHour = Int32.Parse(endTimeArray[0]);
                        int startMinute = Int32.Parse(startTimeArray[1]);
                        int endMinute = Int32.Parse(endTimeArray[1]);
                        DateTime start = new DateTime(startYear, startMonth, startDay, startHour, startMinute, 0);
                        DateTime end = new DateTime(endYear, endMonth, endDay, endHour, endMinute, 0);
                        activities = activities.Where(x => DateTime.Compare(x.Start, start) == 0).ToList();
                        if (activities.Count == 1)
                        {
                            activity = activities.First();
                        } else
                        {
                            activities = activities.Where(x => DateTime.Compare(x.End, end) == 0).ToList();
                            if (activities.Count == 1)
                            {
                                activity = activities.First();
                            }
                        }
                    }
                };

                if (activity.Organization != null)
                {
                    activity.Organization.Activities = null;
                }
                if (activity.Category != null)
                {
                    activity.Category.Activities = null;
                }            

                if (activity.Recurrence != null)
                {
                    activity.Recurrence.Activities = null;
                }
                return Result<Activity>.Success(activity);
            }
        }
    }
}
