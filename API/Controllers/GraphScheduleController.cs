using Application.GraphSchedules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class GraphScheduleController : BaseApiController
    {

        [HttpPost]
      public async Task<IActionResult> GetSchedules(ScheduleRequestDTO scheduleRequestDTO) =>
       HandleResult(await Mediator.Send(new List.Command { ScheduleRequestDTO = scheduleRequestDTO }));

        [HttpPost("checkforsetupteardownconflicts")]
        public async Task<IActionResult> CheckForSetUpTearDownConflicts(CheckForSetUpTearDownDoubleBookingDTO checkForSetUpTearDownDoubleBookingDTO) =>
       HandleResult(await Mediator.Send(new CheckForSetUpTearDownDoubleBooking.Query { CheckForSetUpTearDownDoubleBookingDTO = checkForSetUpTearDownDoubleBookingDTO }));

    }
}
