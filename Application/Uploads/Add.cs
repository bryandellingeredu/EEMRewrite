using Application.Core;
using Application.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Persistence;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Activities;

namespace Application.Uploads
{
    public class Add
    {
        public class Command : IRequest<Result<string>>
        {
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<string>>
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

            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {
                    Helper.InitHelper(_mapper);
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    string url = await GraphHelper.UploadFile( request.File);

                    return Result<string>.Success("Success");
                }
                catch(Exception e)
                {
                    throw;
                }
            }
        }
    }
}
