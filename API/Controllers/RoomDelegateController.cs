using Application.RoomDelegates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
     public class RoomDelegateController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetCategories() =>
      HandleResult(await Mediator.Send(new List.Query()));
    }
}