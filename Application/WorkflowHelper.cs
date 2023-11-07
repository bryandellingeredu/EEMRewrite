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
        private Activity _oldActivity;
        private readonly DataContext _context;
        private readonly Settings _settings;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private async Task<string> GetLocation()
        {
            var activityRooms = await GetActivityRooms();
            return activityRooms.Any() ? string.Join(", ", activityRooms.Select(x => x.Name).ToArray()) : _activity.PrimaryLocation;
        }
        private string GetStartTime() => _activity.AllDayEvent ? _activity.Start.ToString("MMMM dd, yyyy") : _activity.Start.ToString("MMMM dd, yyyy h:mm tt");
        private string GetEndTime() => _activity.AllDayEvent ? _activity.End.ToString("MMMM dd, yyyy") : _activity.End.ToString("MMMM dd, yyyy h:mm tt");
        private string GetOldStartTime() => _oldActivity == null ? string.Empty : (_oldActivity.AllDayEvent ? _oldActivity.Start.ToString("MMMM dd, yyyy") : _oldActivity.Start.ToString("MMMM dd, yyyy h:mm tt"));
        private string GetOldEndTime() => _oldActivity == null ? string.Empty : (_oldActivity.AllDayEvent ? _oldActivity.End.ToString("MMMM dd, yyyy") : _oldActivity.End.ToString("MMMM dd, yyyy h:mm tt"));
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


        public WorkflowHelper(Activity activity, Settings settings, DataContext context, IWebHostEnvironment webHostEnvironment, Activity oldActivity = null)
        {
            _activity = activity;
            _oldActivity = oldActivity;
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
            if (!_activity.EventPlanningNotificationSent && _activity.EventPlanningNotifyPOC && !string.IsNullOrEmpty(_activity.EventPlanningExternalEventPOCEmail)) await this.sendEventPlanningNotification();
            await this.SendAddToMyCalendarEmails();
            if ((_activity.Start - DateTime.Now).TotalHours <= 72 || _activity.CopiedTosymposiumAndConferences ) await this.SendSyncCalendarNotificationEmails();
        }

        private async Task SendSyncCalendarNotificationEmails()
        {
            var items =
              await _context.SyncToCalendarNotifications
              .Where(x =>
              (x.CopiedToacademic && _activity.CopiedToacademic) ||
              (x.MFP && _activity.MFP) ||
              (x.CopiedTossiAndUsawcPress && _activity.CopiedTossiAndUsawcPress) ||
              (x.CopiedTopksoi && _activity.CopiedTopksoi) ||
              (x.CopiedTostaff && _activity.CopiedTostaff) ||
              (x.CommunityEvent && _activity.CommunityEvent) ||
              (x.CopiedToasep && _activity.CopiedToasep) ||
              (x.CopiedTostaff && _activity.CopiedTostaff) ||
              (x.CopiedTobattlerhythm && _activity.CopiedTobattlerhythm) ||
              (x.CopiedTocio && _activity.CopiedTocio) ||
              (x.CopiedTocommandGroup && _activity.CopiedTocommandGroup) ||
              (x.CopiedTocommunity && _activity.CopiedTocommunity) ||
              (x.CopiedTocsl && _activity.CopiedTocsl) ||
              (x.CopiedTogarrison && _activity.CopiedTogarrison) ||
              (x.CopiedTogeneralInterest && _activity.CopiedTogeneralInterest) ||
              (x.CopiedToholiday && _activity.CopiedToholiday) ||
              (x.CopiedTosocialEventsAndCeremonies && _activity.CopiedTosocialEventsAndCeremonies) ||
              (x.CopiedTossl && _activity.CopiedTossl) ||
              (x.CopiedTostudentCalendar && _activity.CopiedTostudentCalendar) ||
              (x.CopiedTosymposiumAndConferences && _activity.CopiedTosymposiumAndConferences) ||
              (x.CopiedTotrainingAndMiscEvents && _activity.CopiedTotrainingAndMiscEvents) ||
              (x.CopiedTousahec && _activity.CopiedTousahec) ||
              (x.CopiedTousahecFacilitiesUsage && _activity.CopiedTousahecFacilitiesUsage) ||
              (x.CopiedTovisitsAndTours && _activity.CopiedTovisitsAndTours) ||
              (x.IMC && _activity.IMC)
              ).ToArrayAsync();
            if (items.Any())
            {
                foreach (var item in items)
                {
                    bool sendNotifictaion = false;
                    if (string.IsNullOrEmpty(_activity.LastUpdatedBy)) sendNotifictaion = true;
                    if (_oldActivity == null) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.Start != _activity.Start) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.End != _activity.End) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.EventLookup != _activity.EventLookup) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.Cancelled != _activity.Cancelled) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.LogicalDeleteInd != _activity.LogicalDeleteInd) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.Title != _activity.Title) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.ActionOfficerPhone != _activity.ActionOfficerPhone) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.ActionOfficer != _activity.ActionOfficer) sendNotifictaion = true;
                    if (_oldActivity != null && _oldActivity.Description != _activity.Description) sendNotifictaion = true;
                    if (_oldActivity != null && _activity.CopiedTostudentCalendar && _oldActivity.StudentCalendarUniform != _activity.StudentCalendarUniform) sendNotifictaion = true;
                    if (_oldActivity != null && _activity.CopiedTostudentCalendar && _oldActivity.StudentCalendarMandatory != _activity.StudentCalendarMandatory) sendNotifictaion = true;
                    if (_oldActivity != null && _activity.CopiedTostudentCalendar && _oldActivity.StudentCalendarPresenter != _activity.StudentCalendarPresenter) sendNotifictaion = true;
                    if (_oldActivity != null && _activity.CopiedTostudentCalendar && _oldActivity.StudentCalendarNotes != _activity.StudentCalendarNotes) sendNotifictaion = true;

                    if (sendNotifictaion)
                    {
                        string updatedOrAdded = string.IsNullOrEmpty(_activity.LastUpdatedBy) ? "added" : "updated";
                        if (!_activity.CopiedTosymposiumAndConferences)
                        {
                            updatedOrAdded = updatedOrAdded + " within 3 days of its start time";
                        }

                        string body = string.Empty;

                        string title = $"{_activity.Title} has been {updatedOrAdded}";

                        if (string.IsNullOrEmpty(_activity.LastUpdatedBy) && _activity.CopiedTosymposiumAndConferences)
                        {
                             body = $@"<p> {_activity.Title} has been added to the Symposium and Conferences Calendar. You received this because you subscribed to the Symposium and Conferences Calendar.</p>
                             <h2>Event Request Details</h2><p></p>";
                        }
                        else
                        {
                             body = $@"<p> {_activity.Title} , an event you subscribed to has been {updatedOrAdded}.</p>
                      <h2>Event Request Details</h2><p></p>";
                        }

                        if (_oldActivity != null && _oldActivity.Title != _activity.Title)
                        {
                            body = body + $" <p style='color: darkred;'><strong>Old Title: </strong> {_oldActivity.Title} </p>";
                            body = body + $" <p style='color: darkred;'><strong>New Title: </strong> {_activity.Title} </p>";
                        }
                        else
                        {
                            body = body + $"<p><strong>Title: </strong> {_activity.Title} </p>";
                        }


                        if (_oldActivity != null && _oldActivity.Cancelled != _activity.Cancelled)
                        {
                            body = body + $" <p style='color: darkred;'><strong>This Event Has Been Cancelled </strong> </p>";
                        }

                        if (_oldActivity != null && _oldActivity.LogicalDeleteInd != _activity.LogicalDeleteInd)
                        {
                            if (_activity.LogicalDeleteInd)
                            {
                                body = body + $" <p style='color: darkred;'><strong>This Event Has Been Deleted </strong> </p>";
                            }
                            else
                            {
                                body = body + $" <p style='color: darkred;'><strong>This Event Has Been Restored </strong> </p>";
                            }
                        }

                        if (_oldActivity != null && _oldActivity.Start != _activity.Start)
                        {
                            body = body + $" <p style='color: darkred;'><strong>Old Start Time: </strong> {GetOldStartTime()} </p>";
                            body = body + $" <p style='color: darkred;'><strong>New Start Time: </strong> {GetStartTime()} </p>";
                        }
                        else
                        {
                            body = body + $"  <p><strong>Start Time: </strong> {GetStartTime()} </p>";
                        }

                        if (_oldActivity != null && _oldActivity.End != _activity.End)
                        {
                            body = body + $" <p style='color: darkred;'><strong>Old End Time: </strong> {GetOldEndTime()} </p>";
                            body = body + $" <p style='color: darkred;'><strong>New End Time: </strong> {GetEndTime()} </p>";
                        }
                        else
                        {
                            body = body + $"  <p><strong>End Time: </strong> {GetEndTime()} </p>";
                        }


                        if (_oldActivity != null && _oldActivity.ActionOfficer != _activity.ActionOfficer)
                        {
                            body = body + $" <p style='color: darkred;'><strong>Old Action Officer: </strong> {_oldActivity.ActionOfficer} </p>";
                            body = body + $" <p style='color: darkred;'><strong>New Action Officer: </strong> {_activity.ActionOfficer} </p>";
                        }
                        else
                        {
                            body = body + $" <p><strong>Action Officer: </strong> {_activity.ActionOfficer} </p>";
                        }

                        if (_oldActivity != null && _oldActivity.ActionOfficerPhone != _activity.ActionOfficerPhone)
                        {
                            body = body + $" <p style='color: darkred;'><strong>Old Action Officer Phone: </strong> {_oldActivity.ActionOfficerPhone} </p>";
                            body = body + $" <p style='color: darkred;'><strong>New Action Officer Phone: </strong> {_activity.ActionOfficerPhone} </p>";
                        }
                        else
                        {
                            body = body + $" <p><strong>Action Officer Phone: </strong> {_activity.ActionOfficerPhone} </p>";
                        }

                        if (_oldActivity != null && _oldActivity.Description != _activity.Description)
                        {
                            body = body + $" <p style='color: darkred;'><strong>Old Description: </strong> {_oldActivity.Description} </p>";
                            body = body + $" <p style='color: darkred;'><strong>New Description: </strong> {_activity.Description} </p>";
                        }
                        else
                        {
                            body = body + $" <p><strong>Description: </strong> {_activity.Description} </p>";
                        }

                  

                        if (!string.IsNullOrEmpty(await GetLocation()))
                        {
                          
                                body = body + $"<p><strong>Location: </strong> {await GetLocation()}</p>";
                        }
                        if (_activity.CopiedTostudentCalendar && !string.IsNullOrEmpty(_activity.StudentCalendarUniform))


                        {
                            if (_oldActivity != null && _oldActivity.StudentCalendarUniform != _activity.StudentCalendarUniform)
                            {
                                body = body + $" <p style='color: darkred;'><strong>Old Uniform: </strong> {_oldActivity.StudentCalendarUniform} </p>";
                                body = body + $" <p style='color: darkred;'><strong>New Uniform: </strong> {_activity.StudentCalendarUniform} </p>";
                            }
                            else
                            {
                                body = body + $" <p><strong>Uniform: </strong> {_activity.StudentCalendarUniform} </p>";
                            }
                        }
                        if (_activity.CopiedTostudentCalendar && _activity.StudentCalendarMandatory)
                        {
                            if (_oldActivity != null && _activity.StudentCalendarMandatory != _oldActivity.StudentCalendarMandatory)
                            {
                                body = body + $"<p style='color: darkred;'><strong>Attendance: </strong> Attendance was optional but was changed to  Mandatory </p>";
                            }
                            else
                            {
                                body = body + $"<p><strong>Attendance: </strong> Attendance is Mandatory </p>";
                            }
                           
                        }
                        if (_oldActivity != null && _activity.CopiedTostudentCalendar && !_activity.StudentCalendarMandatory && _oldActivity.StudentCalendarMandatory)
                        {
                            body = body + $"<p><strong>Attendance: </strong> Attendance was Mandatory but is now Optional </p>";
                        }
                       
                            if (_activity.CopiedTostudentCalendar && !string.IsNullOrEmpty(_activity.StudentCalendarPresenter))
                        {
                            if (_oldActivity != null && _oldActivity.StudentCalendarPresenter != _activity.StudentCalendarPresenter)
                            {
                                body = body + $" <p style='color: darkred;'><strong>Old Presenter: </strong> {_oldActivity.StudentCalendarPresenter} </p>";
                                body = body + $" <p style='color: darkred;'><strong>New Presenter: </strong> {_activity.StudentCalendarPresenter} </p>";
                            }
                            else
                            {
                                body = body + $" <p><strong>Presenter: </strong> {_activity.StudentCalendarPresenter} </p>";
                            }
                        }
                        if (_activity.CopiedTostudentCalendar && !string.IsNullOrEmpty(_activity.StudentCalendarNotes))
                        {
                            if (_oldActivity != null && _oldActivity.StudentCalendarNotes != _activity.StudentCalendarNotes)
                            {
                                body = body + $" <p style='color: darkred;'><strong>Old Notes: </strong> {_oldActivity.StudentCalendarNotes} </p>";
                                body = body + $" <p style='color: darkred;'><strong>New Notes: </strong> {_activity.StudentCalendarNotes} </p>";
                            }
                            else
                            {
                                body = body + $" <p><strong>Notes: </strong> {_activity.StudentCalendarNotes} </p>";
                            }
                        }
                        body = body + $"<p><strong>Event Created By: </strong> {_activity.CreatedBy} </p>";
                        if (!string.IsNullOrEmpty(_activity.LastUpdatedBy))
                        {
                            body = body + $"<p><strong>Event Updated By: </strong> {_activity.LastUpdatedBy} </p>";
                        }

                        if(_activity.CopiedTosymposiumAndConferences && _activity.SymposiumLinkInd && !(string.IsNullOrEmpty(_activity.SymposiumLink))){
                            body = body + $"<p><a href='{_activity.SymposiumLink}'> Register for {_activity.Title} </a></p>";
                        }




                        body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>
              <p></p><p></p><p>YOU HAVE RECEIVED THIS EMAIL BECAUSE YOU SUBSCRIBED TO NOTIFICATIONS. TO STOP RECEIVING THESE NOTIFICATIONS <a href='{_settings.BaseUrl}?redirecttopage=unsubscribe/{item.Id}'> UNSUBSCRIBE </a> </p>";
                        await GraphHelper.SendEmail(new[] { item.Email }, title, body);
                    }
                }
            }
        }
      
        

        private async Task SendAddToMyCalendarEmails()
        {
            var emails = _context.ActivityNotifications
             .Where(x => x.ActivityId == _activity.Id)
            .Select(x => x.Email)
             .AsEnumerable() // Move the subsequent operations to in-memory
             .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

            if (emails.Any())
                    {
                     string title = $"{_activity.Title} has been updated";
                string body = $@"<p> {_activity.Title} , an event you added to your calendar has been updated and the values may have changed.</p>
                      <h2>Event Request Details</h2><p></p>
                       <p><strong>Title: </strong> {_activity.Title} </p>
                       <p><strong>Start Time: </strong> {GetStartTime()} </p>
                      <p><strong>End Time: </strong> {GetEndTime()} </p> 
                      <p><strong>Action Officer: </strong> {_activity.ActionOfficer}</p>
                           <p><strong>Action Office Phoner: </strong> {_activity.ActionOfficerPhone}</p> ";

            if (!string.IsNullOrEmpty(_activity.Description))
            {
                body = body + $"<p><strong>Event Details: </strong> {_activity.Description}</p>";
            }

            if (!string.IsNullOrEmpty(await GetLocation()))
            {
                body = body + $"<p><strong>Location: </strong> {await GetLocation()}</p>";
            }
            body = body + $"<p><strong>Event Created By: </strong> {_activity.CreatedBy} </p>";
                if (!string.IsNullOrEmpty(_activity.LastUpdatedBy))
                {
                    body = body + $"<p><strong>Event Updated By: </strong> {_activity.LastUpdatedBy} </p>";
                }

                body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
                await GraphHelper.SendEmail(emails, title, body);
            }
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
            if(!string.IsNullOrEmpty(_activity.EnlistedAideAdditionalRemarks)){
                 body = body + $"<p><strong>Additional Remarks: </strong> {_activity.EnlistedAideAdditionalRemarks} </p>";
            }
            body = body + $@"<p><p/><p><p/>
                 <p> Confirm your elegibility for this event click the : <a href='{_settings.BaseUrl}?redirecttopage=enlistedAideConfirmation/{_activity.Id}/{_activity.CategoryId}'> Confirm my eligibility  </a></p>
                  <p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";
            await GraphHelper.SendEmail(GetEmails("Enlisted Aide"), title, body);

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
            if(!string.IsNullOrEmpty(_activity.EnlistedAideAdditionalRemarks)){
                 body = body + $"<p><strong>Additional Remarks: </strong> {_activity.EnlistedAideAdditionalRemarks} </p>";
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
            if(!string.IsNullOrEmpty(_activity.EnlistedAideAdditionalRemarks)){
                 body = body + $"<p><strong>Additional Remarks: </strong> {_activity.EnlistedAideAdditionalRemarks} </p>";
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

        private async Task sendEventPlanningNotification()
        {

            string title = $"CIO Event Planning Would Like you to know about the event {_activity.Title}";

            string requestedBy = string.IsNullOrEmpty(_activity.LastUpdatedBy) ? _activity.CreatedBy : _activity.LastUpdatedBy;

            string body = $@"<p> {requestedBy} has requested  that {_activity.Title} is included on the CIO Event Planning Calendar </p><p></p>
                                     <h2>Event Request Details</h2><p></p>
                       <p><strong>Title: </strong> {_activity.Title} </p>
                       <p><strong>Start Time: </strong> {GetStartTime()} </p>
                      <p><strong>End Time: </strong> {GetEndTime()} </p> "
                         + (string.IsNullOrEmpty(_activity.EventPlanningPAX) ? "" : $" <p><strong>PAX: </strong> {_activity.EventPlanningPAX} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningStatus) ? "<p><strong>Status: </strong> Pending" : $" <p><strong>PAX: </strong> {_activity.EventPlanningStatus} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningCIORequirementsComments) ? "" : $" <p><strong>CIO Requirements Comments: </strong> {_activity.EventPlanningCIORequirementsComments} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningNumOfPC) ? "" : $" <p><strong>Number of PCs: </strong> {_activity.EventPlanningNumOfPC} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningNumOfBYADS) ? "" : $" <p><strong>Number of BYADs: </strong> {_activity.EventPlanningNumOfBYADS} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningNumOfVOIPs) ? "" : $" <p><strong>Number of VOIP / VOISP / Conf Phone: </strong> {_activity.EventPlanningNumOfVOIPs} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningNumOfPrinters) ? "" : $" <p><strong>Number of Printers / Copiers </strong> {_activity.EventPlanningNumOfPrinters} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningNumOfPeripherals) ? "" : $" <p><strong>Number of Peripherals (Camera / Other / Conf Phone) </strong> {_activity.EventPlanningNumOfPeripherals} </p>")
                         + (string.IsNullOrEmpty(_activity.EventPlanningNumOfMonitors) ? "" : $" <p><strong>Number of Monitors / Projectors </strong> {_activity.EventPlanningNumOfMonitors} </p>")
                         + (_activity.EventPlanningSetUpDate == null ? "" : $" <p><strong>Set Up Time </strong> {_activity.EventPlanningSetUpDate.Value.ToString("MMMM dd, yyyy h:mm tt")} </p>")
                         + (_activity.EventPlanningNetworkREN ? "<p><strong>REN is required</strong></p>" : "")
                         + (_activity.EventPlanningNetworkWireless ? "<p><strong>Wireless is required</strong></p>" : "")
                         + (_activity.EventPlanningNetworkNTG ? "<p><strong>NTG is required</strong></p>" : "")
                         + (_activity.EventPlanningNetworkNTS ? "<p><strong>NTS is required</strong></p>" : "")
                         + (_activity.EventPlanningNetworkSIPR ? "<p><strong>SIPR is required</strong></p>" : "")
                         + (_activity.EventPlanningNetworkSIPR ? "<p><strong>NIPR is required</strong></p>" : "");

            body = body + $@"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>
              <p></p><p></p><p>DO NOT REPLY TO THIS E-MAIL. THIS MESSAGE WAS AUTOMATICALLY GENERATED BY THE SYSTEM AND IS NOT MONITORED.</p>";

            try
            {
                await GraphHelper.SendEmail(new[] { _activity.EventPlanningExternalEventPOCEmail }, title, body);
                var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
                activityToUpdate.EventPlanningNotificationSent = true;
                _context.Activities.Update(activityToUpdate);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {

                // do nothing
            }
        
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
                        <p><strong>Location: </strong> {await GetLocation()}</p>
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

            if (!string.IsNullOrEmpty(await GetLocation()))
            {
                body = body + $"<p><strong>Location: </strong> {await GetLocation()}</p>";
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

            if (!string.IsNullOrEmpty(await GetLocation())){
                body = body + $"<p><strong>Location/s: </strong> {await GetLocation()} <p>";
                bodyForRequester = bodyForRequester + $"<p><strong>Location/s: </strong> {await GetLocation()} <p>";
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
            if (_activity.RoomEmails != null && _activity.RoomEmails.Any())
            {
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
            }
            return activityRooms;
        }
    }
}