using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph;
using System.Net.Mail;

namespace API.Controllers
{
    public class GraphEventsController : BaseApiController
    {

        [HttpGet]
        public async Task<IActionResult> GetAllGraphEvents()
        {
            var places = await Mediator.Send(new Application.GraphRooms.List.Query());
            List<Event> events = new List<Event>();
            foreach (var place in places)
            {
                string emailAddress = place.AdditionalData["emailAddress"].ToString();
                var evts = await Mediator.Send(new Application.GraphEvents.List.Query { Email = emailAddress });
                foreach (var e in evts)
                {
                    events.Add(e);
                }
            }

            return Ok(events);
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetGraphEvents(string email)
        {
            var result = await Mediator.Send(new Application.GraphEvents.List.Query{ Email = email});
            return Ok(result);
        }
        [HttpGet("{email}/events/{id}")]
        public async Task<IActionResult> GetGraphEvent(string email, string id)
        {
            var result = await Mediator.Send(new Application.GraphEvents.Details.Query { Email = email, Id = id });
            return Ok(result);
        }
    }
}
