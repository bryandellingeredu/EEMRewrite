using Application.Core;
using Application.GraphSchedules;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RoomReport
{
    public class Details
    {
        public class Query : IRequest<Result<List<Domain.RoomReport>>>
        {
            public RoomReportRequestDTO roomReportRequestDto { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<Domain.RoomReport>>>
        {
          private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<Domain.RoomReport>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var filteredRoomReports = await _context.RoomReports
                .Where(x => x.Day.Date >= request.roomReportRequestDto.Start.Date
                 && x.Day.Date <= request.roomReportRequestDto.End.Date)
                .ToListAsync();

                filteredRoomReports = filteredRoomReports
                .Where(x => x.Day.DayOfWeek != System.DayOfWeek.Saturday && x.Day.DayOfWeek != System.DayOfWeek.Sunday)
                .ToList();

                // Step 2: Perform the grouping and aggregation on the fetched data
                var groupedRoomReports = filteredRoomReports
                    .GroupBy(x => x.ScheduleId)
                    .Select(g => new Domain.RoomReport
                    {
                        ScheduleId = g.Key,
                        AvailabilityView = string.Concat(g.Select(x => x.AvailabilityView)),
                        Id = g.First().Id,
                        Day = g.First().Day
                    })
                    .ToList();

                return Result<List<Domain.RoomReport>>.Success(groupedRoomReports);
            }


        }
    }
}
