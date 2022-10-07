using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;

namespace Application.Activities
{
    public class Create
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
                //begin if the user is signed into edu (coordinator email is populated) create an outlook event

                try
                {                   
                if (! string.IsNullOrEmpty(request.Activity.CoordinatorEmail))
                    {
                     //create outlook event
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
                           IsAllDay = request.Activity.AllDayEvent
                       };

                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    Event evt = await GraphHelper.CreateEvent(graphEventDTO);              

                    Activity activity = new Activity();
                    _mapper.Map(request.Activity, activity);
                    activity.EventLookup = evt.Id;
                    _context.Activities.Add(activity);
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to Create Activity");
                    return Result<Unit>.Success(Unit.Value);

                }
                else
                // user is not logged onto edu so do not make an outlook event
                {
                    Activity activity = new Activity();
                    _mapper.Map(request.Activity, activity);
                    _context.Activities.Add(activity);
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to Create Activity");
                    return Result<Unit>.Success(Unit.Value);
                }
                }
                catch (Exception e)
                {

                    throw;
                }
            }
        }
    }
}