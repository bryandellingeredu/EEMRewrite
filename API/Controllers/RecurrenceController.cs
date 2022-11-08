using Microsoft.AspNetCore.Mvc;
using Application.Recurrences;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class RecurrenceController : BaseApiController
    {
        [HttpGet]
    public async Task<IActionResult> GetRecurrences() => HandleResult(await Mediator.Send(new List.Query()));

    [HttpGet("{Id}")]
    public async Task<IActionResult> GetRecurrence(Guid Id) => HandleResult(await Mediator.Send(new Details.Query { Id = Id }));

    }
}
