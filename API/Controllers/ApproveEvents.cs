using Application.Activities;
using Application.ApproveEvent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ApproveEvents : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetActivity(string id) =>
         HandleResult(await Mediator.Send(new GetPlace.Query { Id = id }));

        [HttpPost("changestatus")]
        public async Task<ActionResult> ChangeStatus(ChangeRoomStatusDTO changeRoomStatusDTO) =>
                HandleResult(await Mediator.Send(new ChangeRoomStatus.Command { ChangeRoomStatusDTO = changeRoomStatusDTO }));
    }
}
