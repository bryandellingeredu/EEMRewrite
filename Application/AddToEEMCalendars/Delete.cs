using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AddToEEMCalendars
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var syncToCalendarNotification = await _context.SyncToCalendarNotifications.Where(x => x.Id == request.Id).FirstOrDefaultAsync();
                if (syncToCalendarNotification != null)
                {
                    _context.SyncToCalendarNotifications.Remove(syncToCalendarNotification);
                }
                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Result<Unit>.Success(Unit.Value);
                return Result<Unit>.Failure("Problem deleting Sync Calendar Notification");
            }
        }
    }
}
