using Microsoft.AspNetCore.Mvc;
using Application.HostingReports;
using Microsoft.AspNetCore.Authorization;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;

namespace API.Controllers
{
    public class HostingReportsController : BaseApiController
    {

        private readonly DataContext _context;
        public HostingReportsController(DataContext context) => _context = context;

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetHostingReports() =>
      HandleResult(await Mediator.Send(new List.Query()));

        [HttpPost("listBySearchParams")]
        public async Task<IActionResult> ListBySearchParams(HostingReportTableSearchParams data) =>
          HandleResult(await Mediator.Send(
              new ListBySearchParams.Query { searchParams = data}));

        [AllowAnonymous]
        [HttpGet("getGuestTitles")]
        public async Task<ActionResult> getGuestTitles()
        {
            var hostingReports = await _context.HostingReports.Where(x => !String.IsNullOrEmpty(x.GuestTitle)).ToListAsync();
            if (hostingReports != null && hostingReports.Any())
            {
                var result = hostingReports.OrderBy(x => x.GuestTitle).Select(x => x.GuestTitle).Distinct().ToList();
                return Ok(result);
            }
            return Ok(new string[] { });
        }
    }
}
