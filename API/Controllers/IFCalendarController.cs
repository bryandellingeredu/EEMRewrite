
using Application.IFCalendar;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class IFCalendarController : BaseApiController
    {
        [HttpPost]
        public async Task<IActionResult> CreateActivity(IFAddEventRequest ifAddEventRequest) =>
        HandleResult(await Mediator.Send(new AddEvent.Command { IFAddEventRequest = ifAddEventRequest }));
    }
}
