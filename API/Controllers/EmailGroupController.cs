
using Microsoft.AspNetCore.Mvc;
using Application.EmailGroups;
using Microsoft.AspNetCore.Authorization;


namespace API.Controllers
{
    public class EmailGroupController : BaseApiController
    {
     [Authorize(Roles = "admin")]
      [HttpGet]
        public async Task<IActionResult> GetEmailGroupMembers() =>
      HandleResult(await Mediator.Send(new List.Query()));

        [Authorize(Roles = "admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetEmailGroupMember(Guid id) =>
         HandleResult(await Mediator.Send(new Details.Query { Id = id }));

        [Authorize(Roles = "admin")]
        [HttpDelete("{memberid}/{groupid}")]
        public async Task<IActionResult> Delete(Guid memberid, Guid groupid)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { MemberId = memberid , GroupId = groupid}));
        }

        [HttpGet("GetGroups")]
      public async Task<IActionResult>GetGroups() =>
      HandleResult(await Mediator.Send(new ListGroups.Query()));

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Post(EmailGroupMemberPostData emailGroupMemberPostData) =>
         HandleResult(await Mediator.Send(new Post.Command { EmailGroupMemberPostData = emailGroupMemberPostData }));

        [Authorize(Roles = "admin")]
        [HttpPost("addMemberToGroup")]
      public async Task<IActionResult> AddMemberToGroup(EmailGroupMemberDTO emailGroupMemberDTO) =>
    HandleResult(await Mediator.Send(new AddMemberToGroup.Command { EmailGroupMemberDTO = emailGroupMemberDTO }));
    }


}