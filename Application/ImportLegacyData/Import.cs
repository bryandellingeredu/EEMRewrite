
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Domain;
using System.Globalization;
using CsvHelper;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System.ComponentModel;
using Application.Activities;
using System.Text.RegularExpressions;

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
            private readonly IConfiguration _config;

            public Handler(
             DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
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
                        var organization = new Domain.Organization { Name = newOrg };
                        _context.Organizations.Add(organization);
                    }

                    await _context.SaveChangesAsync();

                    var organizations = await _context.Organizations.ToListAsync();

                    var categories = await _context.Categories.ToListAsync();

                    var titles = await _context.Activities.Select(x => x.Title).Distinct().ToListAsync();   

                    List<Activity> activities = new List<Activity>();
                    foreach (var item in eemDataList
             .Where(x => !string.IsNullOrEmpty(x.Title))
             .Where(x => x.Start >= DateTime.Today.AddMonths(-2))
             .Where(x => (x.End - x.Start).TotalDays <= 60)
             .Where(x => !titles.Contains(x.Title)))
                    {
                        activities.Add(new Activity
                        {
                            Title = RemoveSpecialCharactersAndHtmlTags(item.Title),
                            Start = item.Start,
                            End = item.End,
                            OrganizationId = organizations.Where(x => x.Name == item.LeadOrg).FirstOrDefault()?.Id,
                            CategoryId = GetCategoryId(item.SubCalendar, categories),
                            ActionOfficer = item.ActionOfficer,
                            ActionOfficerPhone = item.ActionOfficerPhone,
                            Description = RemoveSpecialCharactersAndHtmlTags(item.EventDetails),
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

                    foreach (var activity in activities)
                    {
                        foreach (var item in RoomData.Data.Values)
                        {
                            if (activity.PrimaryLocation.Equals(item["OldDisplayName"], StringComparison.OrdinalIgnoreCase))
                            {
                                activity.PrimaryLocation = item["Email"];
                                break;
                            }
                        }
                    }

                    await _context.Activities.AddRangeAsync(activities);

                    await _context.SaveChangesAsync();
     

                    string coordinatorEmail = GraphHelper.GetEEMServiceAccount();


                    foreach (var a in activities)
                    {
                        bool exceptionOccurred = false;
                        foreach (var item in RoomData.Data.Values)
                        {
                            if (a.PrimaryLocation.Equals(item["Email"], StringComparison.OrdinalIgnoreCase) && a.Start > DateTime.Now)  
                            {
                                List<string> roomEmails = new List<string>();
                                roomEmails.Add(item["Email"]);
                                 string startDateAsString = a.Start.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                                string endDateAsString = a.End.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                                    if (a.AllDayEvent)
                                         {
                                            DateTime startDate = DateTime.ParseExact(startDateAsString, "yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                                            DateTime endDate = DateTime.ParseExact(endDateAsString, "yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                                            startDate = startDate.Date;
                                            endDate = endDate.AddDays(1).Date;
                                            startDateAsString = startDate.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                                            endDateAsString = endDate.ToString("yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture);
                                        }
                                    GraphEventDTO graphEventDTO = new GraphEventDTO
                                       {
                                            EventTitle = a.Title,
                                            EventDescription = a.Description,
                                            Start = startDateAsString,
                                            End = endDateAsString,
                                            RoomEmails = roomEmails.ToArray(),
                                            RequesterEmail = coordinatorEmail,
                                            RequesterFirstName = "EEMServiceAccount",
                                             RequesterLastName = "EEMServiceAccount",
                                            IsAllDay = a.AllDayEvent,
                                             UserEmail = coordinatorEmail
                                      };
                                      try
                                        {
                                            Event evt = await GraphHelper.CreateEvent(graphEventDTO);
                                            var activityToUpdate = await _context.Activities.FindAsync(a.Id);
                                            if (activityToUpdate != null) { 
                                                activityToUpdate.EventLookup= evt.Id;
                                                await _context.SaveChangesAsync();
                                            }
                                             break;
                                        }
                                        catch (Exception e)
                                        {
                                           var exc = e;
                                          exceptionOccurred = true; // Set the flag to true
                                         break;
                                }
                            }
                        }
                        if (exceptionOccurred) // Check if an exception occurred
                        {
                            continue; // Continue with the next 'a' in activities
                        }
                    }

                     return Result<Unit>.Success(Unit.Value);
                }
                        
            }

            private bool GetIMC(bool iMC, string subCalendar) => iMC || new List<string> {
                "Academic Calendar", "ASEP Calendar", "Command Group Calendar", "Garrison Calendar", "Chapel", "General Interest",
                "Holiday Calendar", "Training & Misc Events" }.Contains(subCalendar);

            public static string RemoveSpecialCharactersAndHtmlTags(string input)
            {
                if (string.IsNullOrEmpty(input))
                {
                    return string.Empty;
                }

                // Remove HTML tags
                var regexHtml = new Regex("<.*?>", RegexOptions.Compiled);
                var withoutHtml = regexHtml.Replace(input, string.Empty);

                // Remove special characters
                var regexSpecial = new Regex("[^a-zA-Z0-9 _-]", RegexOptions.Compiled);
                var cleaned = regexSpecial.Replace(withoutHtml, string.Empty);

                return cleaned;
            }

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