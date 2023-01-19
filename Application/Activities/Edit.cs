using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Application.Interfaces;
using System.Dynamic;
using Application.DTOs;

namespace Application.Activities
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Activity Activity
            {
                get;
                set;
            }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IConfiguration _config;
            private readonly IUserAccessor _userAccessor;
            private readonly ICACAccessor _cacAccessor;

            public Handler(DataContext context, IMapper mapper, IConfiguration config, IUserAccessor userAccessor, ICACAccessor cacAccessor)
            {
                _context = context;
                _mapper = mapper;
                _config = config;
                _userAccessor = userAccessor;
                _cacAccessor = cacAccessor;  

            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                if (
                     (
                     string.IsNullOrEmpty(request.Activity.CoordinatorEmail) ||
                     !request.Activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                     ) &&
                     (
                     request.Activity.RoomEmails.Any() ||
                     !string.IsNullOrEmpty(request.Activity.EventLookup)
                     )
                    )
                {
                    request.Activity.CoordinatorEmail = GraphHelper.GetEEMServiceAccount();
                    request.Activity.CoordinatorFirstName = "EEMServiceAccount";
                    request.Activity.CoordinatorLastName = "EEMServiceAccount";
                }

                //delete any old graph events we will make new ones
                if (
                  !string.IsNullOrEmpty(request.Activity.EventLookup) &&
                  !string.IsNullOrEmpty(request.Activity.CoordinatorEmail)
                )
                {
                    await GraphHelper.DeleteEvent(request.Activity.EventLookup, request.Activity.CoordinatorEmail);
                }

                var activity = await _context.Activities.FindAsync(request.Activity.Id);
                if (activity == null) return null;
                var createdBy = activity.CreatedBy;
                var createdAt = activity.CreatedAt;
                if(!_cacAccessor.IsCACAuthenticated()){
                    var originalHostingReport = _context.HostingReports.AsNoTracking().FirstOrDefault(x => x.ActivityId == request.Activity.Id);
                    request.Activity.HostingReport = originalHostingReport;
                }
                _mapper.Map(request.Activity, activity);
                    if(activity.HostingReport != null && activity.HostingReport.Arrival != null){
                               activity.HostingReport.Arrival = TimeZoneInfo.ConvertTime(activity.HostingReport.Arrival.Value, TimeZoneInfo.Local);
                        }
                         if(activity.HostingReport != null && activity.HostingReport.Departure != null){
                               activity.HostingReport.Departure = TimeZoneInfo.ConvertTime(activity.HostingReport.Departure.Value, TimeZoneInfo.Local);
                        }
                activity.Category = null;
                activity.EventLookup = null;
                activity.RecurrenceId = null;
                activity.RecurrenceInd = false;

                //create new graph event
                if (
                          !string.IsNullOrEmpty(request.Activity.CoordinatorEmail)
                   )
                  {
                    GraphEventDTO graphEventDTO = new GraphEventDTO
                    {
                        EventTitle = request.Activity.Title,
                        EventDescription = request.Activity.Description,
                        Start = request.Activity.StartDateAsString,
                        End = request.Activity.EndDateAsString,
                        RoomEmails = request.Activity.RoomEmails,
                        RequesterEmail = request.Activity.CoordinatorEmail,
                        RequesterFirstName = request.Activity.CoordinatorFirstName,
                        RequesterLastName = request.Activity.CoordinatorLastName,
                        IsAllDay = request.Activity.AllDayEvent,
                        UserEmail = user.Email
                    };
                    Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                    activity.EventLookup = evt.Id;
                }
                if (activity.CoordinatorEmail == GraphHelper.GetEEMServiceAccount())
                {
                
                    activity.CoordinatorEmail = user.Email;
                    activity.CoordinatorFirstName = user.DisplayName;
                    activity.CoordinatorLastName = String.Empty;
                }
                activity.LastUpdatedBy = user.Email;
                activity.LastUpdatedAt = DateTime.Now;
                activity.CreatedBy = createdBy;
                activity.CreatedAt = createdAt;
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Update Activity");

                return Result<Unit>.Success(Unit.Value);
            }

        }

    }

}