using Application;
using Application.Activities;
using Application.GraphSchedules;
using Domain;
using Hangfire;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Persistence;
using System.Globalization;
using System.Text;

namespace API.BackgroundJobs
{
    public class BackgroundJobs
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;

        public BackgroundJobs(DataContext context, IConfiguration config)
        {
            _context = context;
            _config = config; 
        }

        [AutomaticRetry(Attempts = 0)] 
        public void CreateStudentCalendarFileJob()
        {
            CreateStudentCalendarFileAsync().GetAwaiter().GetResult();
        }

        [AutomaticRetry(Attempts = 0)] 
        public void CreateSyncCalendarFilesJob()
        {
            CreateSyncCalendarFilesAsync().GetAwaiter().GetResult();
        }

        [AutomaticRetry(Attempts = 0)] 
        public void CreateEnlistedAideSyncCalendarFileJob()
        {
            CreateEnlistedAideSyncCalendarFileAsync().GetAwaiter().GetResult();
        }

        [AutomaticRetry(Attempts = 0)]
        public void CreateRoomReportJob()
        {
            CreateRoomReportAsync().GetAwaiter().GetResult();
        }

        public async Task CreateEnlistedAideSyncCalendarFileAsync()
        {
            Settings s = new Settings();
            var settings = s.LoadSettings(_config);
            GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            var allrooms = await GraphHelper.GetRoomsAsync();

            DateTime startDateLimit = DateTime.UtcNow.AddMonths(-3);

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
            SyncCalendar existingSyncCalendar = _context.SyncCalendars.Where(x => x.Route == "enlistedAide").FirstOrDefault();
            if (existingSyncCalendar != null)
            {
                existingSyncCalendar.Text = writer.ToString();
                _context.SaveChanges();
            }
            else
            {
                SyncCalendar syncCalendar = new SyncCalendar();
                syncCalendar.Route = "enlistedAide";
                syncCalendar.Text = writer.ToString();
                _context.SyncCalendars.Add(syncCalendar);
                _context.SaveChanges();
            }
        }

        public async Task CreateSyncCalendarFilesAsync()
        {
            string[] routes = { "academic", "asep", "commandGroup", "community", "csl", "garrison",
            "internationalfellows", "generalInterest","holiday","pksoi", "socialEventsAndCeremonies",
            "usahec", "ssiAndUsawcPress", "ssl", "trainingAndMiscEvents", "usahecFacilitiesUsage",
            "visitsAndTours", "symposiumAndConferences", "militaryFamilyAndSpouseProgram", "spouse","battlerhythm",
            "staff", "imc", "cio", "exec"};

            Settings s = new Settings();
            var settings = s.LoadSettings(_config);
            GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            var allrooms = await GraphHelper.GetRoomsAsync();

            DateTime startDateLimit = DateTime.UtcNow.AddMonths(-3);

            foreach (string route in routes)
            {
                StringWriter writer = new StringWriter();
                writer.WriteLine("BEGIN:VCALENDAR");
                writer.WriteLine($"PRODID://{GetCalendarName(route)}//USAWC//EN");
                writer.WriteLine("VERSION:2.0");
                writer.WriteLine("METHOD:PUBLISH");
                writer.WriteLine($"X-WR-CALNAME:{GetCalendarName(route)}");
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
                var query = _context.Activities.AsQueryable();
                query = query.Where(a => a.Start > startDateLimit);
                query = query.Where(a => !a.LogicalDeleteInd);
                switch (route.Trim())
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
                    case "exec":
                        query = query.Where(a => a.CopiedToexec);
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
                      case "spouse":
                        query = query.Where(a => a.CopiedTospouse);
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
                    case "cio":
                        query = query.Where(a => a.CopiedTocio);
                        break;
                    default:
                        throw new Exception($"Unknown route: {route}");
                }

                var activities = await query
                    .OrderBy(a => a.Start)
                    .Take(2000)
                    .ToListAsync();

                List<StudentCalendarInfo> studentCalendarInfoList = new List<StudentCalendarInfo>();

                foreach (Activity activity in activities)
                {
                    string description = activity.Description;
                    description = description + $"---ACTION OFFICER---{activity.ActionOfficer} ({activity.ActionOfficerPhone})";
                    if (activity.CopiedTostudentCalendar || activity.CopiedTointernationalfellows)
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
                         if (!string.IsNullOrEmpty(activity.Hyperlink) && !string.IsNullOrEmpty(activity.HyperlinkDescription))
                    {
                        description = description + $"---HYPERLINK--- go to {activity.HyperlinkDescription} at {activity.Hyperlink} ";
                    }
                    if (!string.IsNullOrEmpty(activity.TeamLink) || !string.IsNullOrEmpty(activity.HyperlinkEDUTeams))
                    {
                        description = description + $"---EDU TEAM MEETING LINK--- {activity.TeamLink.CoalesceWhitespace(activity.HyperlinkEDUTeams)}";
                    }
                    if (!string.IsNullOrEmpty(activity.ArmyTeamLink))
                    {
                        description = description + $"---ARMY TEAM MEETING LINK--- {activity.ArmyTeamLink}";
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
                    WriteLineWithEllipsis(writer, $"LOCATION:{await GetLocation(
                        activity.EventLookup, activity.PrimaryLocation, activity.CoordinatorEmail, allrooms, activity.LastUpdatedBy, activity.CreatedBy,  activity.EventLookupCalendar, activity.EventLookupCalendarEmail)}");
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
                SyncCalendar existingSyncCalendar = _context.SyncCalendars.Where(x => x.Route == route).FirstOrDefault();
                if (existingSyncCalendar != null) {
                    existingSyncCalendar.Text = writer.ToString();
                    _context.SaveChanges();
                }
                else
                {
                    SyncCalendar syncCalendar = new SyncCalendar();
                    syncCalendar.Route = route;
                    syncCalendar.Text = writer.ToString();
                    _context.SyncCalendars.Add(syncCalendar);
                    _context.SaveChanges();
                }
            }
        }

