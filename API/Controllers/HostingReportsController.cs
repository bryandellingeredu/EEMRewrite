using Microsoft.AspNetCore.Mvc;
using Application.HostingReports;
using Microsoft.AspNetCore.Authorization;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;
using Application.Interfaces;
using Infrastructucture.Security;

namespace API.Controllers
{
    public class HostingReportsController : BaseApiController
    {

        private readonly DataContext _context;
        private readonly ICACAccessor _cacAccessor;

        public HostingReportsController(DataContext context, ICACAccessor cacAccessor)
        {
            _context = context;
            _cacAccessor = cacAccessor;
        }

 

        [HttpGet]
        public async Task<IActionResult> GetHostingReports()
        {
            if (_cacAccessor.IsCACAuthenticated())
            {
                return HandleResult(await Mediator.Send(new List.Query()));
            }
          return Unauthorized();
        }



        [HttpGet("ListForHostingReportPDF")]
        public async Task<IActionResult> ListForHostingReportPDF()
        {
            if (_cacAccessor.IsCACAuthenticated())
            {
                return HandleResult(await Mediator.Send(new ListForHostingReportPDF.Query()));
            }
            return Unauthorized();
        }

        [HttpPost("getFlagReport")]
        public async Task<IActionResult> ListBySearchParams(FlagReportData data)
        {
            var result = await Mediator.Send(new GetFlagReport.Query { Month = data.Month, Direction = data.Direction});
            return HandleResult(result);
        }

        [HttpPost("getParkingReport")]
        public async Task<IActionResult> ListParkingBySearchParams(FlagReportData data)
        {
            var result = await Mediator.Send(new GetParkingReport.Query { Month = data.Month, Direction = data.Direction });
            return HandleResult(result);
        }

        [HttpPost("listBySearchParams")]
        public async Task<IActionResult> ListBySearchParams(HostingReportTableSearchParams data)
        {
            if (_cacAccessor.IsCACAuthenticated())
            {
                return HandleResult(await Mediator.Send(
              new ListBySearchParams.Query { searchParams = data }));
            }
            return Unauthorized();
        }

        [HttpPost("listOutsiderBySearchParams")]
        public async Task<IActionResult> ListOutsiderBySearchParams(OutsiderReportTableSearchParams data)
        {
            if (_cacAccessor.IsCACAuthenticated())
            {
                return HandleResult(await Mediator.Send(
              new ListOutsiderBySearchParams.Query { searchParams = data }));
            }
            return Unauthorized();
        }




        [HttpGet("getGuestTitles")]
        public async Task<ActionResult> getGuestTitles()
        {
            if (_cacAccessor.IsCACAuthenticated())
            {
                var hostingReports = await _context.HostingReports.Where(x => !String.IsNullOrEmpty(x.GuestTitle)).ToListAsync();
                if (hostingReports != null && hostingReports.Any())
                {
                    var result = hostingReports.OrderBy(x => x.GuestTitle).Select(x => x.GuestTitle).Distinct().ToList();
                    return Ok(result);
                }
                return Ok(new string[] { });

            }
            return Unauthorized();

        }

        public class FlagReportData
        {
            public  string Direction { get; set; }

            public int Month { get; set; }
        }
    }
}
