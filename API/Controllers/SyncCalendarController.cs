
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Text;
using System.Text.RegularExpressions;

namespace API.Controllers
{
    public class SyncCalendarController : BaseApiController
    {
        private readonly DataContext _context;

        public SyncCalendarController(DataContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("{route}/{studentType}")]
        public async Task<IActionResult> Get(string route, string studentType)
        {
            if (!string.IsNullOrEmpty(studentType))
            {
                // Use Regex to match "DLXX" or "DKXX" and convert to "DEP20XX"
                Match match = Regex.Match(studentType, @"^(DL|DK)(\d{2})$", RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    studentType = $"DEP20{match.Groups[2].Value}";
                }

                // Fix misspelled values
                if (studentType == "Residnent") studentType = "Resident";
                if (studentType == "Calenda") studentType = "Resident";
                if (studentType == "DE2026") studentType = "DEP2026";
            }
            SyncCalendar syncCalendar = await _context.SyncCalendars.FirstAsync(x => x.Route == studentType);
            Response.Headers.Append("Content-Type", "text/calendar");
            return File(Encoding.UTF8.GetBytes(syncCalendar.Text), "text/calendar", "calendar.ics");
        }

        private object GetFiscalYear(DateTime date, int offset)
        {
             int year = date.Year;
        bool isFiscalNextYear = date.Month >= 10; // October or later moves to next fiscal year

        return (year + (isFiscalNextYear ? 1 : 0) + offset).ToString();
        }

        [AllowAnonymous]
        [HttpGet("{route}")]
        public async Task<IActionResult> Get(string route)
        {  
            if(route.Trim().ToLower() == "studentcalendar")
            {
                SyncCalendar syncCalendar = await _context.SyncCalendars.FirstAsync(x => x.Route == "notastudent");
                Response.Headers.Append("Content-Type", "text/calendar");
                return File(Encoding.UTF8.GetBytes(syncCalendar.Text), "text/calendar", "calendar.ics");
            }
            else
            {
                SyncCalendar syncCalendar = await _context.SyncCalendars.FirstAsync(x => x.Route == route);
                Response.Headers.Append("Content-Type", "text/calendar");
                return File(Encoding.UTF8.GetBytes(syncCalendar.Text), "text/calendar", "calendar.ics");
            }
        }
    } 
}
