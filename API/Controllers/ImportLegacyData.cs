using Domain;
using Microsoft.AspNetCore.Mvc;
using Application.Locations;
using Microsoft.AspNetCore.Authorization;
using Application.ImportLegacyData;

namespace API.Controllers
{
    public class ImportLegacyDataController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ImportLegacyData() =>
          HandleResult(await Mediator.Send(new Import.Command {}));
    }
}
