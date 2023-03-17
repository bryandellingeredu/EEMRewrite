using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace API.Controllers

{
    public class ExportToExcelController : BaseApiController
    {

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Csv([FromBody] CSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Description,Start,End,Location,Action Officer,Lead Org, Sub Calendar");
            foreach (var data in csvDataList)
            {
                builder.AppendLine($"\"{data.Title}\",\"{data.Description}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{data.ActionOfficer}\",\"{data.LeadOrg}\",\"{data.SubCalendar}\"");
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "eemevents.csv");
        }

        [AllowAnonymous]
        [HttpPost("HostingReport")]
        public IActionResult CsvHostingReport([FromBody] HostingReportCSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Start,End,Location,Status,Rank,Title / Org,Lead Org, Action Officer, Created By");
            foreach (var data in csvDataList)
            {
                var status = string.IsNullOrEmpty(data.HostingReportStatus) ? "Draft" : data.HostingReportStatus;
                builder.AppendLine($"\"{data.Title}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{status}\",\"{data.GuestRank}\",\"{data.GuestTitle}\",\"{data.OrganizationName}\",\"{data.ActionOfficer}\",\"{data.CreatedBy}\"");
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "hostingReports.csv");
        }

        [AllowAnonymous]
        [HttpPost("USAHECFacilitiesUsageReport")]
        public IActionResult CsvFacilitiesUsageHostingReport([FromBody] USAHECFacilitiesUsageReportCSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Start,End,Room/s, Action Officer, Created By");
            foreach (var data in csvDataList)
            {
                builder.AppendLine($"\"{data.Title}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{data.ActionOfficer}\",\"{data.CreatedBy}\"");
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "USAHECFacilitiesUsageReport.csv");
        }





        public class CSVData
          {
            public string Title {get; set;}
            public string Description  {get; set;}
            public string Start  {get; set;}
            public string End  {get; set;}
            public string Location  {get; set;}
            public string ActionOfficer  {get; set;}
            public string LeadOrg  {get; set;}
            public string SubCalendar  {get; set;}
        }

           public class HostingReportCSVData
          {
            public string Title {get; set;}
            public string Start  {get; set;}
            public string End  {get; set;}
            public string Location  {get; set;}
            public string ActionOfficer  {get; set;}
            public string OrganizationName  {get; set;}
            public string HostingReportStatus  {get; set;}
             public string GuestRank {get; set;}
            public string GuestTitle {get; set;}
            public string CreatedBy {get; set;}
        }

        public class USAHECFacilitiesUsageReportCSVData
        {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Location { get; set; }
            public string ActionOfficer { get; set; }
            public string CreatedBy { get; set; }
        }

    }
}
