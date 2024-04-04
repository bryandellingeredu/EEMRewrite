using Application.Activities;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Persistence;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.PocketCalendar
{
    public class ReserveRoom
    {
        public class Command : IRequest<Result<Unit>>
        {
            public PocketCalendarDTO PocketCalendarDTO { get; set; }
            public string Email { get; set; }
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
                List<string> roomEmails = new List<string>();
                roomEmails.Add(request.PocketCalendarDTO.RoomEmail);
                var allrooms = await GraphHelper.GetRoomsAsync();
                var room = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == request.PocketCalendarDTO.RoomEmail).FirstOrDefault();
                string primaryLocation = room.DisplayName;
                var start = TimeZoneInfo.ConvertTime(request.PocketCalendarDTO.Start, TimeZoneInfo.Local);
                var end = TimeZoneInfo.ConvertTime(request.PocketCalendarDTO.End, TimeZoneInfo.Local);
                var startDateAsString = start.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                var endDateAsString = end.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                Category category = await _context.Categories.FirstAsync(x => x.Name == "Other");
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
                activity.Title = request.PocketCalendarDTO?.Title;  
                activity.Description = request.PocketCalendarDTO?.Description;
                activity.AllDayEvent = false;
                activity.ActionOfficer = user.DisplayName;
                activity.ActionOfficerPhone = "N/A";
                activity.RoomEmails = roomEmails.ToArray();
                activity.EventClearanceLevel = "Unclassified";
                activity.PrimaryLocation = primaryLocation;

                GraphEventDTO graphEventDTO = new GraphEventDTO
                {
                    EventTitle = activity.Title,
                    EventDescription = activity.Description,
                    Start = activity.StartDateAsString,
                    End = activity.EndDateAsString,
                    RoomEmails = activity.RoomEmails,
                    RequesterEmail = activity.CoordinatorEmail,
                    RequesterFirstName = activity.CoordinatorFirstName,
                    RequesterLastName = activity.CoordinatorLastName,
                    IsAllDay = activity.AllDayEvent,
                    UserEmail = user.Email
                };
                Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                activity.EventLookup = evt.Id;
                _context.Activities.Add(activity);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Create Activity");
                return Result<Unit>.Success(Unit.Value);

            }
        }
    }
}
