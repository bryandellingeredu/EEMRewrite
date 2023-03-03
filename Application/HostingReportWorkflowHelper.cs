using Domain;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application
{
    public class HostingReportWorkflowHelper
    {
        private Activity _activity;
        private HostingReport _hostingReport;
        private readonly DataContext _context;
        private readonly Settings _settings;
        private string GetStartTime() => _activity.AllDayEvent ? _activity.Start.ToString("MMMM dd, yyyy") : _activity.Start.ToString("MMMM dd, yyyy h:mm tt");
        private string GetEndTime() => _activity.AllDayEvent ? _activity.End.ToString("MMMM dd, yyyy") : _activity.End.ToString("MMMM dd, yyyy h:mm tt");
        private string[] GetEmails(string name) => _context.EmailGroups.Include(x => x.EmailGroupMembers).Where(x => x.Name == name).SelectMany(x => x.EmailGroupMembers.Select(m => m.EmailGroupMember.Email)).ToArray();

        private string GetHostingReportDetails() =>$@"<h2>Hosing Report Details</h2><p></p>
                             <p><strong>Title: </strong> {_activity.Title} </p>
                             <p><strong>Start Time: </strong> {GetStartTime()} </p>
                              <p><strong>End Time: </strong> {GetEndTime()} </p> "
                       + (_activity.OrganizationId == null ? "" : $" <p><strong>Lead Org: </strong> {_context.Organizations.Find(_activity.OrganizationId).Name} </p>")
                       + (string.IsNullOrEmpty(_activity.ActionOfficer) ? "" : $" <p><strong>Action Officer: </strong> {_activity.ActionOfficer} </p>")
                       + (string.IsNullOrEmpty(_activity.ActionOfficerPhone) ? "" : $" <p><strong>Action Officer Phone: </strong> {_activity.ActionOfficerPhone} </p>")
                       + (string.IsNullOrEmpty(_hostingReport.EscortOfficer) ? "" : $" <p><strong>Escort Officer: </strong> {_hostingReport.EscortOfficer} </p>")
                       + (string.IsNullOrEmpty(_hostingReport.EscortOfficerPhone) ? "" : $" <p><strong>Escort Officer Phone: </strong> {_hostingReport.EscortOfficerPhone} </p>")
                        + (string.IsNullOrEmpty(_hostingReport.GuestRank) ? "" : $" <p><strong>Visitor Rank: </strong> {_hostingReport.GuestRank} </p>")
                        + (string.IsNullOrEmpty(_hostingReport.GuestName) ? "" : $" <p><strong>Visitor Name: </strong> {_hostingReport.GuestName} </p>");

        private string GetForeignDetails() => $@"<h2>Foreign Details</h2><p></p>"
                  + (string.IsNullOrEmpty(_hostingReport.CountryOfGuest) ? "" : $" <p><strong>Country of Guest: </strong> {_hostingReport.CountryOfGuest} </p>")
                 + (string.IsNullOrEmpty(_hostingReport.TypeOfVisit) ? "" : $" <p><strong>Type of Visit: </strong> {_hostingReport.TypeOfVisit} </p>")
                 + (string.IsNullOrEmpty(_hostingReport.ClassificationOfInformationReleased) ? "" : $" <p><strong>Classification of Info Released: </strong> {_hostingReport.ClassificationOfInformationReleased} </p>")
                 + (string.IsNullOrEmpty(_hostingReport.AdditionalForeignGuestInformation) ? "" : $" <p><strong>Additional Foreign Visitor Info: </strong> {_hostingReport.AdditionalForeignGuestInformation} </p>");

        public HostingReportWorkflowHelper(Activity activity, Settings settings, DataContext context, HostingReport hostingReport)
        {
            _activity = activity;
            _settings = settings;
            GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            _context = context;
            _hostingReport = hostingReport; 
        }

        internal async Task SendNotifications()
        {
            if (!_hostingReport.HostingReportNotificationSent && _hostingReport.ReportType == "Hosting Report") await this.SendHostingReportNotification();
            if (!_hostingReport.HostingReportNotificationSent && _hostingReport.ReportType == "Outsiders Report") await this.SendOutsiderReportNotification();
            if (!_hostingReport.FlagSupportNotificationSent && _hostingReport.FlagSupport) await this.SendFlagSupportNotification();
            if (!_hostingReport.OfficeCallWithCommandantNotificationSent&& _hostingReport.OfficeCallWithCommandant) await this.SendOfficeCallWithCommandantNotification();
            if (!_hostingReport.ParkingRequirementsNotificationSent && _hostingReport.ParkingRequirements) await this.SendParkingRequirementsNotification();
            if (!_hostingReport.ForeignVisitorNotificationSent && _hostingReport.ForeignVisitor) await this.SendForeignVisitorNotification();
            if (!_hostingReport.HostingReportApprovalNotificationSent &&
                (_hostingReport.ReportType == "Hosting Report" && _hostingReport.HostingReportStatus == "Exec Services Approved") ||
                (_hostingReport.ReportType == "Outsiders Report" && _hostingReport.OutsiderReportStatus == "Exec Services Approved")
                ) await this.SendReportApprovalNotification();
            if (!_hostingReport.BioIsPendingNotificationSent && _hostingReport.ReportType == "Hosting Report" && _hostingReport.BioAttachedOrPending != "attached") await this.SendBioIsPendingNotification();
        }

        
        private async Task SendBioIsPendingNotification()
        {
            
            string title = $"Please ensure you upload the BIO for  {_activity.Title}  ASAP";
            string body = $@"You have checked “Current Bio is Pending” for BIO Hosting Report  title {_activity.Title}   on  {_activity.CreatedAt.ToString("MMMM dd, yyyy")}
            Please ensure you upload the BIO ASAP";
            body = body + GetHostingReportDetails();
            body = body + $@"<p>
                                              to the view the event in the (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> 
                                            <p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(new[] { _activity.CreatedBy }, title, body);
            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.BioIsPendingNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();
        }

        private async Task SendReportApprovalNotification()
        {
            string title = $"Exec Services has Approved {_hostingReport.ReportType} for  {_activity.Title}";
            string body = $@"Exec Services has <strong>Approved</strong> {_hostingReport.ReportType} for  {_activity.Title}. There is no action for you to take. Exec Services Approval of {_hostingReport.ReportType} 
                                   means Exec Services believes coordination is complete for this event.";
            body = body + GetHostingReportDetails() + $@"<p>
                                              to the view the event in the (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> 
                                            <p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(new[] { _activity.CreatedBy }, title, body);

            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.HostingReportApprovalNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();

        }

        private async Task SendHostingReportNotification()
        {
            string title = $"{_activity.Title} has been added as a {_hostingReport.ReportType} event.";
            string body= $" {_activity.CreatedBy} has checked HOSTING REPORT on event {_activity.Title}<p></p><p></p>";
            body = body + GetHostingReportDetails() +  $@"<p>Note When you have completed EXEC Services Coordination 
                                              and event is ready to go Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> Then click the update button.
                                              and select 'Exec Services Approved' from the Hosting Report Status Drop Down</p>";
            await GraphHelper.SendEmail(GetEmails("Hosting Report Added"), title, body);

            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.HostingReportNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();
        }

        private async Task SendOutsiderReportNotification()
        {
            string title = $"{_activity.Title} has been added as a {_hostingReport.ReportType} event.";
            string body = $" {_activity.CreatedBy} has checked OUTSIDER REPORT on event {_activity.Title}<p></p><p></p>";
            body =  body + GetHostingReportDetails() + $@"<p>Note When you have completed EXEC Services Coordination 
                                              and event is ready to go Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> Then click the update button.
                                              and select 'Exec Services Approved' from the Outsider Report Status Drop Down</p>";
            await GraphHelper.SendEmail(GetEmails("Outsider Report Added"), title, body);

            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.HostingReportNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();
        }

        private async Task SendFlagSupportNotification()
        {
            string title = $"Flag Support Requested for {_activity.Title} ";
            string body = $" {_activity.CreatedBy} has checked Flag Support Needed on event {_activity.Title}. Please coordinate for flag support. <p></p><p></p>";
           body = body + GetHostingReportDetails() + $@"<p>
                                              to the view the event in the (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> 
                                            <p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Flag Support Needed"), title, body);

            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.FlagSupportNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();
        }

        private async Task SendParkingRequirementsNotification()
        {
            string title = $"Parking Requirements Requested for {_activity.Title} ";
            string body = $" {_activity.CreatedBy} has checked PARKING REQUIREMENTS on event {_activity.Title}. Please coordinate for parking. <p></p><p></p>";
            body = body + GetHostingReportDetails();
            if (!string.IsNullOrEmpty(_hostingReport.ParkingDetails))
            {
                body = body + $"<p><strong>Parking Details: </strong> {_hostingReport.ParkingDetails} </p>";
            }
            body = body + $@"<p>
                                              to the view the event in the (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> 
                                            <p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Parking Requirements Needed"), title, body);

            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.ParkingRequirementsNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();
        }

        private async Task SendForeignVisitorNotification()
        {
            string title = $"Foreign Guest is Visiting the USAWC on {GetStartTime()} ";
            string body = $" {_activity.CreatedBy} has checked that a guest attending event {_activity.Title}. is from a foreign country. <p></p><p></p>";
            body = body + GetHostingReportDetails();
            body = body + "<p></p><p></p>";
            body = body + GetForeignDetails();
            body = body  + $@"<p>
                                              to the view the event in the (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> 
                                            <p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Foreign Guest is Visiting the USAWC"), title, body);

            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.ForeignVisitorNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();
        }

        private async Task SendOfficeCallWithCommandantNotification()
        {
            string title = $"Request Office Call With the Commandant for{_activity.Title} ";
            string titleForUser = $"You have checked Office Call with the Commandant for {_activity.Title}";
            string body = $" {_activity.CreatedBy} has requested an OFFICE CALL with the Commandant for  {_activity.Title}. <p></p><p></p>";
            body = body + GetHostingReportDetails() + $@"<p>
                                              to the view the event in the (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> 
                                            <p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Office Call With Commandant"), title, body);
            await GraphHelper.SendEmail(new[] { _activity.CreatedBy },titleForUser, body);

            var hostingReportToUpdate = await _context.HostingReports.FindAsync(_hostingReport.Id);
            hostingReportToUpdate.OfficeCallWithCommandantNotificationSent = true;
            _context.HostingReports.Update(hostingReportToUpdate);
            await _context.SaveChangesAsync();
        }


    }


}
