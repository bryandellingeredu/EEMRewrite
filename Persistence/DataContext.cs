
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.Reflection.Emit;
using Microsoft.AspNetCore.Identity;

namespace Persistence
{
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Recurrence> Recurrences { get; set; }
        public DbSet<HostingReport> HostingReports {get; set;}
        public DbSet<Attachment> Attachments {get; set;} //this is only used for BIO
        public DbSet<ActivityAttachment> ActivityAttachments {get; set;}
        public DbSet<RoomDelegate> RoomDelegates { get; set; }
        public DbSet<EmailGroup> EmailGroups { get; set; }
        public DbSet<EmailGroupMember> EmailGroupMembers { get; set; }
        public DbSet<EmailGroupEmailGroupMemberJunction> EmailGroupEmailGroupMemberJunctions {get; set;}
        public DbSet<CSLCalendarLegend> CSLCalendarLegends { get; set; }
         public DbSet<USAHECFacilitiesUsageLegend> USAHECFacilitiesUsageLegends { get; set; }
        public DbSet<RoomVTCCoordinator> RoomVTCCoordinators {get; set;}
        public DbSet<EnlistedAideCheckList> EnlistedAideCheckLists { get; set; }
        public DbSet<ActivityNotification> ActivityNotifications { get; set; }  
        public DbSet<SyncToCalendarNotification> SyncToCalendarNotifications { get; set; }  



        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
           // builder.ApplyUtcDateTimeConverter();//Put before seed data and after model creation
            builder.Entity<AppUser>().Property(x => x.Id).HasMaxLength(225);
            builder.Entity<IdentityRole>().Property(x => x.Id).HasMaxLength(225);
            builder.Entity<IdentityUserLogin<string>>().Property(x => x.ProviderKey).HasMaxLength(225);
            builder.Entity<IdentityUserLogin<string>>().Property(x => x.LoginProvider).HasMaxLength(225);
            builder.Entity<IdentityUserToken<string>>().Property(x => x.Name).HasMaxLength(112);
            builder.Entity<IdentityUserToken<string>>().Property(x => x.LoginProvider).HasMaxLength(112);

        builder.Entity<Activity>()
        .HasOne(u => u.HostingReport)
        .WithOne(a => a.Activity)
        .HasForeignKey<HostingReport>(a => a.ActivityId)
        .IsRequired(false);

        builder.Entity<Attachment>()
            .Property(e => e.BinaryData)
            .HasColumnType("VARBINARY(MAX)");
        }
    }

    
}