using Domain;
using Microsoft.AspNetCore.Mvc;
using Application.Activities;
using Microsoft.AspNetCore.Authorization;
using List = Application.Activities.List;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Routing;
using System.Reflection;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Persistence.Migrations;

namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {
        private readonly DataContext _context;

        public ActivitiesController(DataContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetActivities() =>
         HandleResult(await Mediator.Send(new List.Query()));

        [HttpGet("getDeleted")]
       public async Task<IActionResult> GetDeletedActivities() =>
      HandleResult(await Mediator.Send(new ListDeleted.Query()));

        public class DayRequest
        {
            public string Day { get; set; }
        }

        [AllowAnonymous]
        [HttpPost("getByDay")]
        public async Task<IActionResult> GetActivities([FromBody] DayRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Day))
            {
                return BadRequest("Bad Request.");
            }

            DateTime utcDateTime = DateTime.Parse(request.Day, null, System.Globalization.DateTimeStyles.RoundtripKind);
            DateTime estDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, TimeZoneInfo.Local);
            var result = await Mediator.Send(new ListByDay.Query { Day = estDateTime });

            return HandleResult(result);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult> GetActivity(Guid id) =>
         HandleResult(await Mediator.Send(new Details.Query { Id = id }));

        [HttpGet("attendees/{id}")]
        public async Task<ActionResult> GetAttendees(Guid id) =>
        HandleResult(await Mediator.Send(new GetAttendees.Query { Id = id }));  

        [HttpGet("getByRoom/{title}/{start}/{end}/{id}")]
        public async Task<ActionResult> GetByRoom(string title, string start, string end, string id)
        {
            var result =  await Mediator.Send(new GetByRoom.Query { Title = title, Start = start, End = end, Id = id });
            return HandleResult(result);
           
        }

        [HttpPost("listBySearchParams")]
        public async Task<IActionResult> ListBySearchParams(ActivitySearchParams data) =>
            HandleResult(await Mediator.Send(
                new ListBySearchParams.Query { Title = data.Title, Start = data.Start, End = data.End, CategoryIds = data.CategoryIds, Location = data.Location, ActionOfficer=data.ActionOfficer, OrganizationId = data.OrganizationId, Description = data.Description }));

        [HttpPost("listSVTCBySearchParams")]
        public async Task<IActionResult> ListSVTCBySearchParams(SVTCSearchParams data) =>
     HandleResult(await Mediator.Send(
         new ListSVTCBySearchParams.Query { Title = data.Title, Start = data.Start, End = data.End,  Location = data.Location, ActionOfficer = data.ActionOfficer, VTCClassification = data.VTCClassification,
             DistantTechPhoneNumber = data.DistantTechPhoneNumber, RequestorPOCContactInfo = data.RequestorPOCContactInfo, DialInNumber = data.DialInNumber,  SiteIDDistantEnd = data.SiteIDDistantEnd,
             GOSESInAttendance = data.GOSESInAttendance,  SeniorAttendeeNameRank = data.SeniorAttendeeNameRank,  AdditionalVTCInfo = data.AdditionalVTCInfo, VTCStatus = data.VTCStatus
         }));

        [HttpPost("listCIOEventPlanningBySearchParams")]
        public async Task<IActionResult> ListCIOEventPlanningBySearchParams(CIOEventPlanningSearchParams data) =>
