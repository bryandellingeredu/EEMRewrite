using API.Extensions;
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
                    // Disable caching for index.html
                    if (ctx.Context.Request.Path.Value.EndsWith("/index.html"))
                    {
                        ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store");
                        ctx.Context.Response.Headers.Append("Pragma", "no-cache");
                        ctx.Context.Response.Headers.Append("Expires", "0");
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
        "0 */3 * * *"); // At minute 0 past every 3rd hour

            recurringJobManager.AddOrUpdate(
                "GenericSyncCalendarJob",
                () => serviceProvider.GetService<BackgroundJobs.BackgroundJobs>().CreateSyncCalendarFilesJob(),
                "0 1-23/3 * * *"); // At minute 0 past hour 1, 4, 7, ..., which is 1 hour after the first job

            recurringJobManager.AddOrUpdate(
                "EnlistedAideSyncCalendarJob",
                () => serviceProvider.GetService<BackgroundJobs.BackgroundJobs>().CreateEnlistedAideSyncCalendarFileJob(),
                "0 2-23/3 * * *"); // At minute 0 past hour 2, 5, 8, ..., which is 2 hours after the first job
        }



    }
  
        public class AllowAllDashboardAuthorizationFilter : IDashboardAuthorizationFilter
        {
        public bool Authorize(DashboardContext context) => true;
        }
}
