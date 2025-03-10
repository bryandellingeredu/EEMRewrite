﻿using API.Extensions;
using API.MiddleWare;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Hangfire.Dashboard;

namespace API
{
    public class Startup
    {
        private readonly IConfiguration _config;

        public Startup(IConfiguration config)
        {
            _config = config;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers(opt =>
            {
                var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                opt.Filters.Add(new AuthorizeFilter(policy));
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.WriteIndented = true;
            });

            services.AddApplicationServices(_config);
            services.AddIdentityServices(_config);
            services.AddMemoryCache();

            services.AddHangfire(configuration => configuration
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseSqlServerStorage(_config.GetConnectionString("DefaultConnection"), new SqlServerStorageOptions
                {
                    CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
                    SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
                    QueuePollInterval = TimeSpan.Zero,
                    UseRecommendedIsolationLevel = true,
                    DisableGlobalLocks = true
                }));

            services.AddHangfireServer();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IRecurringJobManager recurringJobManager, IServiceProvider serviceProvider)
        {
            app.UseMiddleware<ExceptionMiddleware>();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "My Api v1"));
            }

            app.UseRouting();

            app.UseDefaultFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    var path = ctx.Context.Request.Path.Value;
                    if (string.Equals(path, "/", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(path, "/eem/", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(path, "/eem", StringComparison.OrdinalIgnoreCase) ||
                        path.EndsWith("/index.html", StringComparison.OrdinalIgnoreCase))
                    {
                        // Set headers to ensure that the browser doesn't cache the index file.
                        ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                        ctx.Context.Response.Headers["Pragma"] = "no-cache";
                        ctx.Context.Response.Headers["Expires"] = "0";
                    }
                }
            });

            app.UseCors("CorsPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                var hangfireDashboardPath = env.IsDevelopment() ? "/hangfire" : "/eem/hangfire";
                endpoints.MapHangfireDashboard(hangfireDashboardPath, new DashboardOptions
                {
                    Authorization = new[] { new AllowAllDashboardAuthorizationFilter() },
                    IgnoreAntiforgeryToken = true
                });
                // Map the fallback for SPA after Hangfire Dashboard configuration
                endpoints.MapFallbackToController("Index", "Fallback");
            });

            recurringJobManager.AddOrUpdate(
          "StudentSyncCalendarJob",
          () => serviceProvider.GetService<BackgroundJobs.BackgroundJobs>().CreateStudentCalendarFileJob(),
          "0 8-20/3 * * *"); // At minute 0 past every 3rd hour from 8 AM to 8 PM

            recurringJobManager.AddOrUpdate(
                "GenericSyncCalendarJob",
                () => serviceProvider.GetService<BackgroundJobs.BackgroundJobs>().CreateSyncCalendarFilesJob(),
                "0 9-21/3 * * *"); // At minute 0 past every 3rd hour from 9 AM to 9 PM, which is 1 hour after the first job

            recurringJobManager.AddOrUpdate(
                "EnlistedAideSyncCalendarJob",
                () => serviceProvider.GetService<BackgroundJobs.BackgroundJobs>().CreateEnlistedAideSyncCalendarFileJob(),
                "0 10-22/3 * * *"); // At minute 0 past every 3rd hour from 10 AM to 10 PM, which is 2 hours after the first job

            recurringJobManager.AddOrUpdate(
            "RoomReportJob",
            () => serviceProvider.GetService<BackgroundJobs.BackgroundJobs>().CreateRoomReportJob(),
            "0 23 * * *"); // At 11:00 PM every day
            }



    }
  
        public class AllowAllDashboardAuthorizationFilter : IDashboardAuthorizationFilter
        {
        public bool Authorize(DashboardContext context) => true;
        }
}
