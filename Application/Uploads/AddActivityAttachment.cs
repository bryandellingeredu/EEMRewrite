using Application.Core;
using Application.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Persistence;
using Microsoft.Extensions.Configuration;
using Domain;

namespace Application.Uploads
{
    public class AddActivityAttachment
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid ActivityAttachmentGroupId { get; set; }
            public Guid Id { get; set; }
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            public Handler(
             DataContext context)
            {
                _context = context;
            }

            private readonly DataContext _context;

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {
                    using (var stream = request.File.OpenReadStream())
                    using (var ms = new MemoryStream()){
                         stream.CopyTo(ms);
                         var activityAttachment = new ActivityAttachment{
                             Id = request.Id,
                             ActivityAttachmentGroupId=request.ActivityAttachmentGroupId,
                            FileName = request.File.FileName,
                            BinaryData = ms.ToArray(),
                            FileType = request.File.ContentType           
                         };
                        await _context.ActivityAttachments.AddAsync(activityAttachment);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to Create Activity");


                        return Result<Unit>.Success(Unit.Value);
                    }
                }
                catch(Exception )
                {
                    throw;
                }
            }
        }
    }
}
