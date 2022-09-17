using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context)
        {
            if (context.Activities.Any()) return;

            var activities = new List<Activity>
            {
                new Activity
                {
                    Title = "Past Activity 1",
                    Start = DateTime.Now.AddMonths(-2),
                    End = DateTime.Now.AddMonths(-2).AddHours(2),
                    Description = "Activity 2 months ago",
                    Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Past Activity 2",
                    Start = DateTime.Now.AddMonths(-1),
                    End = DateTime.Now.AddMonths(-1).AddHours(2),
                    Description = "Activity 1 month ago",
                    Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 1",
                    Start = DateTime.Now.AddMonths(1),
                    End = DateTime.Now.AddMonths(1).AddHours(2),
                    Description = "Activity 1 month in future",
                    Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 2",
                    Start = DateTime.Now.AddMonths(2),
                    End = DateTime.Now.AddMonths(2).AddHours(2),
                    Description = "Activity 2 months in future",
                    Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 3",
                    Start = DateTime.Now.AddMonths(3),
                    End = DateTime.Now.AddMonths(3).AddHours(2),
                    Description = "Activity 3 months in future",
                    Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 4",
                    Start = DateTime.Now.AddMonths(4),
                    End = DateTime.Now.AddMonths(4).AddHours(2),
                    Description = "Activity 4 months in future",
                    Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 5",
                    Start = DateTime.Now.AddMonths(5),
                    End = DateTime.Now.AddMonths(5).AddHours(2),
                    Description = "Activity 5 months in future",
                   Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 6",
                    Start = DateTime.Now.AddMonths(6),
                    End = DateTime.Now.AddMonths(6).AddHours(2),
                    Description = "Activity 6 months in future",
                   Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 7",
                    Start = DateTime.Now.AddMonths(7),
                    End = DateTime.Now.AddMonths(7).AddHours(2),
                    Description = "Activity 7 months in future",
                   Category = "CSL Calendar",
                },
                new Activity
                {
                    Title = "Future Activity 8",
                    Start = DateTime.Now.AddMonths(8),
                     End = DateTime.Now.AddMonths(8).AddHours(2),
                    Description = "Activity 8 months in future",
                    Category = "film"
                   
                }
            };

            await context.Activities.AddRangeAsync(activities);
            await context.SaveChangesAsync();
        }
    }
}