HandleResult(await Mediator.Send(
    new ListCIOEventPlanningBySearchParams.Query
    {
        Title = data.Title,
        Start = data.Start,
        End = data.End,
        Location = data.Location,
        ActionOfficer = data.ActionOfficer,
       EventPlanningExternalEventPOCName = data.EventPlanningExternalEventPOCName,
       EventPlanningExternalEventPOCEmail = data.EventPlanningExternalEventPOCEmail,
        EventPlanningStatus = data.EventPlanningStatus,
        EventPlanningPAX = data.EventPlanningPAX,
        EventPlanningSetUpDate = data.EventPlanningSetUpDate,
        EventClearanceLevel = data.EventClearanceLevel
    }));

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
            return HandleResult(await Mediator.Send(new Update.Command { Activity = activity }));
        }

        [HttpPut("updateimc/{id}")]
        public async Task<IActionResult> UpdateIMC(Guid id, UpdateIMCDTO updateIMCDTO){
            return HandleResult(await Mediator.Send(new UpdateIMC.Command{ UpdateIMCDTO = updateIMCDTO, Id = id }));    
        }

        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> CancelActivity(Guid id, CancelEventDTO cancelEventDTO)
        {
            cancelEventDTO.ActivityId = id;
            return HandleResult(await Mediator.Send(new Cancel.Command { CancelEventDTO = cancelEventDTO }));
        }

        [HttpPut("updateSeries/{id}")]
        public async Task<IActionResult> EditSeries(Guid id, Activity activity)
        {
            activity.Id = id;
            return HandleResult(await Mediator.Send(new EditSeries.Command { Activity = activity }));

        }

        [HttpPut("cancelRoomReservations/{id}")]
        public async Task<ActionResult<Activity>> CancelRoomReservations(Guid id) =>
          HandleResult(await Mediator.Send(new CancelRoomReservations.Command { Id = id }));

        [HttpPut("cancelRoomReservations/{id}/{manageSeries}")]
        public async Task<ActionResult<Activity>> CancelRoomReservationsForSeries(Guid id, string manageSeries)
        {

            if (!string.IsNullOrEmpty(manageSeries) && manageSeries == "true")
            {
                return HandleResult(await Mediator.Send(new CancelRoomReservationsForSeries.Command { Id = id }));
           
            }
            else
            {
                return HandleResult(await Mediator.Send(new CancelRoomReservations.Command { Id = id }));
            }
        }


        [HttpPut("restore/{id}")]
        public async Task<ActionResult<Activity>> RestoreActivity(Guid id) =>
          HandleResult(await Mediator.Send(new Restore.Command { Id = id }));


        [HttpDelete("{id}")]
        public async Task<ActionResult<Activity>> DeleteActivity(Guid id) =>
          HandleResult(await Mediator.Send(new Delete.Command { Id = id }));


        public class GetRoomNamesRequest
        {
            public string EventLookup { get; set; }
            public string CoordinatorEmail { get; set; }
        }
        [AllowAnonymous]
        [HttpPost("GetRoomNames")]
        public async Task<ActionResult> GetRoomNames([FromBody] GetRoomNamesRequest request) =>
            HandleResult(await Mediator.Send(
                new GetRoomNames.Query { EventLookup = request.EventLookup, CoordinatorEmail = request.CoordinatorEmail }));

        [AllowAnonymous]
        [HttpGet("GetStudentCalendarEventsByDate")]
        public async Task<ActionResult> GetStudentCalendarRoomEvents()
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(new GetStudentCalendarEventsByDate.Query {  Start = start, End = end }));
        }

        [AllowAnonymous]
        [HttpGet("GetInternationalFellowsCalendarEventsByDate/{ifCalendarAdmin}")]
        public async Task<ActionResult> GetInternationalFellowsCalendarRoomEvents(string ifCalendarAdmin)
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(
                new GetInternationalFellowsCalendarEventsByDate.Query { IFCalendarAdmin = ifCalendarAdmin, Start = start, End = end }));
        }

        [AllowAnonymous]
        [HttpGet("GetEventsByDate/{routeName}")]
        public async Task<ActionResult> GetRoomEvents(string routeName)
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(new GetEventsByDate.Query { RouteName = routeName, Start = start, End = end }));
        }

        [AllowAnonymous]
        [HttpGet("getIMCEventsByDate")]
        public async Task<ActionResult> GetIMCEvents(string routeName)
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(new GetIMCEventsByDate.Query { Start = start, End = end }));
        }

        [AllowAnonymous]
        [HttpGet("getAllEventsByDate")]
        public async Task<ActionResult> GetAllEvents()
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(new GetAllEventsByDate.Query { Start = start, End = end }));
        }

        [AllowAnonymous]
        [HttpGet("getSVTCEventsByDate")]
        public async Task<ActionResult> GetSVTCEvents()
        {
            string start = Request.Query["start"];
            string end = Request.Query["end"];
            return HandleResult(await Mediator.Send(new GetSVTCEventsByDate.Query { Start = start, End = end }));
        }



        [HttpGet("getLocations")]
        public async Task<ActionResult> GetLocations() =>  Ok(await _context.Activities.Where(x => !String.IsNullOrEmpty(x.PrimaryLocation)).Select(x => x.PrimaryLocation).Distinct().ToListAsync());

        [HttpGet("getActionOfficers")]
        public async Task<ActionResult> GetActionOfficers() => Ok(await _context.Activities.Where(x => !String.IsNullOrEmpty(x.ActionOfficer)).OrderBy(x => x.ActionOfficer).Select(x => x.ActionOfficer).Distinct().ToListAsync());

        [HttpGet("getCreatedBy")]
        public async Task<ActionResult> GeCreatedBy() => Ok(await _context.Activities.Where(x => !String.IsNullOrEmpty(x.CreatedBy)).OrderBy(x => x.CreatedBy).Select(x => x.CreatedBy).Distinct().ToListAsync());
    }
}
