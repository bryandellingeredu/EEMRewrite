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
}

        private async Task SendOfficerRequestedNotification(string officerType)
        {

            string[] emails = _context.EmailGroups
            .Include(x => x.EmailGroupMembers)
            .Where(x => x.Name == officerTypeLookup[officerType].EmailGroupName)
            .SelectMany(x => x.EmailGroupMembers.Select(m => m.EmailGroupMember.Email))
            .ToArray();

            if (_activity.RoomEmails.Any() && _activity.ActivityRooms == null)
            {
              _activity.ActivityRooms = await  GetActivityRooms();
            }

            string title = $"The {officerTypeLookup[officerType].EmailHeader} presence is requested"; 
            string location = _activity.ActivityRooms.Any() ?  string.Join(", ", _activity.ActivityRooms.Select(x => x.Name).ToArray()) : _activity.PrimaryLocation;
            string startTime =  _activity.AllDayEvent ? _activity.Start.ToString("MMMM dd, yyyy") : _activity.Start.ToString("MMMM dd, yyyy h:mm tt");
            string endTime =  _activity.AllDayEvent ? _activity.End.ToString("MMMM dd, yyyy") : _activity.End.ToString("MMMM dd, yyyy h:mm tt");

            string body = $@"<h3> The {officerTypeLookup[officerType].EmailHeader} presence has been requested for the following event: </h3>
                             <p><strong>Event Title: </strong> {_activity.Title} </p>";
            
             if(!string.IsNullOrEmpty(location)){
                body = body + $"<p><strong>Location/s: </strong> {location} <p>";
             }

             body = body + $@"<p><strong>Start Time: </strong> {startTime} </p>
                              <p><strong>End Time: </strong> {endTime} </p>";

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

            body = body + $"<p><p/><p><p/><p> To view in the Enterprise Event Manager (EEM), click the: <a href='{_settings.BaseUrl}?id={_activity.Id}&categoryid={_activity.CategoryId}'> EEM Link </a></p>";
            
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