using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Persistence;
using Domain;
namespace Application.Attachments
{
    public class Details
    {
        public class Query : IRequest<Result<Attachment>>
        {
            public int Id { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<Attachment>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<Attachment>> Handle(Query request, CancellationToken cancellationToken)
            {
                var attachment = await _context.Attachments.FindAsync(request.Id, cancellationToken);
                attachment.BinaryData = null;

                return Result<Attachment>.Success(attachment);
            }
        }
    }
}