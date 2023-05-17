using Application.LandingPage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Globalization;
using System.Threading.Tasks;

namespace API.Controllers
{
    public class LandingPageController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet("getEventsByDay/{day}")]
        public async Task<IActionResult> GetEventsByDay(string day)
        {
            try
            {
                DateTime date = DateTime.ParseExact(day, "MM-dd-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None);
                var result = await Mediator.Send(new ListByDay.Query { Day = date });
                return HandleResult(result);
            }
            catch (FormatException)
            {
                return BadRequest("Invalid date format. Please provide a date in the format 'MM-dd-yyyy'.");
            }
        }

        [AllowAnonymous]
        [HttpGet("getEvents")]
        public async Task<IActionResult> GetEventsForToday()
        {
     
                var result = await Mediator.Send(new ListByDay.Query { Day = DateTime.Now });
                return HandleResult(result);
            
         
        }
    }
}