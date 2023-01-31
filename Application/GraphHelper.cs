﻿namespace Application
{
    using Application.Activities;
    using Application.GraphSchedules;
    using Azure.Identity;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Graph;
    using System.IO;
    using static System.Net.WebRequestMethods;
    using File = File;

    public class GraphHelper
    {
        private static Settings _settings;

        public static void InitializeGraph(Settings settings,
          Func<DeviceCodeInfo, CancellationToken, Task> deviceCodePrompt)
        {
            _settings = settings;
        }

        private static ClientSecretCredential _clientSecretCredential;
        private static GraphServiceClient _appClient;

        public static string GetEEMServiceAccount() => _settings.ServiceAccount;

        private static void EnsureGraphForAppOnlyAuth()
        {
            _ = _settings ??
              throw new System.NullReferenceException("Settings cannot be null");

            if (_clientSecretCredential == null)
            {
                _clientSecretCredential = new ClientSecretCredential(
                  _settings.TenantId, _settings.ClientId, _settings.ClientSecret);
            }

            if (_appClient == null)
            {
                _appClient = new GraphServiceClient(_clientSecretCredential,
                  new[] {
            "https://graph.microsoft.com/.default"
                  });
            }
        }

        public static Task<IGraphServiceUsersCollectionPage> GetUsersAsync()
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            return _appClient.Users
              .Request()
              .Select(u => new {
                  // Only request specific properties
                  u.DisplayName,
                  u.Id,
                  u.Mail
              })
              // Get at most 25 results
              .Top(25)
              // Sort by display name
              .OrderBy("DisplayName")
              .GetAsync();
        }

        public static Task<IUserEventsCollectionPage> GetEventsAsync(string email)
        {

            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            return _appClient.Users[email].Events
              .Request()
              .GetAsync();
        }
        public static Task<Event> GetEventAsync(string email, string id)
        {

                EnsureGraphForAppOnlyAuth();
                _ = _appClient ??
                  throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

                return _appClient.Users[email].Events[id]
                  .Request()
                  .GetAsync();
           
        }

        public static Task<IGraphServicePlacesCollectionPage> GetRoomsAsync()
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");
            var roomUrl = _appClient.Places.AppendSegmentToRequestUrl("microsoft.graph.room");
            var placesRequest = new GraphServicePlacesCollectionRequest(roomUrl, _appClient, null).GetAsync();
            return placesRequest;
        }

        public static Task<User> GetUserAsync(string email)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            return _appClient.Users[email]
              .Request()
              .GetAsync();
        }

        public static Task<ICalendarGetScheduleCollectionPage> GetScheduleAsync(ScheduleRequestDTO scheduleRequestDTO)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            return _appClient.Users[scheduleRequestDTO.Schedules[0]].Calendar
              .GetSchedule(scheduleRequestDTO.Schedules, scheduleRequestDTO.EndTime, scheduleRequestDTO.StartTime, scheduleRequestDTO.AvailabilityViewInterval)
              .Request()
              .Header("Prefer", "outlook.timezone=\"Eastern Standard Time\"")
              .PostAsync();
        }

        public static async Task<Event> CreateEvent(GraphEventDTO graphEventDTO)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            // get the id of the calendar
            var calendar = await _appClient.Users[graphEventDTO.RequesterEmail].Calendar
              .Request()
              .GetAsync();

            // get the rooms
            var roomUrl = _appClient.Places.AppendSegmentToRequestUrl("microsoft.graph.room");
            var placesRequest = await new GraphServicePlacesCollectionRequest(roomUrl, _appClient, null).GetAsync();

            List<Attendee> attendees = new List<Attendee>();

            bool scheduleUsingServiceAccount = graphEventDTO.RequesterEmail == GetEEMServiceAccount();

            attendees.Add(
              new Attendee
              {
                  EmailAddress = new EmailAddress
                  {
                      Address = graphEventDTO.RequesterEmail,
                      Name = graphEventDTO.RequesterFirstName + " " + graphEventDTO.RequesterLastName,
                  },
                  Type = AttendeeType.Required
              });

            foreach (var roomEmail in graphEventDTO.RoomEmails)
            {
                attendees.Add(
                  new Attendee
                  {
                      EmailAddress = new EmailAddress
                      {
                          Address = roomEmail,
                          Name = placesRequest.Where(x => x.AdditionalData["emailAddress"].ToString() == roomEmail).FirstOrDefault().DisplayName
                      },
                      Type = AttendeeType.Optional
                  }
                );
            }

            var @event = new Event
            {
                Subject = scheduleUsingServiceAccount ? $"{graphEventDTO.EventTitle} - Requested by: {graphEventDTO.UserEmail}" : graphEventDTO.EventTitle,
                IsAllDay = graphEventDTO.IsAllDay,
                Body = new ItemBody
                {
                    ContentType = BodyType.Html,
                    Content = graphEventDTO.EventDescription
                },
                Start = new DateTimeTimeZone
                {
                    DateTime = graphEventDTO.Start,
                    TimeZone = "Eastern Standard Time"
                },
                End = new DateTimeTimeZone
                {
                    DateTime = graphEventDTO.End,
                    TimeZone = "Eastern Standard Time"
                },
                Attendees = attendees

            };

            if (graphEventDTO.RoomEmails.Any())
            {

                Location location = new Location
                {
                    DisplayName = placesRequest.Where(x => x.AdditionalData["emailAddress"].ToString() == graphEventDTO.RoomEmails[0]).FirstOrDefault().DisplayName
                };

                @event.Location = location;
            }

            var result = await _appClient.Users[graphEventDTO.RequesterEmail].Calendars[calendar.Id].Events
              .Request()
              .AddAsync(@event);

            return result;

        }

        public static async Task DeleteEvent(string eventLookup, string coordinatorEmail)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");
            string derivedCoordinatorEmail = coordinatorEmail;
            
            if(!coordinatorEmail.EndsWith(GetEEMServiceAccount().Split('@')[1])){
               derivedCoordinatorEmail = GetEEMServiceAccount();
            }
            await _appClient.Users[derivedCoordinatorEmail].Events[eventLookup]
              .Request()
              .DeleteAsync();

        }

        public static async Task SendEmail(string[] emails, string subject, string body)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var recipients = new List<Recipient>();
            foreach (var email in emails)
            {
                recipients.Add(new Recipient
                {
                    EmailAddress = new EmailAddress
                    {
                        Address = email
                    }
                });
            }

            var message = new Message
            {
                Subject = subject,
                Body = new ItemBody
                {
                    ContentType = BodyType.Html,
                    Content = body
                },
                ToRecipients = recipients
            };


            var saveToSentItems = false;

            await _appClient.Users[_settings.ServiceAccount]
                .SendMail(message, saveToSentItems)
                .Request()
                .PostAsync();
        }

        public static async Task<string> UploadFile(IFormFile formFile)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            string driveId = "b!sB224mbW40CtLh0K-vrTZMJ_CgvYWRBFkMFokh0D75a1UUT0OqczQJushpzJYovM";
            string  parentId = "01FDTK6DIAR6MYJEVEKBBKPGF2KJPB662E";
            string fileName = formFile.FileName;

 Stream ms = new MemoryStream();

               using (ms = new MemoryStream()) //this keeps the stream open
                {
                    await formFile.CopyToAsync(ms);
                    ms.Seek(0, SeekOrigin.Begin);
                    var buf2 = new byte[ms.Length];
                    ms.Read(buf2, 0, buf2.Length);
                    ms.Position = 0; // Very important!! to set the position at the beginning of the stream
                    DriveItem uploadedFile = null;


                uploadedFile = await _appClient.Drives[driveId]
                                         .Items[parentId]
                                         .ItemWithPath(fileName)
                                         .Content.Request()
                                         .PutAsync<DriveItem>(ms);

                    ms.Dispose(); //clears memory
                    return uploadedFile.WebUrl; //returns a DriveItem. 
        }
        }
    }
}