        public async Task CreateStudentCalendarFileAsync()
        {
            DateTime startDateLimit = DateTime.UtcNow.AddMonths(-3);

            var query = _context.Activities.AsQueryable();
            query = query.Where(a => a.Start > startDateLimit);
            query = query.Where(a => !a.LogicalDeleteInd);
            query = query.Where(a => a.CopiedTostudentCalendar);

            var activities = await query
            .OrderBy(a => a.Start)
            .Take(2000)
            .ToListAsync();


            List<StudentCalendarInfo> studentCalendarInfoList = new List<StudentCalendarInfo>
                {
                    new StudentCalendarInfo{StudentType = "Resident", Color = "#006400", StudentCalendarResident = true, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false, StudentCalendarDistanceGroup4 = false},
                    new StudentCalendarInfo{StudentType = "DEP2024", Color = "#FF8C00", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = true, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false, StudentCalendarDistanceGroup4 = false},
                    new StudentCalendarInfo{StudentType = "DEP2025", Color = "#EE4B2B", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = true, StudentCalendarDistanceGroup3 = false, StudentCalendarDistanceGroup4 = false},
                    new StudentCalendarInfo{StudentType = "DEP2026", Color = "#800080", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = true, StudentCalendarDistanceGroup4 = false},
                    new StudentCalendarInfo{StudentType = "DEP2027", Color = "#B22222", StudentCalendarResident = false, StudentCalendarDistanceGroup1 = false, StudentCalendarDistanceGroup2 = false, StudentCalendarDistanceGroup3 = false, StudentCalendarDistanceGroup4 = true},
                };

            Settings s = new Settings();
            var settings = s.LoadSettings(_config);
            GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            var allrooms = await GraphHelper.GetRoomsAsync();

            string[] studentTypes = { "notastudent", "Resident", "DEP2024", "DEP2025", "DEP2026", "DEP2027" };

            foreach (var studentType in studentTypes) {
                StringWriter writer = new StringWriter();
                writer.WriteLine("BEGIN:VCALENDAR");
                writer.WriteLine($"PRODID://Student Calendar//USAWC//EN");
                writer.WriteLine("VERSION:2.0");
                writer.WriteLine("METHOD:PUBLISH");
                writer.WriteLine($"X-WR-CALNAME:Student Calendar");

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


                foreach (Activity activity in activities)
                {
                    foreach (var studentCalendarInfo in studentCalendarInfoList)
                    {
                        if (
                             (studentType == "notastudent" || studentType == "Resident") &&
                              studentCalendarInfo.StudentCalendarResident &&
                              (activity.StudentCalendarResident ||
                                (!activity.StudentCalendarDistanceGroup1 && !activity.StudentCalendarDistanceGroup2 && !activity.StudentCalendarDistanceGroup3 && activity.StudentCalendarDistanceGroup4 )
                              )
                            )
                        {
                            await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                        }
                        if ((studentType == "DL24" || studentType == "DEP2024" || studentType == "notastudent") && studentCalendarInfo.StudentCalendarDistanceGroup1 && activity.StudentCalendarDistanceGroup1) await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                        if ((studentType == "DL25" || studentType == "DEP2025" || studentType == "notastudent") && studentCalendarInfo.StudentCalendarDistanceGroup2 && activity.StudentCalendarDistanceGroup2) await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                        if ((studentType == "DL26" || studentType == "DEP2026"  ||studentType == "notastudent") && studentCalendarInfo.StudentCalendarDistanceGroup3 && activity.StudentCalendarDistanceGroup3) await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                        if ((studentType == "DL27" || studentType == "DEP2027"  ||studentType == "notastudent") && studentCalendarInfo.StudentCalendarDistanceGroup4 && activity.StudentCalendarDistanceGroup4) await WriteActivityDetails(writer, activity, studentCalendarInfo, studentType, allrooms);
                    }
                }
                writer.WriteLine("END:VCALENDAR");
                SyncCalendar existingSyncCalendar = _context.SyncCalendars.Where(x => x.Route == studentType).FirstOrDefault();
                if (existingSyncCalendar != null)
                {
                    existingSyncCalendar.Text = writer.ToString();
                    _context.SaveChanges();
                }
                else
                {
                    SyncCalendar syncCalendar = new SyncCalendar();
                    syncCalendar.Route = studentType;
                    syncCalendar.Text = writer.ToString();
                    _context.SyncCalendars.Add(syncCalendar);
                    _context.SaveChanges();
                }
            }
        }

