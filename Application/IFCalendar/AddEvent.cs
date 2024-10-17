using Application.Core;
using Application.Interfaces;
using Application.PocketCalendar;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IFCalendar
{
    public class AddEvent
    {
        public class Command : IRequest<Result<Unit>>
        {
            public IFAddEventRequest IFAddEventRequest { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly IUserAccessor _userAccessor;

            public Handler(
              DataContext context, IConfiguration config, IUserAccessor userAccessor)
            {
                _context = context;
                _config = config;
                _userAccessor = userAccessor;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                var start = TimeZoneInfo.ConvertTime(request.IFAddEventRequest.StartDate, TimeZoneInfo.Local);
                var end = TimeZoneInfo.ConvertTime(request.IFAddEventRequest.EndDate, TimeZoneInfo.Local);
                var startDateAsString = start.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                var endDateAsString = end.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                var category = await _context.Categories.FirstOrDefaultAsync(x => x.Name == "International Fellows");
                Activity activity = new Activity();
                activity.Start = start;
                activity.End = end;
                activity.StartDateAsString = startDateAsString;
                activity.EndDateAsString = endDateAsString;
                activity.CoordinatorEmail = user.Email;
                activity.CoordinatorFirstName = user.DisplayName;
                activity.CoordinatorLastName = user.DisplayName;
                activity.CreatedBy = user.Email;
                activity.CreatedAt = DateTime.Now;
                activity.CategoryId = category.Id;
                activity.CopiedTointernationalfellows = true;
                activity.Title = request.IFAddEventRequest.Title;
                activity.Description = request.IFAddEventRequest.Description;
                activity.AllDayEvent = false;
                activity.EventClearanceLevel = "Unclassified";
                activity.PrimaryLocation = request.IFAddEventRequest.PrimaryLocation;
                activity.InternationalFellowsStaffEvent = !request.IFAddEventRequest.EventTypeStudent;
                activity.InternationalFellowsStudentEvent = request.IFAddEventRequest.EventTypeStudent;
                if (request.IFAddEventRequest.EventTypeStudent)
                {
                    activity.StudentCalendarResident = true;
                    activity.StudentCalendarMandatory = request.IFAddEventRequest.StudentAttendanceMandatory;
                    activity.StudentCalendarPresenter = request.IFAddEventRequest.StudentCalendarPresenter;
                    activity.StudentCalendarNotes = request.IFAddEventRequest.StudentCalendarNotes;
                    activity.StudentCalendarUniform = request.IFAddEventRequest.StudentCalendarUniform;
                }
                else
                {
                    activity.InternationalFellowsStaffEventCategory = request.IFAddEventRequest.InternationalFellowsStaffEventCategory;
                    if(!request.IFAddEventRequest.NeedRoom && request.IFAddEventRequest.InternationalFellowsStaffEventPrivate)
                    {
                        activity.InternationalFellowsStaffEventPrivate = true;
                    }
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
