using Domain;
using Microsoft.AspNetCore.Mvc;
using Application.Organizations;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class OrganizationsController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetOrganizations() =>
      HandleResult(await Mediator.Send(new List.Query()));
    }
}