        public async Task CreateRoomReportAsync()
        {
            Settings s = new Settings();
            var settings = s.LoadSettings(_config);
            GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            var allRooms = await GraphHelper.GetRoomsAsync();
            var rooms = allRooms.Where(r => r.AdditionalData.ContainsKey("building"));
            List<string> emails = rooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();

            TimeZoneInfo easternTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
            DateTime currentEasternTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.Local, easternTimeZone);

            var existingRoomReports = await _context.RoomReports.ToListAsync();

            for (int batch = 0; batch < 4; batch++)
            {
                List<Domain.RoomReport> roomReports = new List<Domain.RoomReport>();
                List<DateTimeTimeZone> startTimes = new List<DateTimeTimeZone>();
                List<DateTimeTimeZone> endTimes = new List<DateTimeTimeZone>();

                for (int i = 0; i < 100; i++)
                {
                    DateTime date = currentEasternTime.AddDays(batch * 100 + i);
                    DateTime startDateTime = new DateTime(date.Year, date.Month, date.Day, 8, 0, 0);
                    DateTime endDateTime = new DateTime(date.Year, date.Month, date.Day, 17, 00, 0);
                    string startDateAsString = startDateTime.ToString("o", CultureInfo.InvariantCulture);
                    string endDateAsString = endDateTime.ToString("o", CultureInfo.InvariantCulture);

                    startTimes.Add(new DateTimeTimeZone { DateTime = startDateAsString, TimeZone = "Eastern Standard Time" });
                    endTimes.Add(new DateTimeTimeZone { DateTime = endDateAsString, TimeZone = "Eastern Standard Time" });
                }

                List<ScheduleRequestDTO> scheduleRequests = new List<ScheduleRequestDTO>();

                for (int i = 0; i < startTimes.Count; i++)
                {
                    scheduleRequests.Add(new ScheduleRequestDTO
                    {
                        Schedules = emails,
                        StartTime = startTimes[i],
                        EndTime = endTimes[i],
                        AvailabilityViewInterval = 15
                    });
                }

                foreach (var scheduleRequestDTO in scheduleRequests)
                {
                    ICalendarGetScheduleCollectionPage result = await GraphHelper.GetScheduleAsync(scheduleRequestDTO);

                    foreach (ScheduleInformation scheduleInformation in result.CurrentPage)
                    {
                        Domain.RoomReport roomReport = new Domain.RoomReport
                        {
                            Day = new DateTime(currentEasternTime.Year, currentEasternTime.Month, currentEasternTime.Day, 0, 0, 0).AddDays(batch * 100 + scheduleRequests.IndexOf(scheduleRequestDTO)),
                            AvailabilityView = scheduleInformation.AvailabilityView,
                            ScheduleId = scheduleInformation.ScheduleId
                        };
                        roomReports.Add(roomReport);
                    }
                }

                var newRoomReports = new List<Domain.RoomReport>();
                var updatedRoomReports = new List<Domain.RoomReport>();

                foreach (var report in roomReports)
                {
                    var foundReport = existingRoomReports.FirstOrDefault(x => x.Day == report.Day && x.ScheduleId == report.ScheduleId);
                    if (foundReport != null)
                    {
                        if (foundReport.AvailabilityView != report.AvailabilityView)
                        {
                            foundReport.AvailabilityView = report.AvailabilityView;
                            updatedRoomReports.Add(foundReport);
                        }
                    }
                    else
                    {
                        newRoomReports.Add(report);
                    }
                }

                if (newRoomReports.Any())
                {
                    await _context.RoomReports.AddRangeAsync(newRoomReports);
                }

                if (updatedRoomReports.Any())
                {
                    _context.RoomReports.UpdateRange(updatedRoomReports);
                }

                await _context.SaveChangesAsync();
            }
        }

        private async Task WriteActivityDetails(StringWriter writer, Activity activity, StudentCalendarInfo studentCalendarInfo, string studentType, IGraphServicePlacesCollectionPage allrooms)
        {
            string description = activity.Description;
            if (studentType == "notastudent")
            {
                description = description + $"---STUDENT TYPE---{studentCalendarInfo.StudentType}";
            }
            description = description + $"---ACTION OFFICER---{activity.ActionOfficer} ({activity.ActionOfficerPhone})";
            if (
                (activity.StudentCalendarMandatory && activity.CopiedTointernationalfellows) ||
                (activity.StudentCalendarMandatory && studentCalendarInfo.StudentCalendarResident) ||
                (activity.StudentCalendarDistanceGroup1Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup1) ||
                (activity.StudentCalendarDistanceGroup2Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup2) ||
                (activity.StudentCalendarDistanceGroup3Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup3) ||
                (activity.StudentCalendarDistanceGroup4Mandatory && studentCalendarInfo.StudentCalendarDistanceGroup4)
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
            if (!string.IsNullOrEmpty(activity.Hyperlink) && !string.IsNullOrEmpty(activity.HyperlinkDescription))
            {
                description = description + $"---HYPERLINK--- go to {activity.HyperlinkDescription} at {activity.Hyperlink} ";
            }
            if (!string.IsNullOrEmpty(activity.TeamLink) || !string.IsNullOrEmpty(activity.HyperlinkEDUTeams))
            {
                description = description + $"---EDU TEAM MEETING LINK--- {activity.TeamLink.CoalesceWhitespace(activity.HyperlinkEDUTeams)}";
            }
            if (!string.IsNullOrEmpty(activity.ArmyTeamLink))
            {
                description = description + $"---ARMY TEAM MEETING LINK--- {activity.ArmyTeamLink}";
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
      
            WriteLineWithEllipsis(writer, $"LOCATION:{await GetLocation(
                activity.EventLookup, activity.PrimaryLocation, activity.CoordinatorEmail, allrooms,
                activity.LastUpdatedBy, activity.CreatedBy, activity.EventLookupCalendar, activity.EventLookupCalendarEmail)}");
            writer.WriteLine("SEQUENCE:0");
            WriteLineWithEllipsis(writer, $"SUMMARY:{activity.Title.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ")}");
            WriteLineWithEllipsis(writer, $"DESCRIPTION:{description.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ")}");
            writer.WriteLine("TRANSP:OPAQUE");
            writer.WriteLine($"UID:{activity.Id}");
            writer.WriteLine("X-MICROSOFT-CDO-BUSYSTATUS:BUSY");
            // Conditionally add Teams or EDU links as their own sections in the calendar
            if (!string.IsNullOrEmpty(activity.TeamLink) || !string.IsNullOrEmpty(activity.HyperlinkEDUTeams))
            {
                writer.WriteLine($"URL:{activity.TeamLink.CoalesceWhitespace(activity.HyperlinkEDUTeams)}");
            }
            if (!string.IsNullOrEmpty(activity.ArmyTeamLink))
            {
                writer.WriteLine($"URL:{activity.ArmyTeamLink}");
            }
            if (activity.Category != null)
            {
                writer.WriteLine($"CATEGORIES:{activity.Category}");
            }
            writer.WriteLine("END:VEVENT");

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

        private async Task<string> GetLocation(
            string eventLookup, string primaryLocation, string activityCoordinatorEmail, IGraphServicePlacesCollectionPage allrooms,
            string lastUpdatedBy , string createdBy , string eventCalendarId, string eventCalendarEmail)
        {
          
            string location = primaryLocation;

            if (string.IsNullOrEmpty(eventLookup))
            {
                return primaryLocation.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ");
            }

            Event evt;
            try
            {
                evt = await GraphHelper.GetEventAsync(activityCoordinatorEmail, eventLookup, lastUpdatedBy, createdBy, eventCalendarId, eventCalendarEmail);
           

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
        private string GetCalendarName(string route)
        {
            string retval;
            route = route.Trim();
            switch (route)
            {
                case "academic":
                    retval = "Academic Calendar";
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
                case "exec":
                    retval = "Executive Services Calendar";
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
                case "spouse":
                    retval = "Spouse";
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
    }
}