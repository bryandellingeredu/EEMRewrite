using Domain;
using FluentValidation;
using MediatR;
using Persistence;
using Application.Core;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System.Diagnostics;
using Activity = Domain.Activity;
using Azure.Core;
using System.Globalization;
using Microsoft.Graph.ExternalConnectors;
using DayOfWeek = System.DayOfWeek;
using Persistence.Migrations;
using Recurrence = Domain.Recurrence;

namespace Application.Activities
{
    public class Create
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
                    Helper.InitHelper(_mapper);
                    List<Activity> activities = new List<Activity>();

                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                    if (request.Activity.RecurrenceInd && request.Activity.Recurrence != null)
                    {
                        Recurrence recurrence = new Recurrence();
                        _mapper.Map(request.Activity.Recurrence, recurrence);
                        _context.Recurrences.Add(recurrence);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to Create Recurrence");
                        activities = Helper.GetActivitiesFromRecurrence(recurrence, request.Activity);
                    }
                    else
                    {
                        Activity activity = new Activity();
                        _mapper.Map(request.Activity, activity);
                        activities.Add(activity);
                    }

                    foreach (var a in activities)
                    {
                        if (request.Activity.RecurrenceInd && request.Activity.Recurrence != null)
                        {
                            a.RecurrenceId = request.Activity.Recurrence.Id;
                        }

                        if (!string.IsNullOrEmpty(a.CoordinatorEmail))
                        {
                            //create outlook event
                            GraphEventDTO graphEventDTO = new GraphEventDTO
                            {
                                EventTitle = a.Title,
                                EventDescription = a.Description,
                                Start = a.StartDateAsString,
                                End = a.EndDateAsString,
                                RoomEmails = a.RoomEmails,
                                RequesterEmail = a.CoordinatorEmail,
                                RequesterFirstName = a.CoordinatorFirstName,
                                RequesterLastName = a.CoordinatorLastName,
                                IsAllDay = a.AllDayEvent
                            };
                            Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                            a.EventLookup = evt.Id;

                        }
                        else
                        // user is not logged onto edu so do not make an outlook event
                        {
                            _context.Activities.Add(a);
                        }
                        _context.Activities.Add(a);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to Create Activity");
                    }
                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception e)
                {

                    throw;
                }
            }
          
        }
    }
}