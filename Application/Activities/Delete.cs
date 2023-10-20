﻿using MediatR;
using Persistence;
using Application.Core;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

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

            public Handler(DataContext context, IUserAccessor userAccessor, IConfiguration config)
            {
                _context = context;
                _userAccessor = userAccessor;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
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
                        await GraphHelper.DeleteEvent(activity.EventLookup, activity.CoordinatorEmail);
                    }
                    catch (Exception)
                    {

                        try
                        {
                            await GraphHelper.DeleteEvent(activity.EventLookup, GraphHelper.GetEEMServiceAccount());
                        }
                        catch (Exception)
                        {

                            //event does not exist
                        }
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
                activity.EventLookup = null;
                activity.TeamLookup= null;  
                activity.TeamRequester = null;
                activity.TeamLink= null;    
                activity.LogicalDeleteInd = true;
                activity.DeletedBy = user.Email;
                activity.DeletedAt = DateTime.Now;
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to delete the activity");
                return Result<Unit>.Success(Unit.Value);
            }
        }

    }
}