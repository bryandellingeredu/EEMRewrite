using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Application.CSLLegend;

namespace API.Controllers
{
    public class CSLCalendarLegendController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetLegend() => HandleResult(await Mediator.Send(new List.Query()));
    }
}
