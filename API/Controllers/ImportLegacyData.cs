using Domain;
using Microsoft.AspNetCore.Mvc;
using Application.Locations;
using Microsoft.AspNetCore.Authorization;
using Application.ImportLegacyData;
using Application.Activities;
using MediatR;
using System.Diagnostics;

namespace API.Controllers
{
    public class ImportLegacyDataController : BaseApiController
    {
        private readonly IWebHostEnvironment _environment;

        public ImportLegacyDataController(IWebHostEnvironment environment)
        {
            _environment = environment; 
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ImportLegacyData() =>
          HandleResult(await Mediator.Send(new Import.Command {}));


        [AllowAnonymous]
        [HttpGet("deleteCalendarEvents/{email}")]
        public async Task<IActionResult> DeleteCalendarEvents(string email)
        {
            if (!_environment.IsDevelopment())
            {
                return Unauthorized(); // Return an unauthorized response if the environment is not local
            }

            return HandleResult(await Mediator.Send(new DeleteEvents.Command { Email = email }));
        }

        [AllowAnonymous]
        [HttpGet("deleteAllEvents")]
        public async Task<IActionResult> DeleteAllEvents()
        {
            if (!_environment.IsDevelopment())
            {
                return Unauthorized(); // Return an unauthorized response if the environment is not local
            }

            return HandleResult(await Mediator.Send(new DeleteAllEvents.Command { } ));
        }
    }
}


