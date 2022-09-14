using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph;
using Application.GraphUsers;

namespace API.Controllers
{

    public class GraphUsersController : BaseApiController
    {
   
      [HttpGet]
        public async Task<IActionResult> GetGraphUsers() => HandleResult(await Mediator.Send(new Application.GraphUsers.List.Query()));
                 
    }
}
