
using Application.Teams;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers

{
    public class TeamsController : BaseApiController
    {
        [HttpPost("delete")]
        public async Task<IActionResult> Delete([FromBody] TeamDeleteRequestDTO request) =>
               HandleResult(await Mediator.Send(new Delete.Command { TeamDeleteRequestDTO = request }));

        [HttpPost("attendees")]
        public async Task<IActionResult> GetAttendees([FromBody] TeamDeleteRequestDTO request) =>
            HandleResult(await Mediator.Send(
                new GetAttendees.Query { TeamDeleteRequestDTO = request }));

        [HttpDelete("deleteseries/{id}")]
        public async Task<IActionResult> DeleteSeries(Guid id) =>
          HandleResult(await Mediator.Send(new DeleteSeries.Command{Id = id}));
    }
}
