using Application.Core;
using Application.GraphSchedules;
using Domain;
using MediatR;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;

namespace Application.Activities
{
    public class ListPossibleByRecurrence
    {
        public class Command : IRequest<Result<List<Activity>>>
        {
            public Recurrence Recurrence { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<List<Activity>>>
        {
            private readonly IMapper _mapper;

            public Handler(IMapper mapper)
            {
                _mapper = mapper;
            }

            public async Task<Result<List<Activity>>> Handle(Command request, CancellationToken cancellationToken)
            {
                Recurrence recurrence = new Recurrence();
                _mapper.Map(request.Recurrence, recurrence);
                var convertedStartDate = TimeZoneInfo.ConvertTime(recurrence.ActivityStart.Value, TimeZoneInfo.Local);
                var convertedEndDate = TimeZoneInfo.ConvertTime(recurrence.ActivityEnd.Value, TimeZoneInfo.Local);
                recurrence.ActivityStart= convertedStartDate;
                recurrence.ActivityEnd= convertedEndDate;   
                List<Activity> result = Helper.GetActivitiesFromRecurrence(recurrence);
                return await Task.FromResult(Result<List<Activity>>.Success(result));
            }
        }
    }
}
