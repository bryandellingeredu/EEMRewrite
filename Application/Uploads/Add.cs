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
    public class Add
    {
        public class Command : IRequest<Result<Attachment>>
        {
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Attachment>>
        {
            public Handler(
             DataContext context, IMapper mapper, IConfiguration config, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _config = config;
                _userAccessor = userAccessor;
            }

            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IConfiguration _config;
            private readonly IUserAccessor _userAccessor;

            public async Task<Result<Attachment>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {
       

                    using (var stream = request.File.OpenReadStream())
                    using (var ms = new MemoryStream()){
                         stream.CopyTo(ms);
                         var attachment = new Attachment{
                            FileName = request.File.FileName,
                            BinaryData = ms.ToArray(),
                            FileType = request.File.ContentType           
                         };
                        await _context.Attachments.AddAsync(attachment);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Attachment>.Failure("Failed to Create Activity");

                        attachment.BinaryData = null;
                   
                    return Result<Attachment>.Success(attachment);
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
