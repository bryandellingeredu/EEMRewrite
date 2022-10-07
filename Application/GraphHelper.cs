namespace Application
{
    using Application.Activities;
    using Application.GraphSchedules;
    using Azure.Identity;
    using Microsoft.Graph;
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
                    new[] { "https://graph.microsoft.com/.default" });
            }
        }

        public static Task<IGraphServiceUsersCollectionPage> GetUsersAsync()
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            return _appClient.Users
                .Request()
                .Select(u => new
                {
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

            List<Attendee> attendees = new List<Attendee>()
            {
                 new Attendee
                            {
                                EmailAddress = new EmailAddress
                                {
                                    Address = graphEventDTO.RequesterEmail,
                                    Name = graphEventDTO.RequesterFirstName + " " + graphEventDTO.RequesterLastName,
                                },
                                Type = AttendeeType.Required
                            },
            };

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
                Subject = graphEventDTO.EventTitle,
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
                Location = new Location
                {
                    DisplayName = placesRequest.Where(x => x.AdditionalData["emailAddress"].ToString() == graphEventDTO.RoomEmails[0]).FirstOrDefault().DisplayName
                },
            
                Attendees = attendees
                  
            };

            var result =  await _appClient.Users[graphEventDTO.RequesterEmail].Calendars[calendar.Id].Events
                .Request()
                .AddAsync(@event);

            return result;

        }

        public static async Task DeleteEvent(string eventLookup, string coordinatorEmail)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            await _appClient.Users[coordinatorEmail].Events[eventLookup]
                 .Request()
                 .DeleteAsync();

        }
    }
}
