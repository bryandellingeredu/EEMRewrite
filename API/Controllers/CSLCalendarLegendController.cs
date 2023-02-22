using Microsoft.AspNetCore.Mvc;
using Application.CSLLegend;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class CSLCalendarLegendController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetLegend() => HandleResult(await Mediator.Send(new List.Query()));
    }
}
