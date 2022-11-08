using Domain;
using Microsoft.AspNetCore.Mvc;
using Application.Locations;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class LocationsController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetLocations() =>
      HandleResult(await Mediator.Send(new List.Query()));
    }
}
