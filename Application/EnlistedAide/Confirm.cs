using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

namespace Application.EnlistedAide
{
    public class Confirm
    {
        public class Command : IRequest<Result<Unit>>
        {
            public EnlistedAideConfirmationDTO EnlistedAideConfirmationDTO
            {
                get;
                set;
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly IWebHostEnvironment _webHostEnvironment;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IConfiguration config, IWebHostEnvironment webHostEnvironment, IUserAccessor userAccessor)
            {
                _context = context;
                _config = config;
                _webHostEnvironment = webHostEnvironment;
                _userAccessor = userAccessor;
            }


            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                var activity = await _context.Activities.FindAsync(request.EnlistedAideConfirmationDTO.Id);
                activity.EnlistedAideAcknowledged = request.EnlistedAideConfirmationDTO.EnlistedAideAcknowledged;
                activity.EnlistedAideNumOfBartenders = request.EnlistedAideConfirmationDTO.EnlistedAideNumOfBartenders;
                activity.EnlistedAideNumOfServers = request.EnlistedAideConfirmationDTO.EnlistedAideNumOfServers;
                activity.EnlistedAideSupportNeeded = request.EnlistedAideConfirmationDTO.EnlistedAideSupportNeeded;
                activity.SendEnlistedAideConfirmationNotification = true;
                activity.LastUpdatedBy = user.Email;
                activity.LastUpdatedAt = DateTime.Now;
                var result = await _context.SaveChangesAsync() > 0;
                var a = await _context.Activities.FindAsync(request.EnlistedAideConfirmationDTO.Id);
                WorkflowHelper workflowHelper = new WorkflowHelper(a, settings, _context, _webHostEnvironment);
                await workflowHelper.SendNotifications();
                EnlistedAideCheckList enlistedAideCheckList = await _context.EnlistedAideCheckLists.FirstOrDefaultAsync(x => x.ActivityId == request.EnlistedAideConfirmationDTO.Id);
                if (enlistedAideCheckList == null && request.EnlistedAideConfirmationDTO.EnlistedAideAcknowledged)
                {
                    EnlistedAideCheckList newEnlistedAideCheckList = new EnlistedAideCheckList
                    {
                        ActivityId = request.EnlistedAideConfirmationDTO.Id
                    };
                    _context.EnlistedAideCheckLists.Add(newEnlistedAideCheckList);
                    result = await _context.SaveChangesAsync() > 0;
                }
                if (!result) return Result<Unit>.Failure("Failed to Confirm EA");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
