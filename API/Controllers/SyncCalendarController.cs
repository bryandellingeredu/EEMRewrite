﻿
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Text;

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
            if (studentType == "DL24") studentType = "DEP2024";
            if (studentType == "dl24") studentType = "DEP2024";
            if (studentType == "DL25") studentType = "DEP2025";
            if (studentType == "dl25") studentType = "DEP2025";
            if (studentType == "DL26") studentType = "DEP2026";
            if (studentType == "dl26") studentType = "DEP2026";
            if (studentType == "DK24") studentType = "DEP2024";
            if (studentType == "dk24") studentType = "DEP2024";
            if (studentType == "DK25") studentType = "DEP2025";
            if (studentType == "dk25") studentType = "DEP2025";
            if (studentType == "DK26") studentType = "DEP2026";
            if (studentType == "dk26") studentType = "DEP2026";
            if (studentType == "Residnent") studentType = "Resident";
            if (studentType == "Calenda") studentType = "Resident";
            if (studentType == "DE2026") studentType = "DEP2026";
            SyncCalendar syncCalendar = await _context.SyncCalendars.FirstAsync(x => x.Route == studentType);
            Response.Headers.Append("Content-Type", "text/calendar");
            return File(Encoding.UTF8.GetBytes(syncCalendar.Text), "text/calendar", "calendar.ics");
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
