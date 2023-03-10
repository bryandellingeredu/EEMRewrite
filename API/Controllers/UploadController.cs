using Application.Attachments;
using Application.Uploads;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class UploadController : BaseApiController
    {
        private readonly DataContext _context;

         public UploadController(DataContext context) =>  _context = context;


        [HttpPost]
        public async Task<IActionResult> Add([FromForm] Add.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }

        [HttpPost("addActivityAttachment")]
        public async Task<IActionResult> AddActivityAttachment([FromForm] string activityAttachmentGroupId, [FromForm]string activityAttachmentId, [FromForm] AddActivityAttachment.Command command)
        {
            command.ActivityAttachmentGroupId= Guid.Parse(activityAttachmentGroupId); 
            command.Id= Guid.Parse(activityAttachmentId); 
            return HandleResult(await Mediator.Send(command));
        }

        [HttpGet("metadata/{id}")]
            public async Task<ActionResult> GetMetaDatat(int id) =>
     HandleResult(await Mediator.Send(new Details.Query { Id = id }));
        

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFile(int id)
        {
            var file = await _context.Attachments.FindAsync(id);
            if (file == null)  return NotFound();
           return File(file.BinaryData, file.FileType, file.FileName);
        }

      [HttpGet("ActivityAttachment/{id}")]
        public async Task<IActionResult> GetActivityAttachmentFile(Guid id)
        {
            var file = await _context.ActivityAttachments.FindAsync(id);
            if (file == null)  return NotFound();
           return File(file.BinaryData, file.FileType, file.FileName);
        }

        [HttpGet("ActivityAttachmentsMetaData/{activityAttachmentGroupId}")]
        public async Task<IActionResult> GetActivityAttachmentsMetaData(Guid activityAttachmentGroupId)
        {
            var files = await _context.ActivityAttachments
                .Where(x => x.ActivityAttachmentGroupId == activityAttachmentGroupId)
                .Select(x => new { x.Id, x.ActivityAttachmentGroupId, x.FileName, x.FileType })
                .ToListAsync();
            if (files == null || !files.Any())  return NotFound();
           return Ok(files);
        }

         [HttpGet("ActivityAttachmentMetaData/{Id}")]
        public async Task<IActionResult> GetActivityAttachmentMetaData(Guid id)
        {
            var file = await _context.ActivityAttachments
                .Where(x => x.Id == id)
                .Select(x => new { x.Id, x.ActivityAttachmentGroupId, x.FileName, x.FileType })
                .FirstOrDefaultAsync();
            if (file == null )  return NotFound();
           return Ok(file);
        }

        [HttpDelete("DeleteActivityAttachment/{id}")]
         public async Task<ActionResult> DeleteActivityAttachment(Guid id){
            var activityAttachment = await _context.ActivityAttachments.FindAsync(id);
                if (activityAttachment == null) return null;
                _context.ActivityAttachments.Remove(activityAttachment);
                var success = await _context.SaveChangesAsync() > 0;
                if (success) return Ok();
                return BadRequest("Error Deleting Activity Attachment");
         }
    }
}
