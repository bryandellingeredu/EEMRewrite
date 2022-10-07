
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

namespace Application.Activities
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Activity Activity { get; set; }
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

            public Handler(DataContext context, IMapper mapper, IConfiguration config)
            {
                _context = context;
                _mapper = mapper;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {

              
                //delete any old graph events we will make new ones
                if (
                    !string.IsNullOrEmpty(request.Activity.EventLookup)
                    &&
                    !string.IsNullOrEmpty(request.Activity.CoordinatorEmail)
                    )
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    await GraphHelper.DeleteEvent(request.Activity.EventLookup, request.Activity.CoordinatorEmail);
                }

                //delete the old activity rooms we will make new ones
                var oldActivityRooms = await _context.ActivityRooms.Where(x => x.ActivityId == request.Activity.Id).ToListAsync();
                    _context.RemoveRange(oldActivityRooms);
                    await _context.SaveChangesAsync();
              /*
         
                var activity = await _context.Activities.FindAsync(request.Activity.Id);
                if (activity == null) return null;
                _mapper.Map(request.Activity, activity);
                activity.ActivityRooms = null;
                activity.Category = null;
                activity.EventLookup = null;

                //create new graph event
                if (request.Activity.CoordinatorEmail != null)
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
                        RequesterLastName = request.Activity.CoordinatorLastName
                    };

                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                    activity.EventLookup = evt.Id;

                    //create new activity rooms
                    var allrooms = await GraphHelper.GetRoomsAsync();

                    var filteredRooms = allrooms.Where(x => graphEventDTO.RoomEmails
                    .Contains(x.AdditionalData["emailAddress"].ToString()));

                    List<ActivityRoom> newActivityRooms = new List<ActivityRoom>();
                    foreach (var room in filteredRooms)
                    {
                        newActivityRooms.Add(new ActivityRoom
                        {
                            Email = room.AdditionalData["emailAddress"].ToString(),
                            Name = room.DisplayName
                        });
                    }
                    if (newActivityRooms.Any())
                    {
                        activity.ActivityRooms = newActivityRooms;
                    }
                }
             
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Update Activity");*/
                return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception e)
                {

                    throw;
                }
            }

        }

        //ddd

    }
}