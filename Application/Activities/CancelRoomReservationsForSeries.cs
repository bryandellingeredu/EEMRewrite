using Application.Core;
using Application.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class CancelRoomReservationsForSeries
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id
            {
                get;
                set;
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IConfiguration _config;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IConfiguration config, IUserAccessor userAccessor, ICACAccessor cacAccessor)
            {
                _context = context;
                _mapper = mapper;
                _config = config;
                _userAccessor = userAccessor;

            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                var activityFromRequest = await _context.Activities.AsNoTracking() .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

                if (activityFromRequest != null && activityFromRequest.RecurrenceId != null) {
                    var activitiesToBeDeleted = _context.Activities.Where(x => x.RecurrenceId == activityFromRequest.RecurrenceId);
                    var allrooms = await GraphHelper.GetRoomsAsync();
                    foreach (var activity in activitiesToBeDeleted)
                    {
                        try
                        {
                            await GraphHelper.DeleteEvent(activity.EventLookup, activity.CoordinatorEmail, activity.CoordinatorEmail, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                            activity.EventLookup = string.Empty;
                            activity.EventLookupCalendar = string.Empty;
                        }
                        catch (Exception)
                        {

                            try
                            {
                                await GraphHelper.DeleteEvent(activity.EventLookup, activity.CoordinatorEmail, activity.CoordinatorEmail, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                                activity.EventLookup = string.Empty;
                                activity.EventLookupCalendar = string.Empty;
                            }
                            catch (Exception)
                            {

                                activity.EventLookup = string.Empty;
                                activity.EventLookupCalendar = string.Empty;
                            }
                        }
                        if(!string.IsNullOrEmpty(activity.VTCLookup)) {
                            try
                            {
                                await GraphHelper.DeleteEvent(activity.VTCLookup, GraphHelper.GetEEMServiceAccount(), activity.CoordinatorEmail, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                                activity.VTCLookup = string.Empty;
                            }
                            catch (Exception)
                            {

                                try
                                {
                                    await GraphHelper.DeleteEvent(activity.VTCLookup, activity.CoordinatorEmail, activity.CoordinatorEmail, activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                                    activity.VTCLookup = string.Empty;
                                }
                                catch (Exception)
                                {

                                    activity.VTCLookup = string.Empty;
                                }
                            }

                        }
                    }
                    await _context.SaveChangesAsync(cancellationToken); 
                }

                return Result<Unit>.Success(Unit.Value);

            }
        }
    }
}

