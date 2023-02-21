using Application.Attachments;
using Application.Uploads;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("metadata/{id}")]
            public async Task<ActionResult> GetMetaDatat(int id) =>
     HandleResult(await Mediator.Send(new Details.Query { Id = id }));
        

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFile(int id)
        {
            var file = await _context.Attachments.FindAsync(id);
            if (file == null)  return NotFound();
            var fileName = file.FileName;
            var mimeType = file.FileType;
            byte[] fileBytes = file.BinaryData;
           return File(file.BinaryData, file.FileType, file.FileName);
        }
    }
}
