using Application.SyncCalendarNotifications;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class SyncCalendarNotificationController : BaseApiController
    {
        [HttpPost]
        public async Task<IActionResult> Add(SyncCalendarNotificationDTO syncCalendarNotificationDTO) =>
HandleResult(await Mediator.Send(new Add.Command { SyncCalendarNotificationDTO = syncCalendarNotificationDTO }));
    }
}
