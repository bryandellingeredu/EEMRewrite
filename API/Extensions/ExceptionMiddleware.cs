using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net;
using Application.Core;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Application;

namespace API.MiddleWare
{
    public class ExceptionMiddleware
    {
        readonly RequestDelegate _next;
        readonly ILogger<ExceptionMiddleware> _logger;
        readonly IHostEnvironment _env;
        readonly IConfiguration _config;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env, IConfiguration config)
        {
            _next = next;
            _logger = logger;
            _env = env;
            _config = config;   
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                /*   var response = _env.IsDevelopment()
                   ? new AppException(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString())
                   : new AppException(context.Response.StatusCode, ex.Message, "Server Error");*/
                try
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                    string body = $"User: {context.User.Identity.Name}\n" +
    $"Time: {DateTime.Now}\n" +
    $"Error Message: {ex.Message}\n" +
    $"Stack Trace:\n{ex.StackTrace}\n" +
    $"Request Method: {context.Request.Method}\n" +
    $"Request URL: {context.Request.Path}{context.Request.QueryString}\n";

                    if (ex.InnerException != null)
                    {
                        body += $"\nInner Exception Message: {ex.InnerException.Message}" +
                        $"\nInner Exception Stack Trace:\n{ex.InnerException.StackTrace}";
                    }

                    await GraphHelper.SendEmail(new[] { "bryan.d.dellinger.civ@army.mil", "bryan.dellinger.civ@armywarcollege.edu", "robert.h.hoss.civ@army.mil" }, "An EEM Error Occured", body);
                }
                catch (Exception )
                {

                }

                var response = new AppException(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString());

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }
    }
}