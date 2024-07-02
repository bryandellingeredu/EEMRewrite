using Application.RoomReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class RoomReportController : BaseApiController
    {
      


        [HttpPost]
        public async Task<IActionResult> GetReport([FromBody] RoomReportRequestDTO request)
        {
            return HandleResult(await Mediator.Send(new Details.Query { roomReportRequestDto = request }));
        }

        [HttpPost("getEvents")]
        public async Task<IActionResult> GetEvents([FromBody] RoomReportEventsRequestDTO request)
        {
            return HandleResult(await Mediator.Send(new Events.Query { roomReportEventsRequestDto = request }));
        }
    }
}
