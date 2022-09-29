using Domain;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphSchedules
{
    public class GraphScheduleValidator : AbstractValidator<ScheduleRequestDTO>
    {
        public GraphScheduleValidator()
        {
            RuleFor(x => x.Schedules).NotEmpty();
            RuleFor(x => x.StartTime).NotEmpty();
            RuleFor(x => x.EndTime).NotEmpty();
            RuleFor(x => x.AvailabilityViewInterval).NotEmpty();
        }
    }
}