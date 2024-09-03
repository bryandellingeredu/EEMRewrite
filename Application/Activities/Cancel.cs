using MediatR;
using Persistence;
using Application.Core;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Domain;
using Microsoft.AspNetCore.Hosting;

namespace Application.Activities
{
    public class Cancel
    {
        public class Command : IRequest<Result<Unit>>
        {
            public CancelEventDTO CancelEventDTO
            {
                get;
                set;
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IConfiguration _config;
            private readonly IWebHostEnvironment _webHostEnvironment;

            public Handler(DataContext context, IUserAccessor userAccessor, IConfiguration config, IWebHostEnvironment webHostEnvironment)
            {
                _context = context;
                _userAccessor = userAccessor;
                _config = config;
                _webHostEnvironment = webHostEnvironment;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                Activity oldActivity = null;
                try
                {
                    oldActivity = _context.Activities.AsNoTracking().FirstOrDefault(a => a.Id == request.CancelEventDTO.ActivityId);  

                }
                catch (Exception)
                {

                    // do nothing
                }

                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                var activity = await _context.Activities.FindAsync(request.CancelEventDTO.ActivityId);
            
                if (activity == null) return null;
                  //delete graph events
                if (
                  !string.IsNullOrEmpty(activity.EventLookup) &&
                  !string.IsNullOrEmpty(activity.CoordinatorEmail)
                )
                {
                    try
                    {
                        await GraphHelper.DeleteEvent(activity.EventLookup, activity.CoordinatorEmail, oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                    }
                    catch (Exception)
                    {

                        try
                        {
                            await GraphHelper.DeleteEvent(activity.EventLookup, GraphHelper.GetEEMServiceAccount(), oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                        }
                        catch (Exception)
                        {

                            // event does not exist
                        }
                    }
                }
                if (!string.IsNullOrEmpty(activity.VTCLookup))
                {
                    try
                    {
                        await GraphHelper.DeleteEvent(activity.VTCLookup, GraphHelper.GetEEMServiceAccount(), oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail);
                    }
                    catch (Exception)
                    {
                      

                            // event does not exist
                    }
                }
                // delete team events
                if(!string.IsNullOrEmpty(activity.TeamLookup) && !string.IsNullOrEmpty(activity.TeamRequester)){
                    try
                    {
                        await GraphHelper.DeleteTeamsMeeting(activity.TeamLookup, activity.TeamRequester, activity.TeamOwner);
                    }
                    catch (Exception)
                    {

                        // event does not exist
                    }

                }
                activity.VTCLookup = null;  
                activity.EventLookup = null;
                activity.EventLookupCalendar = null;   
                activity.EventLookupCalendarEmail = null;   
                activity.TeamLookup = null;
                activity.TeamRequester = null;
                activity.TeamLink = null;
                activity.CancelledBy = user.Email;
                activity.CancelledAt = DateTime.Now;
                activity.Cancelled = true;
                activity.CancelledReason = request.CancelEventDTO.Reason;
                activity.Title = "Cancelled: " + activity.Title;
                var result = await _context.SaveChangesAsync() > 0;
                WorkflowHelper workflowHelper = new WorkflowHelper(activity, settings, _context, _webHostEnvironment, oldActivity);
                await workflowHelper.SendNotifications();
                if (!result) return Result<Unit>.Failure("Failed to cancel the activity");
                return Result<Unit>.Success(Unit.Value);
            }
        }

    }
}