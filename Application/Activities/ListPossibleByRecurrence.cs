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
            public async Task<Result<List<Activity>>> Handle(Command request, CancellationToken cancellationToken)
            {
                List<Activity> result = Helper.GetActivitiesFromRecurrence(request.Recurrence);
                return await Task.FromResult(Result<List<Activity>>.Success(result));
            }
        }
    }
}
