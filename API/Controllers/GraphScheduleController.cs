using Application.GraphSchedules;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class GraphScheduleController : BaseApiController
    {

        [HttpPost]
      public async Task<IActionResult> GetSchedules(ScheduleRequestDTO scheduleRequestDTO) =>
       HandleResult(await Mediator.Send(new List.Command { ScheduleRequestDTO = scheduleRequestDTO }));
    }
}
