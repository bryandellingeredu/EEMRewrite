using Application;
using Application.Activities;
using Application.Core;
using Application.GraphSchedules;
using CsvHelper;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Graph;
using Persistence;
using System.Text;

namespace API.Controllers
{
    public class SyncCalendarController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;

        public SyncCalendarController(DataContext context, IConfiguration config, IMemoryCache cache)
        {
            _context = context;
            _config = config;
            _cache = cache;

        }

        [AllowAnonymous]
        [HttpGet("{route}/{studentType}")]
        public async Task<IActionResult> Get(string route, string studentType)
        {
            string cacheKey = $"{route}-{studentType}";
            if (_cache.TryGetValue(cacheKey, out string cachedData))
            {
                Response.Headers.Append("Content-Type", "text/calendar");
                return File(Encoding.UTF8.GetBytes(cachedData), "text/calendar", "calendar.ics");
            }

                Settings s = new Settings();
            var settings = s.LoadSettings(_config);
            GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            var allrooms = await GraphHelper.GetRoomsAsync();

            StringWriter writer = new StringWriter();
            writer.WriteLine("BEGIN:VCALENDAR");
            writer.WriteLine($"PRODID://{GetCalendarName(route)}//USAWC//EN");
            writer.WriteLine("VERSION:2.0");
            writer.WriteLine("METHOD:PUBLISH");
            writer.WriteLine($"X-WR-CALNAME:{GetCalendarName(route)}");

            // Add VTIMEZONE component
            writer.WriteLine("BEGIN:VTIMEZONE");
            writer.WriteLine("TZID:America/New_York");
            writer.WriteLine("BEGIN:STANDARD");
            writer.WriteLine("DTSTART:16010101T020000");
            writer.WriteLine("RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11");
            writer.WriteLine("TZOFFSETFROM:-0400");
            writer.WriteLine("TZOFFSETTO:-0500");
            writer.WriteLine("END:STANDARD");
            writer.WriteLine("BEGIN:DAYLIGHT");
            writer.WriteLine("DTSTART:16010101T020000");
            writer.WriteLine("RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3");
            writer.WriteLine("TZOFFSETFROM:-0500");
            writer.WriteLine("TZOFFSETTO:-0400");
            writer.WriteLine("END:DAYLIGHT");
            writer.WriteLine("END:VTIMEZONE");

            DateTime startDateLimit = DateTime.UtcNow.AddDays(-5);
            DateTime endDateLimit = DateTime.UtcNow.AddMonths(1);

            var query = _context.Activities.AsQueryable();
            query = query.Where(a => a.Start > startDateLimit);
            query = query.Where(a => !a.LogicalDeleteInd);
            query = query.Where(a => a.CopiedTostudentCalendar);

            var activities = await query
            .OrderBy(a => a.Start)
            .Take(100)
            .ToListAsync();

            List<StudentCalendarInfo> studentCalendarInfoList = new List<StudentCalendarInfo>
            {
                new StudentCalendarInfo{StudentType = "Resident", Color = "#006400", StudentCalendarResident = true, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false},
                new StudentCalendarInfo{StudentType = "DEP2024", Color = "#FF8C00", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = true, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false},
                new StudentCalendarInfo{StudentType = "DEP2025", Color = "#EE4B2B", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = true, StudentCalendarDistanceGroup3 = false},
                new StudentCalendarInfo{StudentType = "DEP2026", Color = "#800080", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = true},
            };

            foreach (Activity activity in activities)
            {
                foreach (var studentCalendarInfo in studentCalendarInfoList)
                {
                    if (
                         (studentType == "notastudent" || studentType == "Resident") &&
                          studentCalendarInfo.StudentCalendarResident && 
                          (activity.StudentCalendarResident  ||
                            (!activity.StudentCalendarDistanceGroup1 && !activity.StudentCalendarDistanceGroup2 && !activity.StudentCalendarDistanceGroup3)
                          )
                        )
                    {
                        await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                    }
                    if((studentType == "DL24" || studentType == "notastudent") && studentCalendarInfo.StudentCalendarDistanceGroup1 && activity.StudentCalendarDistanceGroup1) await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                    if((studentType == "DL25" || studentType == "notastudent") && studentCalendarInfo.StudentCalendarDistanceGroup2 && activity.StudentCalendarDistanceGroup2) await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                    if((studentType == "DL26" || studentType == "notastudent") && studentCalendarInfo.StudentCalendarDistanceGroup3 && activity.StudentCalendarDistanceGroup3) await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                }
            }
            writer.WriteLine("END:VCALENDAR");

            var cacheEntryOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(1));
            _cache.Set(cacheKey, writer.ToString(), cacheEntryOptions);
            cachedData = writer.ToString();

