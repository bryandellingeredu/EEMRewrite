using Application.Core;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class UpdateIMC
    {
         public class Command : IRequest<Result<Unit>>
         {
           public Guid Id {get; set;}
           public UpdateIMCDTO UpdateIMCDTO{get; set;}
         }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
             private readonly DataContext _context;

             public Handler(DataContext context){
                _context = context;
             }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.FindAsync(request.Id, cancellationToken);  
                activity.IMC = request.UpdateIMCDTO.IMC;
                await _context.SaveChangesAsync();  
                return Result<Unit>.Success(Unit.Value);

            }
        }
    }
}