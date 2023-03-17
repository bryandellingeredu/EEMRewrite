using Application.USAHECReports;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class USAHECFacilitiesUsageController : BaseApiController
    {
        [HttpPost("listBySearchParams")]
        public async Task<IActionResult> ListBySearchParams(USAHECFacilitiesUsageSearchParams data) =>HandleResult(await Mediator.Send(new ListBySearchParams.Query { searchParams = data }));          
        }
    }

