using Application.Calendars;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CalendarController : BaseApiController
    {
        [HttpPost("listBySearchParams/{id}")]
        public async Task<IActionResult> ListBySearchParams(CalendarTableSearchParams data, string Id) =>
       HandleResult(await Mediator.Send(new ListBySearchParams.Query { searchParams = data, Id = Id }));
        }
    }

