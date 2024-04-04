
using Application.PocketCalendar;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class PocketCalendarController : BaseApiController
    {
        [HttpPost]
        public async Task<IActionResult> CreateActivity(PocketCalendarDTO pocketCalendarDTO) =>
        HandleResult(await Mediator.Send(new ReserveRoom.Command { PocketCalendarDTO = pocketCalendarDTO }));
    }
}
