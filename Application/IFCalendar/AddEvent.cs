using Application.Activities;
using Application.Core;
using Application.Interfaces;
using Application.PocketCalendar;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.IdentityModel.Tokens;
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

                if(request.IFAddEventRequest.NeedRoom && !string.IsNullOrEmpty(request.IFAddEventRequest.SelectedRoomEmail))
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    activity.RoomEmails = new string[] { request.IFAddEventRequest.SelectedRoomEmail };
                    GraphEventDTO graphEventDTO = new GraphEventDTO
                    {
                        EventTitle = activity.Title,
                        EventDescription = activity.Description,
                        Start = activity.StartDateAsString,
                        End = activity.EndDateAsString,
                        RequesterEmail = GraphHelper.GetEEMServiceAccount(),
                        RequesterFirstName = GraphHelper.GetEEMServiceAccount(),
                        RequesterLastName = GraphHelper.GetEEMServiceAccount(),
                        RoomEmails = activity.RoomEmails,
                        UserEmail = user.Email
                    };
                    Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                    activity.EventLookup = evt.Id;
                    activity.EventLookupCalendar = evt.Calendar.Id;
                    activity.EventLookupCalendarEmail = evt.Organizer.EmailAddress.Address;
                    var allrooms = await GraphHelper.GetRoomsAsync();
                    var room = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == request.IFAddEventRequest.SelectedRoomEmail).FirstOrDefault();
                    activity.PrimaryLocation = room.DisplayName;

                }

                _context.Activities.Add(activity);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Create Activity");
                return Result<Unit>.Success(Unit.Value);

            }
        }
    }
}
