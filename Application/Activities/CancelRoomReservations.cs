﻿using Application.Core;
using Application.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class CancelRoomReservations
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

            public Handler(DataContext context, IMapper mapper, IConfiguration config, IUserAccessor userAccessor, ICACAccessor cacAccessor)
            {
                _context = context;
                _mapper = mapper;
                _config = config;

            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                var activity = await _context.Activities.FindAsync(request.Id, cancellationToken);

                if ( string.IsNullOrEmpty(activity.CoordinatorEmail) ||
                     !activity.CoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1])
                     ) {
                        activity.CoordinatorEmail = GraphHelper.GetEEMServiceAccount();
                    }
                if (!string.IsNullOrEmpty(activity.CoordinatorEmail) && !string.IsNullOrEmpty(activity.EventLookup)) {
                    try
                    {
                        await GraphHelper.DeleteEvent(activity.EventLookup, activity.CoordinatorEmail);
                    }
                    catch (Exception)
                    {

                        //event does not exist
                    }
                   
                }

                return Result<Unit>.Success(Unit.Value);

            }
        }
    }
}
