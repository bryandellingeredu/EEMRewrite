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
                  new EmailGroup {Name = "Event Clearence Level POC"},
                  new EmailGroup {Name = "Bliss Hall AV Tech"},
                  new EmailGroup {Name = "Command Conference Room Setup"},
                  new EmailGroup {Name = "Flag Support Needed"},
                  new EmailGroup {Name = "Hosting Report Added"},
                  new EmailGroup {Name = "Outsider Report Added"},
                  new EmailGroup {Name = "Office Call With Commandant"},
                  new EmailGroup {Name = "Parking Requirements Needed"},
                  new EmailGroup {Name = "Foreign Guest is Visiting the USAWC"},               
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
                    new RoomDelegate {RoomEmail = "BlissHallTestAuditorium @armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu",DelegateDisplayName="Robert Hoss"},
                    new RoomDelegate {RoomEmail = "CollinsHallTestRoom2@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu", DelegateDisplayName="Robert Hoss"},
                    new RoomDelegate {RoomEmail = "RootHallTestRoom1@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu", DelegateDisplayName="Robert Hoss"},
                    new RoomDelegate {RoomEmail = "AnneElyHallTestRoom1@armywarcollege.edu", DelegateEmail="robert.h.hoss@armywarcollege.edu" ,DelegateDisplayName="Robert Hoss"},
                    new RoomDelegate {RoomEmail = "AnneElyHallTestRoom1@armywarcollege.edu", DelegateEmail="mauricio.velasquezhussein@armywarcollege.edu" ,DelegateDisplayName="Mauricio Velasquez"},
                    new RoomDelegate {RoomEmail = "CollinsHallB015ConferenceTable@armywarcollege.edu", DelegateEmail="bryan.dellinger.civ@armywarcollege.edu" ,DelegateDisplayName="Bryan Dellinger"},
                    new RoomDelegate {RoomEmail = "BryanRoom@armywarcollege.edu", DelegateEmail="bryan.dellinger.civ@armywarcollege.edu" ,DelegateDisplayName="Bryan Dellinger"},
                    new RoomDelegate {RoomEmail = "JoanTestRoom@armywarcollege.edu", DelegateEmail="derrick.simon@armywarcollege.edu",DelegateDisplayName="Derrick Simon"},
                    new RoomDelegate {RoomEmail = "JoanTestRoom@armywarcollege.edu", DelegateEmail="eddie.rogers@armywarcollege.edu" ,DelegateDisplayName="Eddie Rogers"},
                    new RoomDelegate {RoomEmail = "JoanTestRoom2@armywarcollege.edu", DelegateEmail="eddie.rogers@armywarcollege.edu",DelegateDisplayName="Eddie Rogers"},
               };
                await context.RoomDelegates.AddRangeAsync(roomDelegates);
                await context.SaveChangesAsync();
            }


            if (!context.Categories.Any()){
                var categories = new List<Category>
                {
                     new Category { Name = "Academic IMC Event", RouteName = "academic", IMCColor = "#FF0000", IncludeInIMC = true },
    new Category { Name = "ASEP Calendar", RouteName = "asep", IncludeInIMC = true, IMCColor = "#FF7F00" },
    new Category { Name = "Chapel", RouteName = "chapel", IMCColor = "#c9b60a", IncludeInIMC = true },
    new Category { Name = "Command Group Calendar", RouteName = "commandGroup", IMCColor = "#128712", IncludeInIMC = true },
    new Category { Name = "Complemenary Events", RouteName = "complementary", IMCColor = "#1095a3" },
    new Category { Name = "Community Relations", RouteName = "community", IMCColor = "#0000FF" },
    new Category { Name = "CSL Calendar", RouteName = "csl", IMCColor = "#4B0082" },
    new Category { Name = "Garrison Calendar", RouteName = "garrison", IMCColor = "#9400D3", IncludeInIMC = true },
    new Category { Name = "General Interest", RouteName = "GeneralInterest", IMCColor = "#8B008B", IncludeInIMC = true },
    new Category { Name = "Holiday Calendar", RouteName = "holiday", IMCColor = "#8B0000", IncludeInIMC = true },
    new Category { Name = "Other", RouteName = "other", IMCColor = "#966b05" },
    new Category { Name = "PKSOI Calendar", RouteName = "pksoi", IMCColor = "#a89448" },
    new Category { Name = "Social Events And Ceremonies", RouteName = "socialEventsAndCeremonies", IMCColor = "#6B8E23" },
    new Category { Name = "SSI And USAWC Press Calendar", RouteName = "ssiAndUsawcPress", IMCColor = "#32CD32" },
    new Category { Name = "SSL Calendar", RouteName = "ssl", IMCColor = "#228B22" },
    new Category { Name = "Training And Misc Events", RouteName = "trainingAndMiscEvents", IMCColor = "#064027", IncludeInIMC = true },
    new Category { Name = "USAHEC Calendar", RouteName = "usahec", IMCColor = "#2d9677" },
    new Category { Name = "USAHEC Facilities Usage Calendar", RouteName = "usahecFacilitiesUsage", IMCColor = "#5f9c91" },
    new Category { Name = "Visits And Tours", RouteName = "visitsAndTours", IMCColor = "#007FFF" },
    new Category { Name = "Weekly Pocket Calendar", RouteName = "weeklyPocket", IMCColor = "#0000FF" },
    new Category { Name = "Symposium and Conferences Calendar", RouteName = "symposiumAndConferences", IMCColor = "#8B008B" },
    new Category { Name = "Military Family and Spouse Program", RouteName = "militaryFamilyAndSpouseProgram", IMCColor = "#584a66" }
            };
                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            if(!context.CSLCalendarLegends.Any()){
                var cslCalendarLegends = new List<CSLCalendarLegend>{
                    new CSLCalendarLegend{Name = "Info Event", Color = "#D7C8A0"},
                    new CSLCalendarLegend{Name = "Event On-Site", Color = "#5E973F"},
                    new CSLCalendarLegend{Name = "Event Off-Site", Color = "#AB8D00"},
                    new CSLCalendarLegend{Name = "Leave", Color = "#3F3D2E"},
                    new CSLCalendarLegend{Name = "TDY", Color = "#7D86F6"},
                    new CSLCalendarLegend{Name = "Holiday", Color = "#DD8381"},
                    new CSLCalendarLegend{Name = "VTC", Color = "#E88800"},
                    new CSLCalendarLegend{Name = "Task", Color = "#BC64E6"},
                    new CSLCalendarLegend{Name = "Farewell", Color = "#E75AFF"},
                    new CSLCalendarLegend{Name = "Highlight", Color = "#4C00FF"},
                    new CSLCalendarLegend{Name = "Set Up", Color = "#7f00ff"},
                    new CSLCalendarLegend{Name = "Copied to IMC Border Color", Color = "#EE4B2B"},
                    new CSLCalendarLegend{Name = "Pending OPS Approval", Color = "#F6BE00"},

                };
                await context.CSLCalendarLegends.AddRangeAsync(cslCalendarLegends);
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
                new Organization {Name = "PROVOST"},

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
    }
  }
}
