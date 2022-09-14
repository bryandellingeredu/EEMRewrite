using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class GraphRoomsController : BaseApiController
    {
        [HttpGet]
         public async Task<IActionResult> GetGraphRooms() => HandleResult(await Mediator.Send(new Application.GraphRooms.List.Query()));
    }
}
