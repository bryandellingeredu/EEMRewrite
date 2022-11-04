
using Microsoft.AspNetCore.Mvc;
using Application.ActivityRoomOwners;
namespace API.Controllers
{
    public class ActivityRoomOwnersController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetActivityRoomOwners() => HandleResult(await Mediator.Send(new List.Query()));
    }
}
