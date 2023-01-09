using Application.Uploads;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class UploadController : BaseApiController
    {
        [HttpPost]
        public async Task<IActionResult> Add([FromForm] Add.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }
    }
}
