using Microsoft.AspNetCore.Mvc;
using Application.HostingReports;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class HostingReportsController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetHostingReports() =>
      HandleResult(await Mediator.Send(new List.Query()));
    }
}
