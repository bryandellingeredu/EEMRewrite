using System.Reflection;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Application
{
    public class WorkflowHelper
    {
        private Activity _activity;
        private readonly DataContext _context;
        private readonly Settings _settings;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private string GetLocation() => _activity.ActivityRooms.Any() ? string.Join(", ", _activity.ActivityRooms.Select(x => x.Name).ToArray()) : _activity.PrimaryLocation;
        private string GetStartTime() => _activity.AllDayEvent ? _activity.Start.ToString("MMMM dd, yyyy") : _activity.Start.ToString("MMMM dd, yyyy h:mm tt");
        private string GetEndTime() => _activity.AllDayEvent ? _activity.End.ToString("MMMM dd, yyyy") : _activity.End.ToString("MMMM dd, yyyy h:mm tt");
        private string[] GetEmails(string name)
        {
            if (_webHostEnvironment.IsDevelopment())
            {
                // When running locally, always send to this email
                return new[] { "bryan.d.dellinger.civ@army.mil" };
            }
            else
            {
                // When not running locally, look up email addresses from database
                return _context.EmailGroups
                    .Include(x => x.EmailGroupMembers)
                    .Where(x => x.Name == name)
                    .SelectMany(x => x.EmailGroupMembers.Select(m => m.EmailGroupMember.Email))
                    .ToArray();
            }
        }

        private string[] GetCreatorModifierEmails()
        {
            if (_webHostEnvironment.IsDevelopment())
            {
                // When running locally, always send to this email
                return new[] { "bryan.d.dellinger.civ@army.mil" };
            }
            else
            {
                // When not running locally, look up email addresses from database
                List<string> emailList = new List<string>();
                if  (!string.IsNullOrEmpty(_activity.CreatedBy) && _activity.CreatedBy != "LegacyData@army.mil") {
                    emailList.Add(_activity.CreatedBy);
                  }
                if  (!string.IsNullOrEmpty(_activity.LastUpdatedBy) && _activity.LastUpdatedBy != "LegacyData@army.mil"){
                    emailList.Add(_activity.LastUpdatedBy);
                }
                return emailList.ToArray();
            }
        }

        Dictionary<string, OfficerInformation> officerTypeLookup = new Dictionary<string, OfficerInformation>();

        private class OfficerInformation
        {
            public string OfficerType { get; set; }
            public string EmailGroupName { get; set; }
            public string EmailHeader {get; set;}
        }


        public WorkflowHelper(Activity activity, Settings settings, DataContext context, IWebHostEnvironment webHostEnvironment)
        {
            _activity = activity;
            _settings = settings;
             GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            _context = context;
            _webHostEnvironment = webHostEnvironment;
            officerTypeLookup.Add("Commandant", new OfficerInformation {OfficerType = "Commandant", EmailGroupName = "Request Commandt Presence", EmailHeader = "Commandant's" });
            officerTypeLookup.Add("DptCmdt",    new OfficerInformation {OfficerType = "DptCmdt", EmailGroupName = "Request Dep Cmdt Presence", EmailHeader = "Deputy Commandant's" });
            officerTypeLookup.Add("Provost",    new OfficerInformation {OfficerType = "Provost", EmailGroupName = "Request Provost Presence", EmailHeader = "Provost's" });
            officerTypeLookup.Add("Cofs",       new OfficerInformation {OfficerType = "Cofs", EmailGroupName = "Request Cofs Presence", EmailHeader = "Cof's"});
            officerTypeLookup.Add("Dean",       new OfficerInformation {OfficerType = "Cofs", EmailGroupName = "Request Deans Presence", EmailHeader = "Dean's"});
            officerTypeLookup.Add("Ambassador", new OfficerInformation {OfficerType = "Ambassador", EmailGroupName = "Request Ambassador Presence", EmailHeader = "Ambassador's"});
        }

        internal async Task SendNotifications()
        {
            string[] officerTypes = officerTypeLookup.Keys.ToArray();
            foreach (string officerType in officerTypes)
            {
                PropertyInfo requestedProp = _activity.GetType().GetProperty(officerType + "Requested");
                PropertyInfo requestedNotificationSentProp = _activity.GetType().GetProperty(officerType + "RequestedNotificationSent");
                if ((bool)requestedProp.GetValue(_activity) && !(bool)requestedNotificationSentProp.GetValue(_activity)) await this.SendOfficerRequestedNotification(officerType);
            }
            if (!_activity.EventClearanceLevelNotificationSent && (_activity.EventClearanceLevel == "Secret" || _activity.EventClearanceLevel == "Top Secret" || _activity.EventClearanceLevel == "TS-SCI"))  await this.SendEventClearanceLevelNotification();   
            if (!_activity.BlissHallAVNotificationSent && (_activity.BlissHallSupport || !string.IsNullOrEmpty(_activity.EventClearanceLevel))) await this.SendBlissHallNotification();   
            if (!_activity.VTCCoordinatorNotificationSent && _activity.RoomEmails != null &&_activity.RoomEmails.Any() && _activity.VTC) await this.SendVTCCoordinatorEmails();
            if (!_activity.VTCConfirmedConfirmationSent && _activity.RoomEmails != null && _activity.RoomEmails.Any() && _activity.VTC && _activity.VTCStatus == "Confirmed") await this.SendVTCConfirmedEmail();
            if (!_activity.CCRNotificationSent && _activity.RoomEmails != null &&  _activity.RoomEmails.Any() && !string.IsNullOrEmpty(_activity.RoomSetUp)) await this.SendCCRNotification();
            if (!_activity.NewEnlistedAideEventToESDNotificationSent && _activity.EnlistedAideEvent) await this.SendNewEnlistedAideEventToESD();
            if (!_activity.NewEnlistedAideEventToAideNotificationSent && _activity.EnlistedAideEvent) await this.SendNewEnlistedAideEventToAide();
            if (_activity.SendEnlistedAideConfirmationNotification && _activity.EnlistedAideEvent) await this.SendEnlistedAideConfirmationNotification();
        }

        private async Task SendNewEnlistedAideEventToAide()
        {
            string title = $"Confirm your eligibility for the Enlisted Aid Event  on {GetStartTime()}";

            string requestedBy = string.IsNullOrEmpty(_activity.LastUpdatedBy) ? _activity.CreatedBy : _activity.LastUpdatedBy;

            string body = $@"<p> {requestedBy} has requested  that {_activity.Title} is included on the Enlisted Aide Calendar </p><p></p>
                                     <h2>Event Request Details</h2><p></p>
                       <p><strong>Title: </strong> {_activity.Title} </p>
                       <p><strong>Start Time: </strong> {GetStartTime()} </p>
                      <p><strong>End Time: </strong> {GetEndTime()} </p> "
                        + (string.IsNullOrEmpty(_activity.EnlistedAideFundingType) ? "" : $" <p><strong>Funding Type: </strong> {_activity.EnlistedAideFundingType} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideVenue) ? "" : $" <p><strong>Venue: </strong> {_activity.EnlistedAideVenue} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideGuestCount) ? "" : $" <p><strong>Guest Count: </strong> {_activity.EnlistedAideGuestCount} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideCooking) ? "" : $" <p><strong>Cooking: </strong> {_activity.EnlistedAideGuestCount} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideDietaryRestrictions) ? "" : $" <p><strong>Dietary Restrictions: </strong> {_activity.EnlistedAideDietaryRestrictions} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideAlcohol) ? "" : $" <p><strong>Alcohol: </strong> {_activity.EnlistedAideAlcohol} </p>");

            if (_activity.EnlistedAideSetup)
            {
                body = body + "<p><strong>Setup: </strong> setup is needed";
            }
            else
            {
                body = body + "<p><strong>Setup: </strong> setup is not needed";
            }
            body = body + $@"<p><p/><p><p/>
                 <p> Confirm your elegibility for this event click the : <a href='{_settings.BaseUrl}?redirecttopage=enlistedAideConfirmation/{_activity.Id}/{_activity.CategoryId}'> Confirm my eligibility  </a></p>
                  <p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Enlisted Aide ESD"), title, body);

            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.NewEnlistedAideEventToAideNotificationSent = true;
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
        }

      

            private async Task SendEnlistedAideConfirmationNotification()
        {
            string title = $"Enilisted Aide {_activity.LastUpdatedBy} {(_activity.EnlistedAideAcknowledged ? "is available" : " is not available")} for {_activity.Title} ";

            string requestedBy = string.IsNullOrEmpty(_activity.LastUpdatedBy) ? _activity.CreatedBy : _activity.LastUpdatedBy;
            string body = $"<p> Enilisted Aide {_activity.LastUpdatedBy} {(_activity.EnlistedAideAcknowledged ? "is available" : " is not available")} for {_activity.Title} </p>";
            if (_activity.EnlistedAideAcknowledged && !string.IsNullOrEmpty(_activity.EnlistedAideNumOfBartenders))
            {
                body = body + $"<p>The Enilisted Aide has requested  <strong>number of bartenders: </strong>  {_activity.EnlistedAideNumOfBartenders}</p>";
            }
            if (_activity.EnlistedAideAcknowledged && !string.IsNullOrEmpty(_activity.EnlistedAideNumOfServers))
            {
                body = body + $"<p>The Enilisted Aide has requested <strong>number of servers: </strong> {_activity.EnlistedAideNumOfServers}  </p>";
            }
            if (_activity.EnlistedAideAcknowledged && !string.IsNullOrEmpty(_activity.EnlistedAideSupportNeeded))
            {
                body = body + $"<p><strong> Additional Support: </strong> {_activity.EnlistedAideSupportNeeded}  </p>";
            }
            body = body + $@"<h2>Event Request Details</h2><p></p>
                       <p><strong>Title: </strong> {_activity.Title} </p>
                       <p><strong>Start Time: </strong> {GetStartTime()} </p>
                      <p><strong>End Time: </strong> {GetEndTime()} </p> "
                        + (string.IsNullOrEmpty(_activity.EnlistedAideFundingType) ? "" : $" <p><strong>Funding Type: </strong> {_activity.EnlistedAideFundingType} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideVenue) ? "" : $" <p><strong>Venue: </strong> {_activity.EnlistedAideVenue} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideGuestCount) ? "" : $" <p><strong>Guest Count: </strong> {_activity.EnlistedAideGuestCount} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideCooking) ? "" : $" <p><strong>Cooking: </strong> {_activity.EnlistedAideCooking} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideDietaryRestrictions) ? "" : $" <p><strong>Dietary Restrictions: </strong> {_activity.EnlistedAideDietaryRestrictions} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideAlcohol) ? "" : $" <p><strong>Alcohol: </strong> {_activity.EnlistedAideAlcohol} </p>");

            if (_activity.EnlistedAideSetup)
            {
                body = body + "<p><strong>Setup: </strong> setup is needed";
            }
            else
            {
                body = body + "<p><strong>Setup: </strong> setup is not needed";
            }
            body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Enlisted Aide ESD"), title, body);

            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.SendEnlistedAideConfirmationNotification = false;
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
        }


        private async Task SendNewEnlistedAideEventToESD()
        {
            string title = $"A request was made to  prepare an Enlisted Aid Event  on {GetStartTime()}";

            string requestedBy = string.IsNullOrEmpty(_activity.LastUpdatedBy) ? _activity.CreatedBy : _activity.LastUpdatedBy;

            string body = $@"<p> {requestedBy} has requested  that {_activity.Title} is included on the Enlisted Aide Calendar </p><p></p>
                                     <h2>Event Request Details</h2><p></p>
                       <p><strong>Title: </strong> {_activity.Title} </p>
                       <p><strong>Start Time: </strong> {GetStartTime()} </p>
                      <p><strong>End Time: </strong> {GetEndTime()} </p> "
                        + (string.IsNullOrEmpty(_activity.EnlistedAideFundingType) ? "" : $" <p><strong>Funding Type: </strong> {_activity.EnlistedAideFundingType} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideVenue) ? "" : $" <p><strong>Venue: </strong> {_activity.EnlistedAideVenue} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideGuestCount) ? "" : $" <p><strong>Guest Count: </strong> {_activity.EnlistedAideGuestCount} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideCooking) ? "" : $" <p><strong>Cooking: </strong> {_activity.EnlistedAideCooking} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideDietaryRestrictions) ? "" : $" <p><strong>Dietary Restrictions: </strong> {_activity.EnlistedAideDietaryRestrictions} </p>")
                        + (string.IsNullOrEmpty(_activity.EnlistedAideAlcohol) ? "" : $" <p><strong>Alcohol: </strong> {_activity.EnlistedAideAlcohol} </p>");

            if (_activity.EnlistedAideSetup)
            {
                body = body + "<p><strong>Setup: </strong> setup is needed";
            }
            else
            {
                body = body + "<p><strong>Setup: </strong> setup is not needed";
            }
            body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Enlisted Aide ESD"), title, body);
        
        var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
        activityToUpdate.NewEnlistedAideEventToESDNotificationSent = true;
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
    }

        private async Task SendCCRNotification()
        {

            foreach (var room in _activity.RoomEmails) {

                string title = $"Request to configure CCR as {_activity.RoomSetUp} on {GetStartTime()}";

                string body = $@"<p> {_activity.CreatedBy} has requested that the CCR be configured as {_activity.RoomSetUp}  for {_activity.Title} </p><p></p>
                                     <h2>Event Request Details</h2><p></p>
                       <p><strong>Title: </strong> {_activity.Title} </p>
                        <p><strong>Room: </strong> {room} </p>
                       <p><strong>Start Time: </strong> {GetStartTime()} </p>
                      <p><strong>End Time: </strong> {GetEndTime()} </p> "
                            + (string.IsNullOrEmpty(_activity.NumberAttending) ? "" : $" <p><strong>#Attending: </strong> {_activity.NumberAttending} </p>")
                            + (string.IsNullOrEmpty(_activity.RoomSetUp) ? "" : $" <p><strong>Room Setup (for CCR): </strong> {_activity.RoomSetUp} </p>")
                            + (string.IsNullOrEmpty(_activity.RoomSetUpInstructions) ? "" : $" <p><strong>Special Setup Instructions: </strong> {_activity.RoomSetUpInstructions} </p>")
                             + (string.IsNullOrEmpty(_activity.CreatedBy) ? "" : $" <p><strong>Person Who Booked The Room: </strong> {_activity.CreatedBy} </p>")
                             + (string.IsNullOrEmpty(_activity.PhoneNumberForRoom) ? "" : $" <p><strong>Phone Number of Person Who Booked The Room: </strong> {_activity.PhoneNumberForRoom} </p>");

                body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
                await GraphHelper.SendEmail(GetEmails("Command Conference Room Setup"), title, body); 
            }
            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.CCRNotificationSent = true;
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
        }


        private async Task SendVTCConfirmedEmail()
        {
            string title = $"VTC Titled  has Confirmed Your VTC{_activity.Title}, {DateTime.Now.ToString("MMMM dd, yyyy h:mm tt")}";
            string body = GetVTCBody(_activity.RoomEmails[0]);
            body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(new[] { _activity.CreatedBy}, title, body);
            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.VTCConfirmedConfirmationSent = true;
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
        }

        private async Task SendVTCCoordinatorEmails()
        {
            var vtcCoordinators = await  _context.RoomVTCCoordinators.ToListAsync();
            foreach (var room in _activity.RoomEmails)
            {
                foreach (var coordinator in vtcCoordinators.Where(x => x.RoomEmail == room))
                {
                    string title = $"VTC Request on {GetStartTime()} for {_activity.Title}";

                    string body = GetVTCBody(room);

                    body = body + $@"<p></p><p></p>
                                                  <p>Please coordinate and confirm this VTC request. If you have confirmed the VTC is good to go, select 'Confirm' afrom the 'VTC Status Dropdown'</p>";

                    body = body + $@"<p>To confirm or edit the VTC request in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a> Then click the update button.</p>";

                    await GraphHelper.SendEmail(new[] { coordinator.VTCCoordinatorEmail }, title, body);
                }


            }
            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.VTCCoordinatorNotificationSent= true;
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();

        }

        private string GetVTCBody(string room)
        {
            return  $@"<p> {_activity.CreatedBy} has requested to schedule a VTC  {_activity.Title} in a room where you are the VTC Coordinator</p><p></p>
                        <h2>Event Request Details</h2><p></p>
                       <p><strong>Title: </strong> {_activity.Title} </p>
                      <p><strong>Room: </strong> {room} </p>
                       <p><strong>Start Time: </strong> {GetStartTime()} </p>
                      <p><strong>End Time: </strong> {GetEndTime()} </p>
                       "
                       + (string.IsNullOrEmpty(_activity.NumberAttending) ? "" : $" <p><strong>#Attending: </strong> {_activity.NumberAttending} </p>")
                       + (string.IsNullOrEmpty(_activity.PhoneNumberForRoom) ? "" : $" <p><strong>Phone Number of Person Requesting Room: </strong> {_activity.PhoneNumberForRoom} </p>")
                       + (string.IsNullOrEmpty(_activity.RoomSetUpInstructions) ? "" : $" <p><strong>Special Room Setup Instructions: </strong> {_activity.RoomSetUpInstructions} </p>")
                       + (string.IsNullOrEmpty(_activity.Description) ? "" : $" <p><strong>Event Details: </strong> {_activity.Description} </p>")
                       + "<p></p><h2>VTC Info</h2><p></p>"
                       + (string.IsNullOrEmpty(_activity.VTCClassification) ? "" : $" <p><strong>VTC Classification:  </strong> {_activity.VTCClassification} </p>")
                       + (string.IsNullOrEmpty(_activity.DistantTechPhoneNumber) ? "" : $" <p><strong>Distant Tech Phone Number:  </strong> {_activity.DistantTechPhoneNumber} </p>")
                       + (string.IsNullOrEmpty(_activity.RequestorPOCContactInfo) ? "" : $" <p><strong>Requestor POC Contact Info:  </strong> {_activity.RequestorPOCContactInfo} </p>")
                       + (string.IsNullOrEmpty(_activity.DialInNumber) ? "" : $" <p><strong>Dial-In Number:  </strong> {_activity.DialInNumber} </p>")
                       + (string.IsNullOrEmpty(_activity.SiteIDDistantEnd) ? "" : $" <p><strong>Site-ID Distant End:  </strong> {_activity.SiteIDDistantEnd} </p>")
                       + (string.IsNullOrEmpty(_activity.SeniorAttendeeNameRank) ? "" : $" <p><strong>Senior Attendee Name / Rank:  </strong> {_activity.SeniorAttendeeNameRank} </p>")
                       + (string.IsNullOrEmpty(_activity.AdditionalVTCInfo) ? "" : $" <p><strong>Senior Attendee Name / Rank:  </strong> {_activity.AdditionalVTCInfo} </p>")
                       + (string.IsNullOrEmpty(_activity.CreatedBy) ? "" : $" <p><strong>Email of Person Requesting VTC:  </strong> {_activity.CreatedBy} </p>");
        }

        private async Task SendBlissHallNotification(){

          string title = $"Bliss Hall Auditorium A/V Support has been Requested for event {_activity.Title}";

           string body = $@"<p> Bliss Hall A/V Techs,</p><p></p>
                        FYI {_activity.CreatedBy} has requested Bliss Hall Auditorium on {GetStartTime()}.";
           
           if(!string.IsNullOrEmpty(_activity.BlissHallAVSptRequired)){
            body = body + $"They also reqested Bliss Hall A/V Support: {_activity.BlissHallAVSptRequired}";
           }

           body = body + $@"<p></p><h3>Event Request Details</h3><hr><p></p>
                        <p><strong>Title: </strong> {_activity.Title}</p>
                        <p><strong>Location: </strong> {GetLocation()}</p>
                        <p><strong>Start Time: </strong> {GetStartTime()} </p>
                        <p><strong>End Time: </strong> {GetEndTime()} </p>";
        
            if(!string.IsNullOrEmpty(_activity.NumberAttending)){
                body = body + $" <p><strong># Attending: </strong> {_activity.NumberAttending} </p>";
            }

             if(!string.IsNullOrEmpty(_activity.PhoneNumberForRoom)){
                body = body + $" <p><strong>Phone # of Person Requesting Room: </strong> {_activity.PhoneNumberForRoom} </p>";
            }

              if(!string.IsNullOrEmpty(_activity.RoomSetUpInstructions)){
                body = body + $" <p><strong>Special Room Setup Instructions: </strong> {_activity.RoomSetUpInstructions} </p>";
            }

               if(!string.IsNullOrEmpty(_activity.Description)){
                body = body + $" <p><strong>EventDetails: </strong> {_activity.Description} </p>";
            }
              body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
           await GraphHelper.SendEmail(GetEmails("Bliss Hall AV Tech"), title, body);
            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.BlissHallAVNotificationSent = true; 
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
           
     }

        private async Task SendEventClearanceLevelNotification()
        {
            string title = $"EEM Event Clearance Level is {_activity.EventClearanceLevel} for {_activity.Title}";

            string body = $@"<p> FYI G2 Personnel ,</p><p></p>
                             <p>The EEM event  {_activity.Title}  has an Event Clearance level of {_activity.EventClearanceLevel} </p><p></p>
                            <p><strong>Start Time: </strong> {GetStartTime()} </p>
                            <p><strong>End Time: </strong> {GetEndTime()} </p>
                           <p><strong>Action Officer: </strong> {_activity.ActionOfficer}</p>
                           <p><strong>Action Office Phoner: </strong> {_activity.ActionOfficerPhone}</p> ";

            if (!string.IsNullOrEmpty(_activity.Description))
            {
                body = body + $"<p><strong>Event Details: </strong> {_activity.Description}</p>";
            }

            if (!string.IsNullOrEmpty(GetLocation()))
            {
                body = body + $"<p><strong>Location: </strong> {GetLocation()}</p>";
            }
            body = body + $"<p><strong>Event Created By: </strong> {_activity.CreatedBy} </p>";

            body = body + $"<p></p><p></p><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>";

            await GraphHelper.SendEmail(GetEmails("Event Clearence Level POC"), title, body);
            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.EventClearanceLevelNotificationSent= true; 
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
        }

       
     
        private async Task SendOfficerRequestedNotification(string officerType)
        {

            string[] emails = _context.EmailGroups
            .Include(x => x.EmailGroupMembers)
            .Where(x => x.Name == officerTypeLookup[officerType].EmailGroupName)
            .SelectMany(x => x.EmailGroupMembers.Select(m => m.EmailGroupMember.Email))
            .ToArray();

            if (_webHostEnvironment.IsDevelopment())
            {
                // When running locally, always send to this email
                emails =  new[] { "bryan.d.dellinger.civ@army.mil" };
            }

         

            string title = $"The {officerTypeLookup[officerType].EmailHeader} presence is requested"; 


            string body = $@"<h3> The {officerTypeLookup[officerType].EmailHeader} presence has been requested for the following event: </h3>
                             <p><strong>Event Title: </strong> {_activity.Title} </p>";

            string bodyForRequester = $@"<h3> You have requested the prescence of {officerTypeLookup[officerType].EmailHeader}   </h3>
                             <p>This does not guarentee their attenance at your event. This only notifies the admin assistant of your request. Please coordinate further with the admin assistant to verify leader availability at your event.</p>
                             <p><strong>Event Title: </strong> {_activity.Title} </p>";

            if (!string.IsNullOrEmpty(GetLocation())){
                body = body + $"<p><strong>Location/s: </strong> {GetLocation()} <p>";
                bodyForRequester = bodyForRequester + $"<p><strong>Location/s: </strong> {GetLocation()} <p>";
            }

             body = body + $@"<p><strong>Start Time: </strong> {GetStartTime()} </p>
                              <p><strong>End Time: </strong> {GetEndTime()} </p>";

            bodyForRequester = bodyForRequester + $@"<p><strong>Start Time: </strong> {GetStartTime()} </p>
                              <p><strong>End Time: </strong> {GetEndTime()} </p>";

            if (!string.IsNullOrEmpty(_activity.Description)){
                body = body + $"<p><strong>Event Details: </strong> {_activity.Description} </p>";
                bodyForRequester = bodyForRequester + $"<p><strong>Event Details: </strong> {_activity.Description} </p>";
            }

            if(!(_activity.OrganizationId == null)){
                var organization = _context.Organizations.Find(_activity.OrganizationId);
                body = body + $"<p><strong>Lead Org: </strong> {organization.Name} </p>";
                bodyForRequester = bodyForRequester + $"<p><strong>Lead Org: </strong> {organization.Name} </p>";
            }

            if(!string.IsNullOrEmpty(_activity.ActionOfficer)){
                body = body + $"<p><strong>Action Officer: </strong> {_activity.ActionOfficer} </p>";
                bodyForRequester = bodyForRequester + $"<p><strong>Action Officer: </strong> {_activity.ActionOfficer} </p>";
            }

            body = body + $"<p><strong>Event Created By: </strong> {_activity.CreatedBy} </p>";
            bodyForRequester = bodyForRequester + $"<p><strong>Event Created By: </strong> {_activity.CreatedBy} </p>";

            body = body + $"<p></p><p></p><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>";
            bodyForRequester = bodyForRequester + $"<p></p><p></p><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>";

            try
            {
                await GraphHelper.SendEmail(emails, title, body);
            }
            catch (Exception)
            {

                // email was not sent
            }
            try
            {
                await GraphHelper.SendEmail(GetCreatorModifierEmails(), title, bodyForRequester);
            }
            catch (Exception)
            {

                // email was not sent
            }
  

            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.GetType().GetProperty(officerType + "RequestedNotificationSent").SetValue(activityToUpdate, true);
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();

            
                  
        }

        private async Task< IEnumerable<ActivityRoom>> GetActivityRooms()
        {
            List<ActivityRoom> activityRooms = new List<ActivityRoom>();
            var allrooms = await GraphHelper.GetRoomsAsync();

            var allroomEmails = allrooms.Select(x => x.AdditionalData["emailAddress"].ToString()).ToList();
            int index = 0;
            foreach (var item in _activity.RoomEmails.Where(x => allroomEmails.Contains(x)))
            {
                activityRooms.Add(new ActivityRoom
                {
                    Id = index++,
                    Name = allrooms.Where(x => x.AdditionalData["emailAddress"].ToString() == item).FirstOrDefault().DisplayName,
                    Email = item,
                });
            }
        
            return activityRooms;
        }
    }
}