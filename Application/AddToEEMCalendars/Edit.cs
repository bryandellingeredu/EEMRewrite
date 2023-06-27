
using MediatR;
using Persistence;
using Application.Core;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces;

namespace Application.AddToEEMCalendars
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>>
        {
            public ActivityCalendarInformationDTO ActivityCalendarInformationDTO
            {
                get;
                set;
            }
        }

 

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;


            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                var activity = await _context.Activities.FindAsync(request.ActivityCalendarInformationDTO.Id);  
                activity.LastUpdatedBy = user.Email;
                activity.LastUpdatedAt = DateTime.Now;
                activity.CommunityEvent = request.ActivityCalendarInformationDTO.CommunityEvent;
                activity.CheckedForOpsec = request.ActivityCalendarInformationDTO.CheckedForOpsec;
                activity.MFP = request.ActivityCalendarInformationDTO.MFP;
                activity.IMC = request.ActivityCalendarInformationDTO.IMC;
                activity.CopiedToacademic = request.ActivityCalendarInformationDTO.CopiedToacademic;
                activity.CopiedToasep = request.ActivityCalendarInformationDTO.CopiedToasep;
                activity.CopiedTocommandGroup = request.ActivityCalendarInformationDTO.CopiedTocommandGroup;
                activity.CopiedTocommunity = request.ActivityCalendarInformationDTO.CopiedTocommunity;
                activity.CopiedTocsl = request.ActivityCalendarInformationDTO.CopiedTocsl;
                activity.CopiedTogarrison = request.ActivityCalendarInformationDTO.CopiedTogarrison;
                activity.CopiedTogeneralInterest = request.ActivityCalendarInformationDTO.CopiedTogeneralInterest;
                activity.CopiedToholiday = request.ActivityCalendarInformationDTO.CopiedToholiday;
                activity.CopiedTopksoi = request.ActivityCalendarInformationDTO.CopiedTopksoi;
                activity.CopiedTosocialEventsAndCeremonies = request.ActivityCalendarInformationDTO.CopiedTosocialEventsAndCeremonies;
                activity.CopiedTossiAndUsawcPress = request.ActivityCalendarInformationDTO.CopiedTossiAndUsawcPress;
                activity.CopiedTossl = request.ActivityCalendarInformationDTO.CopiedTossl;
                activity.CopiedTotrainingAndMiscEvents = request.ActivityCalendarInformationDTO.CopiedTotrainingAndMiscEvents;
                activity.CopiedTousahec = request.ActivityCalendarInformationDTO.CopiedTousahec;
                activity.CopiedTousahecFacilitiesUsage = request.ActivityCalendarInformationDTO.CopiedTousahecFacilitiesUsage;
                activity.CopiedTovisitsAndTours = request.ActivityCalendarInformationDTO.CopiedTovisitsAndTours;
                activity.CopiedTosymposiumAndConferences = request.ActivityCalendarInformationDTO.CopiedTosymposiumAndConferences;
                activity.CopiedTobattlerhythm = request.ActivityCalendarInformationDTO.CopiedTobattlerhythm;
                activity.CopiedTostaff = request.ActivityCalendarInformationDTO.CopiedTostaff;
                activity.CopiedTostudentCalendar = request.ActivityCalendarInformationDTO.CopiedTostudentCalendar;
                activity.EducationalCategory = request.ActivityCalendarInformationDTO.EducationalCategory;

                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Update Activity");
              

                return Result<Unit>.Success(Unit.Value);
            }





        }

    }
}