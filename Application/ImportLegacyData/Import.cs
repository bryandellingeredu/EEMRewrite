﻿
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using System.Globalization;
using CsvHelper;


namespace Application.ImportLegacyData
{
    public class Import
    {
        public class Command : IRequest<Result<Unit>>
        {
           
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(
             DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                List<LegacyEEMData> eemDataList = new List<LegacyEEMData>();
                var buildDir = "C:\\Users\\Bryan.Dellinger.Apps\\Documents\\EEMRewriteEDU\\EEMRewrite\\Application\\ImportLegacyData";
                using (var reader = new StreamReader(buildDir + "\\LegacyEEMData.csv"))
                using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
                {
                    csv.Context.RegisterClassMap<LegacyEEMDataMap>();
                    eemDataList = csv.GetRecords<LegacyEEMData>().ToList();

                    var leadOrgs = eemDataList.Where(x => !string.IsNullOrEmpty(x.LeadOrg)).Select(x => x.LeadOrg).Distinct().ToList();

                    var subCalendars = eemDataList.Where(x => !string.IsNullOrEmpty(x.SubCalendar)).Select(x => x.SubCalendar).Distinct().ToList();

                    var existingOrgs = await _context.Organizations.Select(x => x.Name).ToListAsync();

                    // Find leadOrgs that are not in existingOrgs
                    var newOrgs = leadOrgs.Except(existingOrgs).ToList();

                    // Insert the new organizations into context.Organizations
                    foreach (var newOrg in newOrgs)
                    {
                        var organization = new Organization { Name = newOrg };
                        _context.Organizations.Add(organization);
                    }

                    await _context.SaveChangesAsync();

                    var organizations = await _context.Organizations.ToListAsync();

                    var categories = await _context.Categories.ToListAsync();

                    var titles = await _context.Activities.Select(x => x.Title).Distinct().ToListAsync();   

                    List<Activity> activities = new List<Activity>();   
                    foreach (var item in eemDataList.Where(x => !string.IsNullOrEmpty(x.Title)).Where(x => x.Start >= DateTime.Today).Where(x => !titles.Contains(x.Title)))
                    {
                        activities.Add(new Activity
                        {
                            Title = item.Title,
                            Start = item.Start,
                            End = item.End,
                            OrganizationId = organizations.Where(x => x.Name == item.LeadOrg).FirstOrDefault()?.Id,
                            CategoryId = GetCategoryId(item.SubCalendar, categories),
                            ActionOfficer = item.ActionOfficer,
                            ActionOfficerPhone = item.ActionOfficerPhone,
                            Description = item.EventDetails,
                            PrimaryLocation = !string.IsNullOrEmpty(item.Resources) ? item.Resources : item.Location,
                            AllDayEvent = item.AllDayEvent || item.Start.Date != item.End.Date,
                            IMC = GetIMC(item.IMC, item.SubCalendar),
                            CopiedToacademic = item.SubCalendar == "Academic Calendar",
                            CopiedToasep = item.SubCalendar == "ASEP Calendar",
                            CopiedTocommandGroup = item.SubCalendar == "Command Group Calendar",
                            CopiedTocommunity = item.SubCalendar == "Community Relations" || item.CommunityEvent,
                            CopiedTocsl = item.SubCalendar == "CSL Calendar",
                            CopiedTogarrison = item.SubCalendar == "Garrison Calendar" || item.SubCalendar == "Chapel",
                            CopiedTogeneralInterest= item.SubCalendar == "General Interest",
                            CopiedToholiday= item.SubCalendar == "Holiday Calendar",
                            CopiedTopksoi= item.SubCalendar == "PKSOI Calendar",
                            CopiedTosocialEventsAndCeremonies= item.SubCalendar == "Social Events & Ceremonies",
                            CopiedTossiAndUsawcPress=item.SubCalendar == "SSI and USAWC Press Calendar",
                            CopiedTossl=item.SubCalendar == "SSL Calendar",
                            CopiedTotrainingAndMiscEvents= item.SubCalendar == "Training & Misc Events",
                            CopiedTousahec= item.SubCalendar == "USAHEC Calendar" || item.CopiedToUSAHECCalendar,
                            CopiedTousahecFacilitiesUsage= item.SubCalendar == "USAHEC Facilities Usage Calendar",
                            CopiedTovisitsAndTours= item.SubCalendar == "Visits And Tours",
                            CateringBreakArea22=item.CateringBreakArea22,
                            CateringBreakArea18=item.CateringBreakArea18,
                            CheckedForOpsec=item.CheckedForOpsec,
                            CommunityEvent=item.CommunityEvent,
                            GarrisonCategory=item.GarrisonCategory,
                            GOSESInAttendance=item.GOSESInAttendance,
                            USAHECCalendarCategory=item.USAHECCalendarCategory,
                            USAHECDirectorate=item.USAHECDirectorate,
                            EducationalCategory=item.EducationalCategory,
                            EventClearanceLevel=item.EventClearanceLevel == "Undetermined" ? string.Empty : item.EventClearanceLevel,
                            MarketingRequest=item.MarketingRequest,
                            MFP = item.MFP,
                            SSLCategories = item.SSLCategories,
                            ApprovedByOPS=item.ApprovedByOPS,
                            Education = item.Education,
                            CreatedAt = DateTime.Now,
                            CreatedBy = "LegacyData@army.mil",
                           CoordinatorDisplayName="Imported from Legacy Data",
                           CoordinatorEmail = "LegacyData@army.mil",
                           CoordinatorFirstName="Legacy Data",
                           CoordinatorLastName="Legacy Data"
                        }); 
                    }

                   await _context.Activities.AddRangeAsync(activities);

                    await _context.SaveChangesAsync();

                    return Result<Unit>.Success(Unit.Value);
                }
                        
            }

