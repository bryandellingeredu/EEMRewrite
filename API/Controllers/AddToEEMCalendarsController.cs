using Application.AddToEEMCalendars;
using AutoMapper.Execution;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AddToEEMCalendarsController : BaseApiController
    {
        [HttpPut("{id}")]
        public async Task<IActionResult> AddToEEMCalendars(Guid id, ActivityCalendarInformationDTO activityCalendarInformationDTO)
        {
            activityCalendarInformationDTO.Id = id;
            return HandleResult(await Mediator.Send(new Edit.Command { ActivityCalendarInformationDTO = activityCalendarInformationDTO }));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFromEEMCalendars(Guid id) => HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
    }
}
