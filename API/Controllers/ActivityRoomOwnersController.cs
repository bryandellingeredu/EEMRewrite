
using Microsoft.AspNetCore.Mvc;
using Application.ActivityRoomOwners;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class ActivityRoomOwnersController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetActivityRoomOwners() => HandleResult(await Mediator.Send(new List.Query()));
    }
}