            //  return Ok(writer.ToString());
            Response.Headers.Append("Content-Type", "text/calendar");
            return File(Encoding.UTF8.GetBytes(writer.ToString()), "text/calendar", "calendar.ics");


        }

        private async Task WriteActivityDetails(StringWriter writer, Activity activity, StudentCalendarInfo studentCalendarInfo,  string studentType, IGraphServicePlacesCollectionPage allrooms)
        {
            string description = activity.Description;
            if(studentType == "notastudent")
            {
                description = description + $"---STUDENT TYPE---{studentCalendarInfo.StudentType}";
            }       
            description = description + $"---ACTION OFFICER---{activity.ActionOfficer} ({activity.ActionOfficerPhone})";
            if (!string.IsNullOrEmpty(activity.Hyperlink) && !string.IsNullOrEmpty(activity.HyperlinkDescription))
            {
                description = description + $"---HYPERLINK--- go to {activity.HyperlinkDescription} at {activity.Hyperlink} ";
            }
            if (!string.IsNullOrEmpty(activity.TeamLink))
            {
                description = description + $"---EDU TEAM MEETING LINK--- {activity.TeamLink}";
            }
            if (!string.IsNullOrEmpty(activity.ArmyTeamLink))
            {
                description = description + $"---ARMY TEAM MEETING LINK--- {activity.ArmyTeamLink}";
            }
            if ( 
                (activity.StudentCalendarMandatory && activity.CopiedTointernationalfellows) ||
                (activity.StudentCalendarMandatory && studentCalendarInfo.StudentCalendarResident) ||
                (activity.StudentCalendarDistanceGroup1Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup1) ||
                (activity.StudentCalendarDistanceGroup2Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup2) ||
                (activity.StudentCalendarDistanceGroup3Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup3)
               )             
            {
                description = description + $"---ATTENDANCE--- attendance is mandatory.";
            }
            if (!string.IsNullOrEmpty(activity.StudentCalendarUniform))
            {
                description = description + $"---UNIFORM--- {activity.StudentCalendarUniform}";
            }
            if (!string.IsNullOrEmpty(activity.StudentCalendarPresenter))
            {
                description = description + $"---PRESENTER--- {activity.StudentCalendarPresenter}";
            }
            if (!string.IsNullOrEmpty(activity.StudentCalendarNotes))
            {
                description = description + $"---NOTES--- {activity.StudentCalendarNotes}";
            }
            writer.WriteLine("BEGIN:VEVENT");
            writer.WriteLine($"DTSTAMP:{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}");
            if (activity.AllDayEvent)
            {
                writer.WriteLine($"DTSTART;VALUE=DATE:{activity.Start.ToString("yyyyMMdd")}");
                writer.WriteLine($"DTEND;VALUE=DATE:{activity.End.AddDays(1).ToString("yyyyMMdd")}");
            }
            else
            {
                writer.WriteLine($"DTSTART;TZID=America/New_York:{activity.Start.ToString("yyyyMMddTHHmmss")}");
                writer.WriteLine($"DTEND;TZID=America/New_York:{activity.End.ToString("yyyyMMddTHHmmss")}");
            }
            WriteLineWithEllipsis(writer, $"LOCATION:{await GetLocation(activity.EventLookup, activity.PrimaryLocation, activity.CoordinatorEmail, allrooms)}");
            writer.WriteLine("SEQUENCE:0");
            WriteLineWithEllipsis(writer, $"SUMMARY:{activity.Title.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ")}");
            WriteLineWithEllipsis(writer, $"DESCRIPTION:{description.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ")}");
            writer.WriteLine("TRANSP:OPAQUE");
            writer.WriteLine($"UID:{activity.Id}");
            writer.WriteLine("X-MICROSOFT-CDO-BUSYSTATUS:BUSY");
            if (activity.Category != null)
            {
                writer.WriteLine($"CATEGORIES:{activity.Category}");
            }
            writer.WriteLine("END:VEVENT");

        }

        [AllowAnonymous]
        [HttpGet("{route}")]
        public async Task<IActionResult> Get(string route)
        {
            string cacheKey2 = $"{route}";
            if (_cache.TryGetValue(cacheKey2, out string cachedData2))
            {
                Response.Headers.Append("Content-Type", "text/calendar");
                return File(Encoding.UTF8.GetBytes(cachedData2), "text/calendar", "calendar.ics");
            }
            if (route != "enlistedAide")
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                var allrooms = await GraphHelper.GetRoomsAsync();

                StringWriter writer = new StringWriter();
                writer.WriteLine("BEGIN:VCALENDAR");
                writer.WriteLine($"PRODID://{GetCalendarName(route)}//USAWC//EN");
                writer.WriteLine("VERSION:2.0");
                writer.WriteLine("METHOD:PUBLISH");
                writer.WriteLine($"X-WR-CALNAME:{GetCalendarName(route)}");

                // Add VTIMEZONE component
                writer.WriteLine("BEGIN:VTIMEZONE");
                writer.WriteLine("TZID:America/New_York");
                writer.WriteLine("BEGIN:STANDARD");
                writer.WriteLine("DTSTART:16010101T020000");
                writer.WriteLine("RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11");
                writer.WriteLine("TZOFFSETFROM:-0400");
                writer.WriteLine("TZOFFSETTO:-0500");
                writer.WriteLine("END:STANDARD");
                writer.WriteLine("BEGIN:DAYLIGHT");
                writer.WriteLine("DTSTART:16010101T020000");
                writer.WriteLine("RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3");
                writer.WriteLine("TZOFFSETFROM:-0500");
                writer.WriteLine("TZOFFSETTO:-0400");
                writer.WriteLine("END:DAYLIGHT");
                writer.WriteLine("END:VTIMEZONE");

                DateTime startDateLimit = DateTime.UtcNow.AddDays(-5);
                DateTime endDateLimit = DateTime.UtcNow.AddMonths(1);



                var query = _context.Activities.AsQueryable();
                //     query = query.Where(a => a.Start > startDateLimit && a.End < endDateLimit);
                query = query.Where(a => a.Start > startDateLimit);
                query = query.Where(a => !a.LogicalDeleteInd);
                route = route.Trim();
                switch (route)
                {
                    case "academic":
                        query = query.Where(a => a.CopiedToacademic);
                        break;
                    case "asep":
                        query = query.Where(a => a.CopiedToasep);
                        break;
                    case "commandGroup":
                        query = query.Where(a => a.CopiedTocommandGroup);
                        break;
                    case "community":
                        query = query.Where(a => a.CopiedTocommunity);
                        break;
                    case "csl":
                        query = query.Where(a => a.CopiedTocsl);
                        break;
                    case "garrison":
                        query = query.Where(a => a.CopiedTogarrison);
                        break;
                     case "internationalfellows":
                        query = query.Where(a => a.CopiedTointernationalfellows);
                        break;
                    case "generalInterest":
                        query = query.Where(a => a.CopiedTogeneralInterest);
                        break;
                    case "holiday":
                        query = query.Where(a => a.CopiedToholiday);
                        break;
                    case "pksoi":
                        query = query.Where(a => a.CopiedTopksoi);
                        break;
                    case "socialEventsAndCeremonies":
                        query = query.Where(a => a.CopiedTosocialEventsAndCeremonies);
                        break;
                    case "usahec":
                        query = query.Where(a => a.CopiedTousahec);
                        break;
                    case "ssiAndUsawcPress":
                        query = query.Where(a => a.CopiedTossiAndUsawcPress);
                        break;
                    case "ssl":
                        query = query.Where(a => a.CopiedTossl);
                        break;
                    case "trainingAndMiscEvents":
                        query = query.Where(a => a.CopiedTotrainingAndMiscEvents);
                        break;
                    case "usahecFacilitiesUsage":
                        query = query.Where(a => a.CopiedTousahecFacilitiesUsage);
                        break;
                    case "visitsAndTours":
                        query = query.Where(a => a.CopiedTovisitsAndTours);
                        break;
                    case "symposiumAndConferences":
                        query = query.Where(a => a.CopiedTosymposiumAndConferences);
                        break;
                    case "militaryFamilyAndSpouseProgram":
                        query = query.Where(a => a.MFP);
                        break;
                    case "battlerhythm":
                        query = query.Where(a => a.CopiedTobattlerhythm);
                        break;
                    case "staff":
                        query = query.Where(a => a.CopiedTostaff);
                        break;
                    case "imc":
                        query = query.Where(a => a.IMC);
                        break;
                    case "studentCalendar":
                        query = query.Where(a => a.CopiedTostudentCalendar);
                        break;
                    case "studentcalendar":
                        query = query.Where(a => a.CopiedTostudentCalendar);
                        break;
                     case "cio":
                        query = query.Where(a => a.CopiedTocio);
                        break;
                    default:
                         throw new Exception($"Unknown route: {route}");
                }


                //  var activities = await query.ToListAsync();

                var activities = await query
        .OrderBy(a => a.Start)
        .Take(100)
        .ToListAsync();

                List<StudentCalendarInfo> studentCalendarInfoList = new List<StudentCalendarInfo>();

                foreach (Activity activity in activities)
                {
                    string description = activity.Description;
                    description = description + $"---ACTION OFFICER---{activity.ActionOfficer} ({activity.ActionOfficerPhone})";
                    if (!string.IsNullOrEmpty(activity.Hyperlink) && !string.IsNullOrEmpty(activity.HyperlinkDescription))
                    {
                        description = description + $"---HYPERLINK--- go to {activity.HyperlinkDescription} at {activity.Hyperlink} ";
                    }
                    if (!string.IsNullOrEmpty(activity.TeamLink))
                    {
                        description = description + $"---EDU TEAM MEETING LINK--- {activity.TeamLink}";
                    }
                    if (!string.IsNullOrEmpty(activity.ArmyTeamLink))
                    {
                        description = description + $"---ARMY TEAM MEETING LINK--- {activity.ArmyTeamLink}";
                    }

                    if (activity.CopiedTostudentCalendar && (route == "studentCalendar" || route == "studentcalendar"))
                    {
                        if (activity.StudentCalendarMandatory)
                        {
                            description = description + $"---ATTENDANCE--- attendance is mandatory.";
                        }
                        if (!string.IsNullOrEmpty(activity.StudentCalendarUniform))
                        {
                            description = description + $"---UNIFORM--- {activity.StudentCalendarUniform}";
                        }
                        if (!string.IsNullOrEmpty(activity.StudentCalendarPresenter))
                        {
                            description = description + $"---PRESENTER--- {activity.StudentCalendarPresenter}";
                        }
                        if (!string.IsNullOrEmpty(activity.StudentCalendarNotes))
                        {
                            description = description + $"---NOTES--- {activity.StudentCalendarNotes}";
                        }
                    }
                    writer.WriteLine("BEGIN:VEVENT");
                    writer.WriteLine($"DTSTAMP:{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}");
                    if (activity.AllDayEvent)
                    {
                        writer.WriteLine($"DTSTART;VALUE=DATE:{activity.Start.ToString("yyyyMMdd")}");
                        writer.WriteLine($"DTEND;VALUE=DATE:{activity.End.AddDays(1).ToString("yyyyMMdd")}");
                    }
                    else
                    {
                        writer.WriteLine($"DTSTART;TZID=America/New_York:{activity.Start.ToString("yyyyMMddTHHmmss")}");
                        writer.WriteLine($"DTEND;TZID=America/New_York:{activity.End.ToString("yyyyMMddTHHmmss")}");
                    }
                    WriteLineWithEllipsis(writer, $"LOCATION:{await GetLocation(activity.EventLookup, activity.PrimaryLocation, activity.CoordinatorEmail, allrooms)}");
                    writer.WriteLine("SEQUENCE:0");
                    WriteLineWithEllipsis(writer, $"SUMMARY:{activity.Title.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ")}");
                    WriteLineWithEllipsis(writer, $"DESCRIPTION:{description.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ")}");
                    writer.WriteLine("TRANSP:OPAQUE");
                    writer.WriteLine($"UID:{activity.Id}");
                    writer.WriteLine("X-MICROSOFT-CDO-BUSYSTATUS:BUSY");
                    if (activity.Category != null)
                    {
                        writer.WriteLine($"CATEGORIES:{activity.Category}");
                    }
                    writer.WriteLine("END:VEVENT");
                }

                writer.WriteLine("END:VCALENDAR");

                //  return Ok(writer.ToString());
                var cacheEntryOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(1));
                _cache.Set(cacheKey2, writer.ToString(), cacheEntryOptions);
                cachedData2 = writer.ToString();

                Response.Headers.Append("Content-Type", "text/calendar");
                return File(Encoding.UTF8.GetBytes(writer.ToString()), "text/calendar", "calendar.ics");
            }
            else
            {
                var checklists = await _context.EnlistedAideCheckLists.Include(x => x.Activity)
                  .Where(x => !x.Activity.LogicalDeleteInd)
                  .ToListAsync();

                List<FullCalendarEventDTO> fullCalendarEventDTOs = new List<FullCalendarEventDTO>();

                foreach (var checkList in checklists)
                {
                    fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Event", checkList.Activity.AllDayEvent, checkList.Activity.Start, checkList.Activity.End));
                    if (checkList.AlcoholEstimate)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Alcohol Estimate", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                            checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PrepareLegalReview)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                            checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PreparePRAForm)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare PR&A Form With Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                             checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PrepareGuestList)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare Guest List With Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                               checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.Prepare4843GuestList)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Prepare 4843 Guest List With Legal Review", true,
                            checkList.Activity.Start.Date.AddDays(-28),
                             checkList.Activity.Start.Date.AddDays(-28)
                            ));
                    }
                    if (checkList.PrepareMenu)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Menu Preparation", true,
                            checkList.Activity.Start.Date.AddDays(-21),
                                checkList.Activity.Start.Date.AddDays(-21)
                            ));
                    }
                    if (checkList.SendToLegalForApproval)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Submit Legal Review For Approval", true,
                            checkList.Activity.Start.Date.AddDays(-21),
                             checkList.Activity.Start.Date.AddDays(-21)
                            ));
                    }
                    if (checkList.MenuReviewedByPrincipal)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Menu Reviewed By Principal", true,
                            checkList.Activity.Start.Date.AddDays(-14),
                              checkList.Activity.Start.Date.AddDays(-14)
                            ));
                    }
                    if (checkList.OrderAlcohol)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Order Alcohol", true,
                            checkList.Activity.Start.Date.AddDays(-14),
                              checkList.Activity.Start.Date.AddDays(-14)
                            ));
                    }
                    if (checkList.GFEBS)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "GFEBS (upon Legal Review document approval)", true,
                            checkList.Activity.Start.Date.AddDays(-14),
                              checkList.Activity.Start.Date.AddDays(-14)
                            ));
                    }
                    if (checkList.GatherIce)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Gather ICE", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.HighTopsAndTables)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "High Tops and Tables", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.SweepAndMop)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Sweep and Mop", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.PolishSilver)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Polish Silver", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.CleanCutlery)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Clean Cutlery", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.CleanPlates)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Clean Plates", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.CleanServiceItems)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Clean Service Items", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.NapkinsPressed)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Napkins Pressed", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.NapkinsRolled)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Napkins Rolled", true,
                            checkList.Activity.Start.Date.AddDays(-7),
                              checkList.Activity.Start.Date.AddDays(-7)
                            ));
                    }
                    if (checkList.FoodShopping)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Food Shopping", true,
                            checkList.Activity.Start.Date.AddDays(-2),
                              checkList.Activity.Start.Date.AddDays(-2)
                            ));
                    }
                    if (checkList.FoodPrep)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Food Prep", true,
                            checkList.Activity.Start.Date.AddDays(-2),
                              checkList.Activity.Start.Date.AddDays(-2)
                            ));
                    }
                    if (checkList.TentSetUp)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Tent Set Up", true,
                            checkList.Activity.Start.Date.AddDays(-2),
                              checkList.Activity.Start.Date.AddDays(-2)
                            ));
                    }
                    if (checkList.Dust)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Dust", true,
                            checkList.Activity.Start.Date.AddDays(-1),
                              checkList.Activity.Start.Date.AddDays(-1)
                            ));
                    }
                    if (checkList.Cook)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Cook", true,
                            checkList.Activity.Start.Date.AddDays(-0),
                              checkList.Activity.Start.Date.AddDays(-0)
                            ));
                    }
                    if (checkList.Coffee)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Coffee", false,
                            checkList.Activity.Start.AddHours(-1),
                              checkList.Activity.Start
                            ));
                    }
                    if (checkList.IceBeverages)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Ice Beverages", false,
                            checkList.Activity.Start.AddHours(-1),
                              checkList.Activity.Start
                            ));
                    }
                    if (checkList.Sterno)
                    {
                        fullCalendarEventDTOs.Add(CreateFullCalendarEventDTO(checkList, "Sterno", false,
                            checkList.Activity.Start.AddMinutes(-30),
                              checkList.Activity.Start
                            ));
                    }
                }

                StringWriter writer = new StringWriter();
                writer.WriteLine("BEGIN:VCALENDAR");
                writer.WriteLine($"PRODID://ENLISTEDAIDE//USAWC//EN");
                writer.WriteLine("VERSION:2.0");
                writer.WriteLine("METHOD:PUBLISH");
                writer.WriteLine($"X-WR-CALNAME:ENLISTEDAIDE");

                // Add VTIMEZONE component
                writer.WriteLine("BEGIN:VTIMEZONE");
                writer.WriteLine("TZID:America/New_York");
                writer.WriteLine("BEGIN:STANDARD");
                writer.WriteLine("DTSTART:16010101T020000");
                writer.WriteLine("RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11");
                writer.WriteLine("TZOFFSETFROM:-0400");
                writer.WriteLine("TZOFFSETTO:-0500");
                writer.WriteLine("END:STANDARD");
                writer.WriteLine("BEGIN:DAYLIGHT");
                writer.WriteLine("DTSTART:16010101T020000");
                writer.WriteLine("RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3");
                writer.WriteLine("TZOFFSETFROM:-0500");
                writer.WriteLine("TZOFFSETTO:-0400");
                writer.WriteLine("END:DAYLIGHT");
                writer.WriteLine("END:VTIMEZONE");

            
                foreach (var item in fullCalendarEventDTOs)
                {
                    string location = "USAWC";
                    if (!string.IsNullOrEmpty(item.EnlistedAideVenue)) location = item.EnlistedAideVenue;
                    string description = string.Empty;
                    if (!string.IsNullOrEmpty(item.EnlistedAideFundingType)) description = description + $"---FUNDING TYPE--- {item.EnlistedAideFundingType} ";
                    if (!string.IsNullOrEmpty(item.EnlistedAideGuestCount)) description = description + $"---GUEST COUNT--- {item.EnlistedAideGuestCount} ";
                    if (!string.IsNullOrEmpty(item.EnlistedAideCooking)) description = description + $"---COOKING--- {item.EnlistedAideCooking} ";
                    if (!string.IsNullOrEmpty(item.EnlistedAideDietaryRestrictions)) description = description + $"---DIETARY RESTRICTIONS--- {item.EnlistedAideDietaryRestrictions} ";
                    if (!string.IsNullOrEmpty(item.EnlistedAideAlcohol)) description = description + $"---ALCOHOL--- {item.EnlistedAideAlcohol} ";
                    if (!string.IsNullOrEmpty(item.EnlistedAideNumOfBartenders)) description = description + $"---NUMBER OF BARTENDERS--- {item.EnlistedAideNumOfBartenders} ";
                    if (!string.IsNullOrEmpty(item.EnlistedAideNumOfServers)) description = description + $"---NUMBER OF SERVERS--- {item.EnlistedAideNumOfServers} ";
                    if (!string.IsNullOrEmpty(item.EnlistedAideSupportNeeded)) description = description + $"---ADDITIONAL SUPPORT--- {item.EnlistedAideSupportNeeded} ";

                    writer.WriteLine("BEGIN:VEVENT");
                    writer.WriteLine($"DTSTAMP:{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}");
                    if (item.AllDay)
                    {
                        writer.WriteLine($"DTSTART;VALUE=DATE:{item.StartForICS}");
                        writer.WriteLine($"DTEND;VALUE=DATE:{item.EndForICS}");
                    }
                    else
                    {
                        writer.WriteLine($"DTSTART;TZID=America/New_York:{item.StartForICS}");
                        writer.WriteLine($"DTEND;TZID=America/New_York:{item.EndForICS}");
                    }
                    WriteLineWithEllipsis(writer, $"LOCATION:{location}");
                    writer.WriteLine("SEQUENCE:0");
                    WriteLineWithEllipsis(writer, $"SUMMARY:{item.Task}");
                    writer.WriteLine("TRANSP:OPAQUE");
                    writer.WriteLine($"UID:{Guid.NewGuid()}");
                    writer.WriteLine("X-MICROSOFT-CDO-BUSYSTATUS:BUSY");
                    writer.WriteLine("END:VEVENT");
                }
                writer.WriteLine("END:VCALENDAR");

                //  return Ok(writer.ToString());
                var cacheEntryOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(1));
                _cache.Set(cacheKey2, writer.ToString(), cacheEntryOptions);
                cachedData2 = writer.ToString();

                Response.Headers.Append("Content-Type", "text/calendar");
                return File(Encoding.UTF8.GetBytes(writer.ToString()), "text/calendar", "calendar.ics");
            }
        }

        private FullCalendarEventDTO CreateFullCalendarEventDTO(Domain.EnlistedAideCheckList checkList, string task, bool allDayEvent, DateTime start, DateTime end)
        {
            DateTime endDateForCalendar = allDayEvent ? end.AddDays(1) : end;
            return new FullCalendarEventDTO
            {
                Id = checkList.Id.ToString(),
                CategoryId = checkList.Activity.CategoryId.ToString(),
                ActivityId = checkList.Activity.Id.ToString(),
                Title = $"{task}  ( {checkList.Activity.Title} )",
                Start = Helper.GetStringFromDateTime(start, allDayEvent),
                End = Helper.GetStringFromDateTime(endDateForCalendar, allDayEvent),
                StartForICS = allDayEvent ? start.ToString("yyyyMMdd") : start.ToString("yyyyMMddTHHmmss"),
                EndForICS = allDayEvent ? endDateForCalendar.ToString("yyyyMMdd") : endDateForCalendar.ToString("yyyyMMddTHHmmss"),
                AllDay = allDayEvent,
                ActionOfficer = checkList.Activity.ActionOfficer,
                ActionOfficerPhone = checkList.Activity.ActionOfficerPhone,
                EventTitle = checkList.Activity.Title,
                Task = task,
                EnlistedAideFundingType = checkList.Activity.EnlistedAideFundingType,
                EnlistedAideVenue = checkList.Activity.EnlistedAideVenue,
                EnlistedAideGuestCount = checkList.Activity.EnlistedAideGuestCount,
                EnlistedAideCooking = checkList.Activity.EnlistedAideCooking,
                EnlistedAideDietaryRestrictions = checkList.Activity.EnlistedAideDietaryRestrictions,
                EnlistedAideAlcohol = checkList.Activity.EnlistedAideAlcohol,
                EnlistedAideNumOfBartenders = checkList.Activity.EnlistedAideNumOfBartenders,
                EnlistedAideNumOfServers = checkList.Activity.EnlistedAideNumOfServers,
                EnlistedAideSupportNeeded = checkList.Activity.EnlistedAideSupportNeeded
            };
        }

        private string GetCalendarName(string route)
        {
            string retval;
            route = route.Trim();
            switch (route)
            {
                case "academic":
                    retval =  "Academic Calendar";
                    break;
                case "asep":
                    retval = "ASEP Calendar";
                    break;
                case "commandGroup":
                    retval = "Command Group Calendar";
                    break;
                case "community":
                    retval = "Community Calendar";
                    break;
                case "csl":
                    retval = "CSL Calendar";
                    break;
                case "garrison":
                    retval = "Garrison Calendar";
                    break;
                   case "internationalfellows":
                    retval = "International Fellows";
                    break;
                case "generalInterest":
                    retval = "General Interest";
                    break;
                case "holiday":
                    retval = "Holiday Calendar";
                    break;
                case "pksoi":
                    retval = "PKSOI Calendar";
                    break;
                case "socialEventsAndCeremonies":
                    retval = "Social Events And Ceremonies";
                    break;
                case "usahec":
                    retval = "USAHEC Calendar";
                    break;
                case "ssiAndUsawcPress":
                    retval = "SSI And USAWC Press Calendar";
                    break;
                case "ssl":
                    retval = "SSL Calendar";
                    break;
                case "trainingAndMiscEvents":
                    retval = "Training Calendar";
                    break;
                case "usahecFacilitiesUsage":
                    retval = "USAHEC Facilities Usage Calendar";
                    break;
                case "visitsAndTours":
                    retval = "Visits And Tours";
                    break;
                case "symposiumAndConferences":
                    retval = "Symposium and Conferences Calendar";
                    break;
                case "militaryFamilyAndSpouseProgram":
                    retval = "Military Spouse and Family Program";
                    break;
                case "battlerhythm":
                    retval = "Battle Rhythm Calendar";
                    break;
                case "staff":
                    retval = "Staff Calendar";
                    break;
                case "imc":
                    retval = "Integrated Master Calendar (IMC)";
                    break;
                case "studentCalendar":
                    retval = "Student Calendar";
                    break;
                case "studentcalendar":
                    retval = "Student Calendar";
                    break;
                case "cio":
                    retval = "CIO Event Planning Calendar";
                    break;
                default:
                    retval = "Unknown";
                    break;
            }

            return retval;
        }

        private async Task<string> GetLocation(string eventLookup, string primaryLocation, string activityCoordinatorEmail,  IGraphServicePlacesCollectionPage allrooms)
        {
            string coordinatorEmail = activityCoordinatorEmail.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? activityCoordinatorEmail : GraphHelper.GetEEMServiceAccount();
            string location = primaryLocation;

            if (string.IsNullOrEmpty(eventLookup))
            {
                return primaryLocation.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ");
            }

            Event evt;
            try
            {
                evt = await GraphHelper.GetEventAsync(coordinatorEmail, eventLookup);
            }
            catch (Exception)
            {
                evt = new Event();

                return primaryLocation.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ");
            }

            List<string> rooms = new List<string>();
            if (evt != null && evt.Attendees != null)
            {
                foreach (var item in evt.Attendees)
                {
                    var room = allrooms.FirstOrDefault(x => x.AdditionalData["emailAddress"].ToString() == item.EmailAddress.Address);
                    if (room != null && !string.IsNullOrEmpty(room.DisplayName))
                    {
                        rooms.Add(room.DisplayName);
                    }
                }
            }

            if (rooms.Any())
            {
                location = string.Join(", ", rooms);
            }

            return location.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ");
        }

        private void WriteLineWithEllipsis(StringWriter writer, string line)
        {
            const int maxLineLength = 70; // 70 to be safe
            var currentLine = new StringBuilder();

            foreach (var c in line)
            {
                var escaped = c switch
                {
                    '\\' => "\\\\",
                    ';' => "\\;",
                    ',' => "\\,",
                    '\n' => "\\n",
                    '\r' => "\\r",
                    _ => c.ToString()
                };

                if (Encoding.UTF8.GetByteCount(currentLine.ToString() + escaped) > maxLineLength)
                {
                    writer.Write(currentLine.ToString() + "\r\n ");
                    currentLine.Clear();
                }

                currentLine.Append(escaped);
            }

            if (currentLine.Length > 0)
            {
                writer.WriteLine(currentLine.ToString());
            }
        }
    } 
}
