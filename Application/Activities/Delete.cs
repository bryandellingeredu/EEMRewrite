using MediatR;
using Persistence;
using Application.Core;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Domain;

namespace Application.Activities
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
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
                    oldActivity = _context.Activities.AsNoTracking().FirstOrDefault(a => a.Id == request.Id);

                }
                catch (Exception)
                {

                    // do nothing
                }
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                var activity = await _context.Activities.FindAsync(request.Id);
                if (activity == null) return null;
                  //delete graph events
                if (
                  !string.IsNullOrEmpty(activity.EventLookup) &&
                  !string.IsNullOrEmpty(activity.CoordinatorEmail)
                )
                {
                    try
                    {
                        await GraphHelper.DeleteEvent(activity.EventLookup, activity.CoordinatorEmail, oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, activity.EventLookupCalendar);
                    }
                    catch (Exception)
                    {

                        try
                        {
                            await GraphHelper.DeleteEvent(activity.EventLookup, GraphHelper.GetEEMServiceAccount(), oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, activity.EventLookupCalendar);
                        }
                        catch (Exception)
                        {

                            //event does not exist
                        }
                    }
                  
                }
                // delete svtc setup event
                if (!string.IsNullOrEmpty(activity.VTCLookup))
                {
                    try
                    {
                        await GraphHelper.DeleteEvent(activity.VTCLookup, GraphHelper.GetEEMServiceAccount(), oldActivity.CoordinatorEmail, oldActivity.LastUpdatedBy, oldActivity.CreatedBy, activity.EventLookupCalendar);
                    }
                    catch (Exception ex)
                    {
                        var x = "y";
                    }
                }
                // delete team events
                if(!string.IsNullOrEmpty(activity.TeamLookup) && !string.IsNullOrEmpty(activity.TeamRequester)) {
                    try
                    {
                       await GraphHelper.DeleteTeamsMeeting(activity.TeamLookup, activity.TeamRequester);
                    }
                    catch (Exception)
                    {

                        //event does not exist
                    }
                }
                activity.VTCLookup = null;
                activity.EventLookup = null;
                activity.EventLookupCalendar = null;
                activity.TeamLookup= null;  
                activity.TeamRequester = null;
                activity.TeamLink= null;    
                activity.LogicalDeleteInd = true;
                activity.DeletedBy = user.Email;
                activity.DeletedAt = DateTime.Now;
                var result = await _context.SaveChangesAsync() > 0;
                WorkflowHelper workflowHelper = new WorkflowHelper(activity, settings, _context, _webHostEnvironment, oldActivity);
                await workflowHelper.SendNotifications();
                if (!result) return Result<Unit>.Failure("Failed to delete the activity");
                return Result<Unit>.Success(Unit.Value);
            }
        }

    }
}