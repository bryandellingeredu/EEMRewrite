using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.SyncCalendarNotifications
{
    public class Add
    {
        public class Command : IRequest<Result<Unit>>
        {
            public SyncCalendarNotificationDTO SyncCalendarNotificationDTO
            {
                get;
                set;
            }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(
               DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;   
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var route = request.SyncCalendarNotificationDTO.Route;
                var email = request.SyncCalendarNotificationDTO.Email.ToLower();

          SyncToCalendarNotification syncCalendarNotification = await _context.SyncToCalendarNotifications
                    .Where(x => x.Email.ToLower() == email)
                    .FirstOrDefaultAsync(cancellationToken);  

                if (syncCalendarNotification == null) {
                    var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                    var studentType =  _userAccessor.GetStudentType(user.Email);
                    if(studentType == null)
                    {
                        studentType = "notastudent";
                    }
                  await  _context.SyncToCalendarNotifications.AddAsync(
                        new SyncToCalendarNotification
                        {
                            Email = email.ToLower(),
                            StudentType = studentType
                        });
                   await  _context.SaveChangesAsync();
                    syncCalendarNotification = await _context.SyncToCalendarNotifications
                    .Where(x => x.Email.ToLower() == email)
                    .FirstAsync(cancellationToken);
                }

                switch (route)
                {
                    case "academic":
                        syncCalendarNotification.CopiedToacademic = true;
                        break;
                    case "asep":
                        syncCalendarNotification.CopiedToasep = true;
                        break;
                    case "commandGroup":
                        syncCalendarNotification.CopiedTocommandGroup = true;
                        break;
                    case "community":
                        syncCalendarNotification.CopiedTocommunity = true;
                        break;
                    case "csl":
                        syncCalendarNotification.CopiedTocsl = true;
                        break;
                    case "garrison":
                        syncCalendarNotification.CopiedTogarrison = true;
                        break;
                    case "generalInterest":
                        syncCalendarNotification.CopiedTogeneralInterest = true;
                        break;
                    case "holiday":
                        syncCalendarNotification.CopiedToholiday = true;
                        break;
                    case "pksoi":
                        syncCalendarNotification.CopiedTopksoi = true;
                        break;
                    case "socialEventsAndCeremonies":
                        syncCalendarNotification.CopiedTosocialEventsAndCeremonies = true;  
                        break;
                    case "usahec":
                        syncCalendarNotification.CopiedTousahec = true;
                        break;
                    case "ssiAndUsawcPress":
                        syncCalendarNotification.CopiedTossiAndUsawcPress = true;
                        break;
                    case "ssl":
                        syncCalendarNotification.CopiedTossl = true;
                        break;
                    case "trainingAndMiscEvents":
                        syncCalendarNotification.CopiedTotrainingAndMiscEvents = true;
                        break;
                    case "usahecFacilitiesUsage":
                        syncCalendarNotification.CopiedTousahecFacilitiesUsage = true;
                        break;
                    case "visitsAndTours":
                        syncCalendarNotification.CopiedTovisitsAndTours = true;
                        break;
                    case "symposiumAndConferences":
                        syncCalendarNotification.CopiedTosymposiumAndConferences = true;
                        break;
                    case "militaryFamilyAndSpouseProgram":
                        syncCalendarNotification.MFP = true;
                        break;
                    case "battlerhythm":
                        syncCalendarNotification.CopiedTobattlerhythm = true;
                        break;
                    case "staff":
                        syncCalendarNotification.CopiedTostaff = true;
                        break;
                    case "imc":
                        syncCalendarNotification.IMC = true;
                        break;
                    case "studentCalendar":
                        syncCalendarNotification.CopiedTostudentCalendar = true;
                        break;
                    case "studentcalendar":
                        syncCalendarNotification.CopiedTostudentCalendar = true;
                        break;
                    case "cio":
                        syncCalendarNotification.CopiedTocio = true;
                        break;
                    default:
                        throw new Exception($"Unknown route: {route}");
                }


                 _context.SyncToCalendarNotifications.Update(syncCalendarNotification);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to Create Sync Request Notification");
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
