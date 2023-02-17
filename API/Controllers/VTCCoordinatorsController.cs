using Application.VTCCoordinators;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
     public class VTCCoordinatorsController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetVTCCoordinators() =>
      HandleResult(await Mediator.Send(new List.Query()));

       [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Post(RoomVTCCoordinator roomVTCCoordinator) =>
         HandleResult(await Mediator.Send(new Post.Command { RoomVTCCoordinator= roomVTCCoordinator }));

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<Activity>> DeleteVTCCoordinator(Guid id) =>
          HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
    }
}