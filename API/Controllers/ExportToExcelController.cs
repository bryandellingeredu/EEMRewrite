﻿using Microsoft.AspNetCore.Authorization;
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
        [HttpPost("OutsiderReport")]
        public IActionResult CsvOutsiderReport([FromBody] OutsiderReportCSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Start,End,Location,Action Officer,Status,Directorate,Engagement,USAWC Graduate,Visiting DV, Number of People");
            foreach (var data in csvDataList)
            {
                var status = string.IsNullOrEmpty(data.OutsiderReportStatus) ? "Draft" : data.OutsiderReportStatus;
                builder.AppendLine($"\"{data.Title}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{data.ActionOfficer}\",\"{status}\",\"{data.OutsiderReportDirectorate}\",\"{data.OutsiderReportEngagement}\",\"{data.OutsiderReportUSAWCGraduate}\",\"{data.OutsiderReportDV}\",\"{data.OutsiderReportNumOfPeople}\"");
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "outsiderReports.csv");
        }

        [AllowAnonymous]
        [HttpPost("SVTCReport")]
        public IActionResult SVTCReport([FromBody] SVTCReportCSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Start,End,Location,Action Officer,SVTC Classification,Distant Tech Phone,Requestor POC,Dial In Number,Site ID Distant End,Is SES in Attendance,SES Name / Rank,SVTC Info,SVTC Status");
            foreach (var data in csvDataList)
            {
                var status = string.IsNullOrEmpty(data.VTCStatus) ? "Tentative" : data.VTCStatus;
                builder.AppendLine($"\"{data.Title}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{data.ActionOfficer}\",\"{data.VTCClassification}\",\"{data.DistantTechPhoneNumber}\",\"{data.RequestorPOCContactInfo}\",\"{data.DialInNumber}\",\"{data.SiteIDDistantEnd}\",\"{data.GOSESInAttendance}\",\"{data.SeniorAttendeeNameRank}\",\"{data.AdditionalVTCInfo}\",\"{status}\"");
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "svtcReports.csv");
        }

        [AllowAnonymous]
        [HttpPost("CIOEventPlanningReport")]
        public IActionResult CIOEventPlanningReport([FromBody] CIOEventPlanningReportCSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Start,End,Location,Action Officer,POC Name,POC Email,Status,PAX,Set Up Date,Clearance");
            foreach (var data in csvDataList)
            {
                var status = string.IsNullOrEmpty(data.EventPlanningStatus) ? "Pending" : data.EventPlanningStatus;
                var clearance = string.IsNullOrEmpty(data.EventClearanceLevel) ? "Undetermined" : data.EventClearanceLevel;
                builder.AppendLine($"\"{data.Title}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{data.ActionOfficer}\",\"{data.EventPlanningExternalEventPOCName}\",\"{data.EventPlanningExternalEventPOCEmail}\",\"{status}\",\"{data.EventPlanningPAX}\",\"{data.EventPlanningSetUpDate}\",\"{clearance}\"");
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "cioEventPlanningReports.csv");
        }


        [AllowAnonymous]
        [HttpPost("GenericCalendar")]
        public IActionResult GenericCalendar([FromBody] GenericCalendarCSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Start,End,Location,Action Officer,Lead Org");
            foreach (var data in csvDataList)
            {
                builder.AppendLine($"\"{data.Title}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{data.ActionOfficer}\",\"{data.OrganizationName}\"");
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "calendar.csv");
        }

        [AllowAnonymous]
        [HttpPost("USAHECFacilitiesUsageReport")]
        public IActionResult CsvFacilitiesUsageHostingReport([FromBody] USAHECFacilitiesUsageReportCSVData[] csvDataList)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Title,Reservation Type,Start,End,Room/s, USAHEC Contract, Description");
            foreach (var data in csvDataList)
            {
                builder.AppendLine($"\"{data.Title}\",\"{data.USAHECFacilityReservationType}\",\"{data.Start}\",\"{data.End}\",\"{data.Location}\",\"{data.USAHECContract}\",\"{data.Description}\"");
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

             public class GenericCalendarCSVData
          {
            public string Title {get; set;}
            public string Start  {get; set;}
            public string End  {get; set;}
            public string Location  {get; set;}
            public string ActionOfficer  {get; set;}
            public string LeadOrg  {get; set;}
             public string OrganizationName  {get; set;}
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

        public class OutsiderReportCSVData
        {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Location { get; set; }
            public string ActionOfficer { get; set; }
            public string OutsiderReportStatus { get; set; }
            public string OutsiderReportDirectorate { get; set; }
            public string OutsiderReportEngagement { get; set; }
            public string OutsiderReportUSAWCGraduate { get; set; }
            public string OutsiderReportDV { get; set; }
            public string OutsiderReportNumOfPeople { get; set; }
        }

        public class USAHECFacilitiesUsageReportCSVData
        {
            public string Title { get; set; }
            public string USAHECFacilityReservationType { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Location { get; set; }
            public string ActionOfficer { get; set; }
            public string CreatedBy { get; set; }
            public string USAHECContract { get; set; }
            public string Description { get; set; }
        }

        public class SVTCReportCSVData
        {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Location { get; set; }
            public string ActionOfficer { get; set; }
            public string VTCClassification { get; set; }
            public string DistantTechPhoneNumber { get; set; }
            public string RequestorPOCContactInfo { get; set; }
            public string DialInNumber { get; set; }
            public string SiteIDDistantEnd { get; set; }
            public string GOSESInAttendance { get; set; }
            public string SeniorAttendeeNameRank { get; set; }
            public string AdditionalVTCInfo { get; set; }
            public string VTCStatus { get; set; }

        }

        public class CIOEventPlanningReportCSVData
        {
            public string Title { get; set; }
            public string Start { get; set; }
            public string End { get; set; }
            public string Location { get; set; }
            public string ActionOfficer { get; set; }
            public string EventPlanningExternalEventPOCName { get; set; }
            public string EventPlanningExternalEventPOCEmail { get; set; }
            public string EventPlanningStatus { get; set; }
            public string EventPlanningPAX { get; set; }
            public string EventPlanningSetUpDate  {get; set;}
            public string  EventClearanceLevel { get; set; }

        }

    }
}
