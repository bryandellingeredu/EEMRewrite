
using Microsoft.AspNetCore.Mvc;
using Domain;
using Application.ActivityNotifications;

namespace API.Controllers
{
    public class ActivityNotificationController :  BaseApiController
    {
        [HttpPost]
        public async Task<IActionResult> Add(ActivityNotification activityNotification) =>
HandleResult(await Mediator.Send(new Add.Command { ActivityNotification = activityNotification }));
    }
}
