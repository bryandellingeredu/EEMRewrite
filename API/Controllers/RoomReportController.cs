using Application.RoomReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class RoomReportController : BaseApiController
    {
      

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> GetReport([FromBody] RoomReportRequestDTO request)
        {
            return HandleResult(await Mediator.Send(new Details.Query { roomReportRequestDto = request }));
        }
    }
}
