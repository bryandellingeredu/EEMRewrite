using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Application.GraphSchedules;
using Microsoft.AspNetCore.Http;

namespace Application
{
    public class WorkflowHelper
    {
        private Activity _activity;
        private readonly DataContext _context;
        private readonly Settings _settings;
        private string GetLocation() => _activity.ActivityRooms.Any() ? string.Join(", ", _activity.ActivityRooms.Select(x => x.Name).ToArray()) : _activity.PrimaryLocation;
        private string GetStartTime() => _activity.AllDayEvent ? _activity.Start.ToString("MMMM dd, yyyy") : _activity.Start.ToString("MMMM dd, yyyy h:mm tt");
        private string GetEndTime() => _activity.AllDayEvent ? _activity.End.ToString("MMMM dd, yyyy") : _activity.End.ToString("MMMM dd, yyyy h:mm tt");

        Dictionary<string, OfficerInformation> officerTypeLookup = new Dictionary<string, OfficerInformation>();

        private class OfficerInformation
        {
            public string OfficerType { get; set; }
            public string EmailGroupName { get; set; }
            public string EmailHeader {get; set;}

        }


        public WorkflowHelper(Activity activity, Settings settings, DataContext context)
        {
            _activity = activity;
            _settings = settings;
             GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
            _context = context;
            officerTypeLookup.Add("Commandant", new OfficerInformation {OfficerType = "Commandant", EmailGroupName = "Request Commandt Presence", EmailHeader = "Commandant's" });
            officerTypeLookup.Add("DptCmdt",    new OfficerInformation {OfficerType = "DptCmdt", EmailGroupName = "Request Dep Cmdt Presence", EmailHeader = "Deputy Commandant's" });
            officerTypeLookup.Add("Provost",    new OfficerInformation {OfficerType = "Provost", EmailGroupName = "Request Provost Presence", EmailHeader = "Provost's" });
            officerTypeLookup.Add("Cofs",       new OfficerInformation {OfficerType = "Cofs", EmailGroupName = "Request Cofs Presence", EmailHeader = "Cof's"});
            officerTypeLookup.Add("Dean",       new OfficerInformation {OfficerType = "Cofs", EmailGroupName = "Request Deans Presence", EmailHeader = "Dean's"});
            officerTypeLookup.Add("Ambassador", new OfficerInformation {OfficerType = "Ambassador", EmailGroupName = "Request Ambassador Presence", EmailHeader = "Ambassador's"});
        }

   internal  async Task SendNotifications()
{
    string[] officerTypes = officerTypeLookup.Keys.ToArray();
    foreach (string officerType in officerTypes)
    {
        PropertyInfo requestedProp = _activity.GetType().GetProperty(officerType + "Requested");
        PropertyInfo requestedNotificationSentProp = _activity.GetType().GetProperty(officerType + "RequestedNotificationSent");
        if ((bool)requestedProp.GetValue(_activity) && !(bool)requestedNotificationSentProp.GetValue(_activity))
        {
            await  this.SendOfficerRequestedNotification(officerType);
        }
    }
   if (!_activity.EventClearanceLevelNotificationSent && (_activity.EventClearanceLevel == "Secret" || _activity.EventClearanceLevel == "Top Secret" || _activity.EventClearanceLevel == "TS-SCI"))
            {
                await this.SendEventClearanceLevelNotification();
            }
if (!_activity.BlissHallAVNotificationSent && (_activity.BlissHallSupport|| !string.IsNullOrEmpty(_activity.EventClearanceLevel)))
            {
                await this.SendBlissHallNotification();
            }
     }

     
     private async Task SendBlissHallNotification(){
          string[] emails = _context.EmailGroups
          .Include(x => x.EmailGroupMembers)
          .Where(x => x.Name == "Bliss Hall AV Tech")
          .SelectMany(x => x.EmailGroupMembers.Select(m => m.EmailGroupMember.Email))
          .ToArray();

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
           await GraphHelper.SendEmail(emails, title, body);
            var activityToUpdate = await _context.Activities.FindAsync(_activity.Id);
            activityToUpdate.BlissHallAVNotificationSent = true; 
            _context.Activities.Update(activityToUpdate);
            await _context.SaveChangesAsync();
           
     }

        private async Task SendEventClearanceLevelNotification()
        {
            string[] emails = _context.EmailGroups
          .Include(x => x.EmailGroupMembers)
          .Where(x => x.Name == "Event Clearence Level POC")
          .SelectMany(x => x.EmailGroupMembers.Select(m => m.EmailGroupMember.Email))
          .ToArray();

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

            await GraphHelper.SendEmail(emails, title, body);
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

            if ( !(_activity.ActivityRooms == null) &&_activity.RoomEmails.Any() )
            {
              _activity.ActivityRooms = await  GetActivityRooms();
            }

            string title = $"The {officerTypeLookup[officerType].EmailHeader} presence is requested"; 


            string body = $@"<h3> The {officerTypeLookup[officerType].EmailHeader} presence has been requested for the following event: </h3>
                             <p><strong>Event Title: </strong> {_activity.Title} </p>";
            
             if(!string.IsNullOrEmpty(GetLocation())){
                body = body + $"<p><strong>Location/s: </strong> {GetLocation()} <p>";
             }

             body = body + $@"<p><strong>Start Time: </strong> {GetStartTime()} </p>
                              <p><strong>End Time: </strong> {GetEndTime()} </p>";

            if(!string.IsNullOrEmpty(_activity.Description)){
                body = body + $"<p><strong>Event Details: </strong> {_activity.Description} </p>";
            }

            if(!(_activity.OrganizationId == null)){
                var organization = _context.Organizations.Find(_activity.OrganizationId);
                body = body + $"<p><strong>Lead Org: </strong> {organization.Name} </p>";
            }

            if(!string.IsNullOrEmpty(_activity.ActionOfficer)){
                body = body + $"<p><strong>Action Officer: </strong> {_activity.ActionOfficer} </p>";
            }

            body = body + $"<p><strong>Event Created By: </strong> {_activity.CreatedBy} </p>";

            body = body + $"<p></p><p></p><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>";
            
            await GraphHelper.SendEmail(emails, title, body);
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