using Application.GraphSchedules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class RoomEvents : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetRoomEvents(string id)
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];  
            return HandleResult(await Mediator.Send(new EventsByRoom.Query { Id = id, Start = start, End = end }));
        }
         
    }
}
