using Application;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Persistence;

namespace API.Controllers
{
    public class SyncCalendarController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;

        public SyncCalendarController(DataContext context, IConfiguration config)
        {
            _context = context;
            _config = config;

        } 

        [AllowAnonymous]
        [HttpGet("{route}")]
        public async Task<IActionResult> Get(string route)
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

            DateTime startDateLimit = DateTime.UtcNow.AddMonths(-1);
            DateTime endDateLimit = DateTime.UtcNow.AddMonths(1);



            var query = _context.Activities.AsQueryable();
            query = query.Where(a => a.Start > startDateLimit && a.End < endDateLimit);
            query = query.Where(a => !a.LogicalDeleteInd);

            switch (route)
            {
                case "academic":
                    query = query.Where(a => a.CopiedToacademic);
                    break;
                case "asep":
                    query = query.Where(a => a.CopiedToasep);
                    break;
                case "commandGroup":
                    query = query.Where(a => a.CopiedToasep);
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
                default:
                    throw new Exception($"Unknown route: {route}");
            }


            var activities = await query.ToListAsync();
            foreach (Activity activity in activities)
            {
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
                WriteLineWithEllipsis(writer, $"DESCRIPTION:{activity.Description.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ")}");
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

            return Ok(writer.ToString());
        }

        private string GetCalendarName(string route)
        {
            string retval;
            switch (route)
            {
                default:
                    throw new Exception($"Unknown route: {route}");
                case "academic":
                    retval =  "Academic Calendar";
                    break;
                case "asep":
                    retval = "ASEP Calendar";
                    break;
                case "commandGroup":
                    retval = "ASEP Calendar";
                    break;
                case "community":
                    retval = "Command Group Calendar";
                    break;
                case "csl":
                    retval = "CSL Calendar";
                    break;
                case "garrison":
                    retval = "Garrison Calendar";
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
                    retval = "Military Family and Spouse Program";
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
            if (line.Length > 75)
            {
                line = line.Substring(0, 72) + "...";
            }
            writer.WriteLine(line);
        }
    } 
}
