using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Application.USAHECFacilitiesUsageCalendarLegend;

namespace API.Controllers
{
    public class USAHECFacilitiesUsageLegendController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetLegend() => HandleResult(await Mediator.Send(new List.Query()));
    }
}