            private bool GetIMC(bool iMC, string subCalendar) => iMC || new List<string> {
                "Academic Calendar", "ASEP Calendar", "Command Group Calendar", "Garrison Calendar", "Chapel", "General Interest",
                "Holiday Calendar", "Training & Misc Events" }.Contains(subCalendar);
            


            private Guid GetCategoryId(string subCalendar, List<Category> categories)
            {
                string categoryName;

                switch (subCalendar)
                {
                    case "Garrison Calendar":
                        categoryName = "Garrison Calendar";
                        break;
                    case "USAHEC Facilities Usage Calendar":
                        categoryName = "USAHEC Facilities Usage Calendar";
                        break;
                    case "USAHEC Calendar":
                        categoryName = "USAHEC Calendar";
                        break;
                    case "Social Events & Ceremonies":
                        categoryName = "Social Events And Ceremonies";
                        break;
                    case "SLDR Calendar":
                        categoryName = "Other"; 
                        break;
                    case "SSI and USAWC Press Calendar":
                        categoryName = "SSI And USAWC Press Calendar";
                        break;
                    case "CSL Calendar":
                        categoryName = "CSL Calendar";
                        break;
                    case "Command Group Calendar":
                        categoryName = "Command Group Calendar";
                        break;
                    case "Academic Calendar":
                        categoryName = "Academic IMC Event";
                        break;
                    case "General Interest":
                        categoryName = "General Interest";
                        break;
                    case "Chapel":
                        categoryName = "Garrison Calendar"; 
                        break;
                    case "Holiday Calendar":
                        categoryName = "Holiday Calendar";
                        break;
                    case "Training & Misc Events":
                        categoryName = "Training";
                        break;
                    case "SSL Calendar":
                        categoryName = "SSL Calendar";
                        break;
                    case "ASEP Calendar":
                        categoryName = "ASEP Calendar";
                        break;
                    case "Community Relations":
                        categoryName = "Community Event (External)";
                        break;
                    case "Complementary Events":
                        categoryName = "Other"; // Assuming Complementary Events maps to Other
                        break;
                    case "Weekly Pocket Calendar":
                        categoryName = "Other"; // Assuming Weekly Pocket Calendar maps to Other
                        break;
                    case "PKSOI Calendar":
                        categoryName = "PKSOI Calendar";
                        break;
                    case "Visits and Tours":
                        categoryName = "Visits And Tours";
                        break;
                    default:
                        categoryName = "Other";
                        break;
                }

                var category = categories.FirstOrDefault(c => c.Name == categoryName);
                if (category != null)
                {
                    return category.Id;
                }
                else
                {
                    throw new ArgumentException($"No matching category found for {subCalendar}");
                }
            }
        }


    }
}