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
    }
}
