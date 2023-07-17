
using Application.EnlistedAide;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace API.Controllers
{
    public class EnlistedAideController : BaseApiController
    {
        [Authorize(Roles = "EnlistedAidAdmin")]
        [HttpPost("confirm")]
        public async Task<IActionResult> Confirm(EnlistedAideConfirmationDTO enlistedAideConfirmationDTO) =>
    HandleResult(await Mediator.Send(new Confirm.Command { EnlistedAideConfirmationDTO = enlistedAideConfirmationDTO }));
    }
}
