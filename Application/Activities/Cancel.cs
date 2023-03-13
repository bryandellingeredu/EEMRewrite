﻿using MediatR;
using Persistence;
using Application.Core;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

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
                var activity = await _context.Activities.FindAsync(request.CancelEventDTO.ActivityId);
                if (activity == null) return null;
                  //delete graph events
                if (
                  !string.IsNullOrEmpty(activity.EventLookup) &&
                  !string.IsNullOrEmpty(activity.CoordinatorEmail)
                )
                {
                    await GraphHelper.DeleteEvent(activity.EventLookup, activity.CoordinatorEmail);
                }
                activity.EventLookup = null;
                activity.CancelledBy = user.Email;
                activity.CancelledAt = DateTime.Now;
                activity.Cancelled = true;
                activity.CancelledReason = request.CancelEventDTO.Reason;
                activity.Title = "Cancelled: " + activity.Title;
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to cancel the activity");
                return Result<Unit>.Success(Unit.Value);
            }
        }

    }
}