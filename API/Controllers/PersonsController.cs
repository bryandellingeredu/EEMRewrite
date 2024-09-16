using Microsoft.AspNetCore.Mvc;
using Application.Persons;
using Microsoft.AspNetCore.Authorization;
namespace API.Controllers
{
    public class PersonsController : BaseApiController
    {
       // [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult> GetPersons() => HandleResult(await Mediator.Send(new List.Query()));
    }
}
