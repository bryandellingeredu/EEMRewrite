using Domain;
using Microsoft.AspNetCore.Mvc;
using Application.Activities;
using Microsoft.AspNetCore.Authorization;
using List = Application.Activities.List;

namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetActivities() =>
         HandleResult(await Mediator.Send(new List.Query()));

        [HttpGet("getByDay/{day}")]
        public async Task<IActionResult> GetActivities(string day)
        {
            DateTime utcDateTime = DateTime.Parse(day, null, System.Globalization.DateTimeStyles.RoundtripKind);
            DateTime estDateTime = TimeZone.CurrentTimeZone.ToLocalTime(utcDateTime);
            var result = await Mediator.Send(new ListByDay.Query { Day = estDateTime });
            return HandleResult(result);
        }
     

        [HttpGet("{id}")]
        public async Task<ActionResult> GetActivity(Guid id) =>
         HandleResult(await Mediator.Send(new Details.Query { Id = id }));

        [HttpGet("getByRoom/{title}/{start}/{end}")]
        public async Task<ActionResult> GetByRoom(string title, string start, string end)
        {
            var result =  await Mediator.Send(new GetByRoom.Query { Title = title, Start = start, End = end });
            return HandleResult(result);
           
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity(Activity activity) =>
          HandleResult(await Mediator.Send(new Create.Command { Activity = activity }));

        [HttpPost("listPossibleByRecurrence")] 
        public async Task<IActionResult> ListPossibleByRecurrence(Recurrence recurrence) =>
            HandleResult(await Mediator.Send(new ListPossibleByRecurrence.Command { Recurrence = recurrence }));

        [HttpPut("{id}")]
        public async Task<IActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id = id;
            return HandleResult(await Mediator.Send(new Edit.Command { Activity = activity }));
        }

        [HttpPut("updateSeries/{id}")]
        public async Task<IActionResult> EditSeries(Guid id, Activity activity)
        {
            activity.Id = id;
            return HandleResult(await Mediator.Send(new EditSeries.Command { Activity = activity }));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Activity>> DeleteActivity(Guid id) =>
          HandleResult(await Mediator.Send(new Delete.Command { Id = id }));

        [AllowAnonymous]
        [HttpGet("GetEventsByDate/{routeName}")]
        public async Task<ActionResult> GetRoomEvents(string routeName)
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(new GetEventsByDate.Query { RouteName = routeName, Start = start, End = end }));
        }
    }
}
