using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context)
        {
            if (context.Activities.Any()) return;

            var categories = new List<Category>
            {
                new Category{Name = "Academic Calendar"},
                new Category{Name = "ASEP Calendar"},
                new Category{Name = "Chapel"},
                new Category{Name = "Command Group Calendar"},
                new Category{Name = "Complemenary Events"},
                new Category{Name = "Community Relations"},
                new Category{Name = "CSL Calendar"},
                new Category{Name = "Garrison Calendar"},
                new Category{Name = "General Interest"},
                new Category{Name = "Holiday Calendar"},
                new Category{Name = "PKSOI Calendar"},
                new Category{Name = "Social Events And Ceremonies"},
                new Category{Name = "SSI And USAWC Press Calendar"},
                new Category{Name = "SSL Calendar"},
                new Category{Name = "Training And Misc Events"},
                new Category{Name = "USAHEC Calendar"},
                new Category{Name = "USAHEC Facilities Usage Calendar"},
                new Category{Name = "Visits And Tours"},
                new Category{Name = "Weekly Pocket Calendar"},
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();

            Guid cslCategoryId = categories.First(x => x.Name == "CSL Calendar").Id;

            var activities = new List<Activity>
            {
                new Activity
                {
                    Title = "Past Activity 1",
                    Start = DateTime.Now.AddMonths(-2),
                    End = DateTime.Now.AddMonths(-2).AddHours(2),
                    Description = "Activity 2 months ago",
                    CategoryId = cslCategoryId,
                    AllDayEvent = false
                },
                new Activity
                {
                    Title = "Past Activity 2",
                    Start = DateTime.Now.AddMonths(-1),
                    End = DateTime.Now.AddMonths(-1).AddHours(2),
                    Description = "Activity 1 month ago",
                    CategoryId = cslCategoryId,
                    AllDayEvent = false
                },
                new Activity
                {
                    Title = "Future Activity 1 all day",
                    Start = DateTime.Now.AddMonths(1),
                    End = DateTime.Now.AddMonths(1),
                    Description = "Activity 1 month in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = true
                },
                new Activity
                {
                    Title = "Future Activity 2",
                    Start = DateTime.Now.AddMonths(2),
                    End = DateTime.Now.AddMonths(2).AddHours(2),
                    Description = "Activity 2 months in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = false
                },
                new Activity
                {
                    Title = "Future Activity 3 all day",
                    Start = DateTime.Now.AddMonths(3),
                    End = DateTime.Now.AddMonths(3).AddDays(1),
                    Description = "Activity 3 months in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = true
                },
                new Activity
                {
                    Title = "Future Activity 4",
                    Start = DateTime.Now.AddMonths(4),
                    End = DateTime.Now.AddMonths(4).AddHours(2),
                    Description = "Activity 4 months in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = false
                },
                new Activity
                {
                    Title = "Future Activity 5 all day",
                    Start = DateTime.Now.AddMonths(5),
                    End = DateTime.Now.AddMonths(5),
                    Description = "Activity 5 months in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = true
                },
                new Activity
                {
                    Title = "Future Activity 6",
                    Start = DateTime.Now.AddMonths(6),
                    End = DateTime.Now.AddMonths(6).AddHours(2),
                    Description = "Activity 6 months in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = false
                },
                new Activity
                {
                    Title = "Future Activity 7",
                    Start = DateTime.Now.AddMonths(7),
                    End = DateTime.Now.AddMonths(7).AddHours(2),
                    Description = "Activity 7 months in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = false
                },
                new Activity
                {
                    Title = "Future Activity 8",
                    Start = DateTime.Now.AddMonths(8),
                     End = DateTime.Now.AddMonths(8).AddHours(2),
                    Description = "Activity 8 months in future",
                    CategoryId = cslCategoryId,
                    AllDayEvent = false

                }
            };

            await context.Activities.AddRangeAsync(activities);
            await context.SaveChangesAsync();
        }
    }
}
