using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph;
using Application.GraphUsers;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{

    public class GraphUsersController : BaseApiController
    {

        [HttpGet]
        public async Task<IActionResult> GetGraphUsers() => HandleResult(await Mediator.Send(new Application.GraphUsers.List.Query()));

        [HttpGet("textvalue")]
        public async Task<IActionResult> GetGraphUsersTextValue() => HandleResult(await Mediator.Send(new Application.GraphUsers.ListTextValue.Query()));

        [HttpGet("{email}")]
        public async Task<IActionResult> GetGraphUsers(string email) => HandleResult(await Mediator.Send(new Details.Query { Email = email }));

    }
}
