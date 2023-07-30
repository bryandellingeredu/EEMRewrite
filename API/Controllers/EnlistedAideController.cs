
using Application.EnlistedAide;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Data;
using Details = Application.EnlistedAide.Details;
using List = Application.EnlistedAide.List;

namespace API.Controllers
{
    public class EnlistedAideController : BaseApiController
    {
        [Authorize(Roles = "EnlistedAidAdmin")]
        [HttpPost("confirm")]
        public async Task<IActionResult> Confirm(EnlistedAideConfirmationDTO enlistedAideConfirmationDTO) =>
    HandleResult(await Mediator.Send(new Confirm.Command { EnlistedAideConfirmationDTO = enlistedAideConfirmationDTO }));

        [Authorize(Roles = "EnlistedAidAdmin")]
        [HttpGet]
        public async Task<IActionResult> GetEnlistedAideCheckLists() => HandleResult(await Mediator.Send(new List.Query()));

        [Authorize(Roles = "EnlistedAidAdmin")]
        [HttpGet("{activityid}")]
        public async Task<ActionResult> GetActivity(Guid activityid) => HandleResult(await Mediator.Send(new Details.Query { ActivityId = activityid }));

         [Authorize(Roles = "EnlistedAidAdmin")]
          [HttpPost]
          public async Task<IActionResult> Update(EnlistedAideCheckList enlistedAideChecklist)
          {
              return HandleResult(await Mediator.Send(new Update.Command { EnlistedAideCheckList = enlistedAideChecklist }));
          }

        [AllowAnonymous]
        [HttpGet("getEventsByDate")]
        public async Task<ActionResult> GetEventsByDate()
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(new GetEventsByDate.Query { Start = start, End = end }));
        }

        /*  [AllowAnonymous]
          [HttpPost]
          public async Task<IActionResult> Update([FromBody] dynamic enlistedAideChecklistData)
          {
              // At this point, enlistedAideChecklistData is a dynamic object representing your JSON.
              // You can inspect it in the debugger or convert it to a string and log it.
              string json = enlistedAideChecklistData.ToString();

              // Convert the dynamic object to your EnlistedAideCheckList class.
              var enlistedAideChecklist = JsonConvert.DeserializeObject<EnlistedAideCheckList>(json);

              return HandleResult(await Mediator.Send(new Update.Command { EnlistedAideCheckList = enlistedAideChecklist }));
          } */


    }
}
