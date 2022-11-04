
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Recurrence> Recurrences { get; set; }
        public DbSet<ActivityRoomOwner> ActivityRoomOwners { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyUtcDateTimeConverter();//Put before seed data and after model creation
        }
    }

    
}