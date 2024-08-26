using Application.EnlistedAide;
using Application.Tickets;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class TicketsController :  BaseApiController
    {
        [HttpPost]
        public async Task<IActionResult> Create(TicketDTO ticketDTO)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            return HandleResult(await Mediator.Send(new Create.Command { TicketDTO = ticketDTO, Email = email }));
        }
   
    }
}
