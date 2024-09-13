
using MediatR;
using Persistence;
using Application.Core;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces;
using Domain;

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
                    activity.CopiedTospouse = request.ActivityCalendarInformationDTO.CopiedTospouse;
                    activity.CopiedTocsl = request.ActivityCalendarInformationDTO.CopiedTocsl;
                    activity.CopiedTogarrison = request.ActivityCalendarInformationDTO.CopiedTogarrison;
                    activity.CopiedTointernationalfellows = request.ActivityCalendarInformationDTO.CopiedTointernationalfellows;
                    activity.CopiedToexec = request.ActivityCalendarInformationDTO.CopiedToexec;
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

                if (activity.RecurrenceInd)
                {
                    var itemsToUpdate = new List<Activity>();

                    foreach (var item in _context.Activities.Where(x => x.RecurrenceId == activity.RecurrenceId).Where(x => x.Id != activity.Id).Where(x => !x.LogicalDeleteInd))
                    {
                        item.LastUpdatedBy = user.Email;
                       item.LastUpdatedAt = DateTime.Now;
                        item.CommunityEvent = request.ActivityCalendarInformationDTO.CommunityEvent;
                        item.CheckedForOpsec = request.ActivityCalendarInformationDTO.CheckedForOpsec;
                        item.MFP = request.ActivityCalendarInformationDTO.MFP;
                        item.IMC = request.ActivityCalendarInformationDTO.IMC;
                        item.CopiedToacademic = request.ActivityCalendarInformationDTO.CopiedToacademic;
                        item.CopiedToasep = request.ActivityCalendarInformationDTO.CopiedToasep;
                        item.CopiedTocommandGroup = request.ActivityCalendarInformationDTO.CopiedTocommandGroup;
                        item.CopiedTocommunity = request.ActivityCalendarInformationDTO.CopiedTocommunity;
                        item.CopiedTospouse = request.ActivityCalendarInformationDTO.CopiedTospouse;
                        item.CopiedTocsl = request.ActivityCalendarInformationDTO.CopiedTocsl;
                        item.CopiedTogarrison = request.ActivityCalendarInformationDTO.CopiedTogarrison;
                        item.CopiedTointernationalfellows = request.ActivityCalendarInformationDTO.CopiedTointernationalfellows;
                        item.CopiedToexec = request.ActivityCalendarInformationDTO.CopiedToexec;
                        item.CopiedTogeneralInterest = request.ActivityCalendarInformationDTO.CopiedTogeneralInterest;
                        item.CopiedToholiday = request.ActivityCalendarInformationDTO.CopiedToholiday;
                        item.CopiedTopksoi = request.ActivityCalendarInformationDTO.CopiedTopksoi;
                        item.CopiedTosocialEventsAndCeremonies = request.ActivityCalendarInformationDTO.CopiedTosocialEventsAndCeremonies;
                        item.CopiedTossiAndUsawcPress = request.ActivityCalendarInformationDTO.CopiedTossiAndUsawcPress;
                        item.CopiedTossl = request.ActivityCalendarInformationDTO.CopiedTossl;
                        item.CopiedTotrainingAndMiscEvents = request.ActivityCalendarInformationDTO.CopiedTotrainingAndMiscEvents;
                        item.CopiedTousahec = request.ActivityCalendarInformationDTO.CopiedTousahec;
                        item.CopiedTousahecFacilitiesUsage = request.ActivityCalendarInformationDTO.CopiedTousahecFacilitiesUsage;
                        item.CopiedTovisitsAndTours = request.ActivityCalendarInformationDTO.CopiedTovisitsAndTours;
                        item.CopiedTosymposiumAndConferences = request.ActivityCalendarInformationDTO.CopiedTosymposiumAndConferences;
                        item.CopiedTobattlerhythm = request.ActivityCalendarInformationDTO.CopiedTobattlerhythm;
                        item.CopiedTostaff = request.ActivityCalendarInformationDTO.CopiedTostaff;
                        item.CopiedTostudentCalendar = request.ActivityCalendarInformationDTO.CopiedTostudentCalendar;
                        item.EducationalCategory = request.ActivityCalendarInformationDTO.EducationalCategory;
                        itemsToUpdate.Add(item);
                    }
                    _context.Activities.UpdateRange(itemsToUpdate);
                     result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to Update Recurring Activities");
                }

                return Result<Unit>.Success(Unit.Value);
            }

        }

    }
}