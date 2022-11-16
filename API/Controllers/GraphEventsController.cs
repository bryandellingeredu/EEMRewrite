using Application.GraphEvents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph;
using System.Net.Mail;
using System.Numerics;

namespace API.Controllers
{
    public class GraphEventsController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllGraphEvents()
        {
            var result = await Mediator.Send(new Application.GraphRooms.List.Query());
            if (result.IsSuccess && result.Value != null)
            {
                List<Event> events = new List<Event>();
                foreach (var place in result.Value)
                {
                    string emailAddress = place.AdditionalData["emailAddress"].ToString();
                    var result2 = await Mediator.Send(new Application.GraphEvents.List.Query { Email = emailAddress });

                    if (result2.IsSuccess && result2.Value != null)
                    {
                        foreach (var e in result2.Value)
                        {
                            events.Add(e);
                        }
                    }
                    else
                    {
                        return BadRequest("Problem retrieving events");
                    }
                }

                return Ok(events);
            } else
            {
                return BadRequest("Problem retrieving events");
            }     
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetGraphEvents(string email) =>
            HandleResult(await Mediator.Send(new Application.GraphEvents.List.Query { Email = email }));


        [HttpGet("{email}/events/{id}")]
        public async Task<IActionResult> GetGraphEvent(string email, string id) =>
            HandleResult(await Mediator.Send(new Application.GraphEvents.Details.Query { Email = email, Id = id }));

    }
}

