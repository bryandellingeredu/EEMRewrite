using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            if(!roleManager.Roles.Any())
            {
                await roleManager.CreateAsync(new IdentityRole() { Name = "admin" });
            }

            if (!userManager.Users.Any())
            {
                var users = new List<AppUser>
                {
                    new AppUser
                    {
                        DisplayName = "Dellinger, Bryan Mr",
                        UserName = "bryan.dellinger.civ@armywarcollege.edu",
                        Email = "bryan.dellinger.civ@armywarcollege.edu"
                    },
                      new AppUser
                    {
                        DisplayName = "Mr. Robert H. Hoss",
                        UserName = "robert.h.hoss@armywarcollege.edu",
                        Email = "robert.h.hoss@armywarcollege.edu"
                    },
                };

                foreach (var user in users)
                {
                    user.EmailConfirmed = true;
                    await userManager.CreateAsync(user);
                    await userManager.AddToRoleAsync(user, "admin");
                }

            }

            if(!context.EmailGroups.Any())
            {
                var emailGroups = new List<EmailGroup>
                {
                  new EmailGroup {Name = "Request Commandt Presence"},
                  new EmailGroup {Name = "Request Provost Presence"},
                  new EmailGroup {Name = "Request Dep Cmdt Presence"},
                  new EmailGroup {Name = "Request Cofs Presence"},
                  new EmailGroup {Name = "Request Deans Presence"},
                  new EmailGroup {Name = "Request Ambassador Presence"},
                  new EmailGroup {Name = "Event Clearence Level POC"}
                };

                await context.EmailGroups.AddRangeAsync(emailGroups);
                await context.SaveChangesAsync();
            }

            if(!context.EmailGroupMembers.Any())
            {
              var emailGroupMembers = new List<EmailGroupMember>
              {
                new EmailGroupMember {DisplayName = "Dellinger, Bryan Mr", Email = "bryan.dellinger.civ@armywarcollege.edu"}
              };
               await context.EmailGroupMembers.AddRangeAsync(emailGroupMembers);
               await context.SaveChangesAsync();
            }
            
            if(!context.EmailGroupEmailGroupMemberJunctions.Any())
            {
              var emailGroupEmailGroupMemberJunctions = new List<EmailGroupEmailGroupMemberJunction>();
              var emailGroupMember = await context.EmailGroupMembers.Where(x => x.Email == "bryan.dellinger.civ@armywarcollege.edu").FirstOrDefaultAsync();
              foreach (var item in context.EmailGroups)
              {
                emailGroupEmailGroupMemberJunctions.Add(new EmailGroupEmailGroupMemberJunction{EmailGroupMemberId = emailGroupMember.Id, EmailGroupId = item.Id});
              }
              await context.EmailGroupEmailGroupMemberJunctions.AddRangeAsync(emailGroupEmailGroupMemberJunctions);
              await context.SaveChangesAsync();

            }
          
        

            if (!context.RoomDelegates.Any())
            {
                var roomDelegates = new List<RoomDelegate>
                { 
                    new RoomDelegate {RoomEmail = "BlissHallTestAuditorium @armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "ReynoldsTheater@armywarcollege.edu ", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "USAHECVECTestRoom1@armywarcollege.edu ", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "USAHECConservationFacility@armywarcollege.edu ", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "USAHECArmyHeritageTrailTestStation@armywarcollege.edu ", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "USAHECRidgwayHallTestConferenceRoom@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "UptonHallTestConfRoom@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "TestRoom5@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "RootHallTestRoom2@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "CollinsHallTestRoom2@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "RootHallTestRoom1@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "Bldg315TestConferenceRoom@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "Bldg632TestConfRoom@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "CollinsHallTestRoom1Rm1015@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "ArmstrongHallTestRoom1@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "Bldg47TestRoom1@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "AnneElyHallTestRoom1@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "TestRoom4@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "CollinsHallB015ConferenceTable@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "BryanRoom@armywarcollege.edu", DelegateEmail="bryan.dellinger.civ@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "experimental.classroom@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "will.washcoe@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "one.button@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "library.collaboration2@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                    new RoomDelegate {RoomEmail = "library.collaboration1@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                     new RoomDelegate {RoomEmail = "upton@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                     new RoomDelegate {RoomEmail = "ccr@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                      new RoomDelegate {RoomEmail = "mary.walker@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                      new RoomDelegate {RoomEmail = "JoanTestRoom2@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
                      new RoomDelegate {RoomEmail = "JoanTestRoom@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu"},
               };
                await context.RoomDelegates.AddRangeAsync(roomDelegates);
                await context.SaveChangesAsync();
            }


            if (!context.Categories.Any()){
                var categories = new List<Category>
            {
                new Category{Name = "Academic Calendar"},
                new Category{Name = "Academic IMC Event", RouteName = "academic", IMCColor = "#4183C4", IncludeInIMC = true},
                new Category{Name = "ASEP Calendar", RouteName = "asep", IncludeInIMC = true},
                new Category{Name = "Chapel", RouteName = "chapel", IMCColor = "#CD5C5C", IncludeInIMC = true},
                new Category{Name = "Command Group Calendar", RouteName = "commandGroup"},
                new Category{Name = "Complemenary Events", RouteName = "complementary" },
                new Category{Name = "Community Relations", RouteName = "community" },
                new Category{Name = "CSL Calendar", RouteName = "csl", IMCColor = "#787271" },
                new Category{Name = "Garrison Calendar", RouteName = "garrison", IMCColor = "#008284", IncludeInIMC = true },
                new Category{Name = "General Interest", RouteName = "generalInterest", IMCColor = "#8FBC8B", IncludeInIMC = true},
                new Category{Name = "Holiday Calendar", RouteName = "holiday", IMCColor = "#FF0000", IncludeInIMC = true },
                new Category{Name = "Other", RouteName = "other" },
                new Category{Name = "PKSOI Calendar", RouteName = "pksoi", IMCColor = "#F7B268"},
                new Category{Name = "Social Events And Ceremonies", RouteName = "socialEventsAndCeremonies"},
                new Category{Name = "SSI And USAWC Press Calendar", RouteName = "ssiAndUsawcPress", IMCColor = "#6B4EAD"},
                new Category{Name = "SSL Calendar", RouteName = "ssl", IMCColor = "#D5B800"},
                new Category{Name = "Training And Misc Events", RouteName = "trainingAndMiscEvents", IMCColor = "#DEB887", IncludeInIMC = true},
                new Category{Name = "USAHEC Calendar", RouteName = "usahec", IMCColor = "#755070"},
                new Category{Name = "USAHEC Facilities Usage Calendar", RouteName = "usahecFacilitiesUsage", IMCColor = "#B0AA0C"},
                new Category{Name = "Visits And Tours", RouteName = "visitsAndTours"},
                new Category{Name = "Weekly Pocket Calendar", RouteName = "weeklyPocket", IMCColor = "#71B559"}
            };
                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            if (!context.Organizations.Any())
            {
                var organizations = new List<Organization>
            {
                new Organization {Name = "AHEC"},
                new Organization {Name = "ASEP"},
                new Organization {Name = "CSL"},
                new Organization {Name = "DUNHAM"},
                new Organization {Name = "SSI"},
                new Organization {Name = "SSL"},
                new Organization {Name = "PKSOI"},
                new Organization {Name = "USAG"},
                new Organization {Name = "G1"},
                new Organization {Name = "G2"},
                new Organization {Name = "G3"},
                new Organization {Name = "G4"},
                new Organization {Name = "G6"},
                new Organization {Name = "G8"},
                new Organization {Name = "G9"},
                new Organization {Name = "CPAC"},
                new Organization {Name = "Exec Svc"},
                new Organization {Name = "CoS"},
                new Organization {Name = "PA/LL"},

            };
                await context.Organizations.AddRangeAsync(organizations);
                await context.SaveChangesAsync();
            }

            if (!context.Locations.Any())
            {
                var locations = new List<Location>
            {
                  new Location {Name = "ACOM"},
                  new Location {Name = "Anne Ely Hall"},
                  new Location {Name = "Ashburne Gate"},
                  new Location {Name = "Bliss Hall"},
                  new Location {Name = "Bliss Hall and Root Hall"},
                  new Location {Name = "Bradley Auditorium, Upton Hall"},
                  new Location {Name = "CBKs Chapel"},
                  new Location {Name = "CBKs Memorial Chapel"},
                  new Location {Name = "CCR"},
                  new Location {Name = "Collins Hall"},
                  new Location {Name = "Collins Hall, Cherbourg Room"},
                  new Location {Name = "Commissary"},
                  new Location {Name = "CSL"},
                  new Location {Name = "Delaney Field Clubhouse"},
                  new Location {Name = "Education Center, Bldg 632"},
                  new Location {Name = "Garrison Conf Room"},
                  new Location {Name = "G3 Conference Room"},
                  new Location {Name = "G8 Conference Room"},
                  new Location {Name = "Gettysburg"},
                  new Location {Name = "Gettysburg - CSL"},
                  new Location {Name = "Indian Field"},
                  new Location {Name = "IOC"},
                  new Location {Name = "Letort View Community Center"},
                  new Location {Name = "LVCC"},
                  new Location {Name = "McConnell Youth Center"},
                  new Location {Name = "Mary Walker Room"},
                  new Location {Name = "PKSOI"},
                  new Location {Name = "Quarters One"},
                  new Location {Name = "Reynolds Theater"},
                  new Location {Name = "Root Hall"},
                  new Location {Name = "Root Hall Gym"},
                  new Location {Name = "SB15"},
                  new Location {Name = "Splash Zone Pool"},
                  new Location {Name = "SSL"},
                  new Location {Name = "Strike Zone Bowling Center"},
                  new Location {Name = "Thorpe Gym"},
                  new Location {Name = "Tiki Bar"},
                  new Location {Name = "Upton Hall"},
                  new Location {Name = "Upton Hall Steps"},
                  new Location {Name = "USAHEC"},
                  new Location {Name = "USAHEC - VEC"},
                  new Location {Name = "USAHEC - Ridgway Hall"},
                  new Location {Name = "USAHEC - Army Heritage Trail"},
                  new Location {Name = "USAHEC - Cafe Cumberland"},
                  new Location {Name = "USAWC - Library"},
                  new Location {Name = "Wheelock Bandstand"},
                  new Location {Name = "Will Washcoe Auditorium WWA"},
                  new Location {Name = "Youth Services"},
                  new Location {Name = "Washington DC"},
            };
                await context.Locations.AddRangeAsync(locations);
                await context.SaveChangesAsync();
            }        

        //    if (!context.Activities.Any()) { 

        //    Guid cslCategoryId = context.Categories.First(x => x.Name == "CSL Calendar").Id;

        //    var activities = new List<Activity>
        //    {
        //        new Activity
        //        {
        //            Title = "LTG Jarrad Visit",
        //            Start = new DateTime(2022,9,1, 0, 0, 0 ),
        //            End = new DateTime(2022,9,1, 23, 59, 59 ),
        //            Description = "LTG Jarrad Visit - Will be in suite 3018 SIPR access",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = true,
        //            OrganizationId = context.Organizations.First(x => x.Name == "CSL").Id,
        //            ActionOfficer = "Tania Beecher",
        //            ActionOfficerPhone = "245 -3258",
        //            PrimaryLocation = "Main Entrance"
                    
        //        },
        //        new Activity
        //        {
        //            Title = "Golf Course Outing",
        //            Start = new DateTime(2022,9,1, 13, 30, 0 ),
        //            End = new DateTime(2022,9,1, 16, 00, 00 ),
        //            Description = "Golf Course Outing POC CJ 245145",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = false,
        //            OrganizationId = context.Organizations.First(x => x.Name == "CSL").Id,
        //            ActionOfficer = "Tania Beecher",
        //            ActionOfficerPhone = "245 -3258",
        //            PrimaryLocation = "CB Golf Course"
        //        },
        //        new Activity
        //        {
        //            Title = "Labor Day DONSA/Training Holiday",
        //             Start = new DateTime(2022,9,2, 0, 0, 0 ),
        //            End = new DateTime(2022,9,2, 23, 59, 59 ),
        //            Description = "Labor Day DONSA/Training Holiday",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = true,
        //            OrganizationId = context.Organizations.First(x => x.Name == "CSL").Id,
        //            ActionOfficer = "Duetsch",
        //            ActionOfficerPhone = "4611"
        //        },
        //        new Activity
        //        {
        //          Title = "USAWC BR Week 6",
        //             Start = new DateTime(2022,9,4, 0, 0, 0 ),
        //            End = new DateTime(2022,9,4, 23, 59, 59 ),
        //            Description = "USAWC Battle Rhythym Week 6",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = true,
        //            ActionOfficer = "Duetsch",
        //            ActionOfficerPhone = "4611",
        //            PrimaryLocation = "Collins Hall"
        //        },
        //        new Activity
        //        {
        //            Title = "Labor Day Federal Holiday",
        //             Start = new DateTime(2022,9,5, 0, 0, 0 ),
        //            End = new DateTime(2022,9,5, 23, 59, 59 ),
        //            Description = "Labor Day Federal Holiday",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = true,
        //            OrganizationId = context.Organizations.First(x => x.Name == "CSL").Id,
        //            ActionOfficer = "Mr. Wade",
        //            ActionOfficerPhone = "245-3258",
        //            PrimaryLocation = "CSL"
        //        },
        //        new Activity
        //        {
        //            Title = "CSL Director's Meeting ",
        //            Start = new DateTime(2022,9,6, 11, 00, 0 ),
        //            End = new DateTime(2022,9,6, 13, 00, 00 ),
        //            Description = "Director's Meeting",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = false,
        //            OrganizationId = context.Organizations.First(x => x.Name == "CSL").Id,
        //            ActionOfficer = "Hill / Mcalister",
        //            ActionOfficerPhone = "4534 / 4412"
        //        },
        //        new Activity
        //        {
        //         Title = "Plan Power Outage Conditions Check ",
        //            Start = new DateTime(2022,9,6, 13, 45, 0 ),
        //            End = new DateTime(2022,9,6, 14, 45, 00 ),
        //            Description = "Plan Power Outage Conditions Check",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = false,
        //            OrganizationId = context.Organizations.First(x => x.Name == "CSL").Id,
        //            ActionOfficer = "Duetsch",
        //            ActionOfficerPhone = "-4611",
        //            PrimaryLocation = "Collins Hall"
        //        },
        //        new Activity
        //        {
        //           Title = "BSAP Exercise (GO) ",
        //            Start = new DateTime(2022,9,6, 14, 00, 0 ),
        //            End = new DateTime(2022,9,6, 17, 00, 00 ),
        //            Description = "Plan Power Outage Conditions Check",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = false,
        //            OrganizationId = context.Organizations.First(x => x.Name == "SSL").Id,
        //            ActionOfficer = "Monique Banks",
        //            ActionOfficerPhone = "717-245-3488"
        //        },
        //        new Activity
        //        {
        //           Title = "DTRA SR LDR Conference Set-up",
        //             Start = new DateTime(2022,9,7, 0, 0, 0 ),
        //            End = new DateTime(2022,9,11, 23, 59, 59 ),
        //            Description = "DTRA SR LDR Conference Set-up",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = true,
        //            OrganizationId = context.Organizations.First(x => x.Name == "CSL").Id,
        //            ActionOfficer = "Duetsch",
        //            ActionOfficerPhone = "-4611 / 3258"
        //        },
        //        new Activity
        //        {
        //            Title = "B037-USAREUR-AF TASC PLanninc Discussion ",
        //            Start = new DateTime(2022,9,8, 8, 30, 0 ),
        //            End = new DateTime(2022,9,8, 10, 30, 00 ),
        //            Description = "Discussion with USAREUR-AF team ahead of Junary 2023 TASC",
        //            CategoryId = cslCategoryId,
        //            AllDayEvent = false,
        //            OrganizationId = context.Organizations.First(x => x.Name == "SSL").Id,
        //            ActionOfficer = "Mark Haseman",
        //            ActionOfficerPhone = "961-2266"

        //        }
        //    };

        //    await context.Activities.AddRangeAsync(activities);
        //    await context.SaveChangesAsync();
        //}
    }
  }
}
