using Domain;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class ActivityValidator : AbstractValidator<Activity>
    {
        public ActivityValidator()
        {
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.Category).NotEmpty();
            RuleFor(x => x.Start).NotEmpty();
            RuleFor(x => x.ActionOfficer).NotEmpty();
            RuleFor(x => x.ActionOfficerPhone).NotEmpty();
            RuleFor(x => x.End).NotEmpty().GreaterThan(r => r.Start)
        .WithMessage("start date must be before end date");
        }
    }
}