using Application.RoomDelegates;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
     public class RoomDelegateController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetRoomDelegates() =>
      HandleResult(await Mediator.Send(new List.Query()));

       [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Post(RoomDelegate roomDelegate) =>
         HandleResult(await Mediator.Send(new Post.Command { RoomDelegate = roomDelegate }));


        [HttpPost("requestchanges")]
        public async Task<IActionResult> RequestRoomDelegateChanges(RoomDelegate[] roomDelegates) =>
   HandleResult(await Mediator.Send(new RequestChanges.Command { RoomDelegates = roomDelegates }));

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<Activity>> DeleteRoomDelegate(Guid id) =>
          HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
    }
}