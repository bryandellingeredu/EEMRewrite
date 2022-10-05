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
        public DbSet<ActivityRoom> ActivityRooms { get; set; }
    }
}