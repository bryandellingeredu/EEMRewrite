namespace Application
{
    using Application.Activities;
    using Application.Core;
    using Application.Emails;
    using Application.GraphSchedules;
    using Application.RoomReport;
    using Azure.Identity;
    using Domain;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Http.HttpResults;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Caching.Memory;
    using Microsoft.Extensions.Logging;
    using Microsoft.Graph;
    using Persistence.Migrations;
    using System;
    using System.Globalization;
    using System.IO;
    using System.Text.RegularExpressions;
    using static System.Net.WebRequestMethods;
    using File = File;

    public class GraphHelper
    {
        private static Settings _settings;
        private static IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        private static readonly string RoomsCacheKey = "RoomsCacheKey";

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

        public static async Task<List<TextValueUser>> GetAllUsersTextValueAsync()
        {
            const string cacheKey = "AllUsers";
            if (!_cache.TryGetValue(cacheKey, out List<TextValueUser> users))
            {
                EnsureGraphForAppOnlyAuth();
                _ = _appClient ?? throw new NullReferenceException("Graph has not been initialized for app-only auth");

                users = new List<TextValueUser>();
                IGraphServiceUsersCollectionPage usersPage = await _appClient.Users
                    .Request()
                    .Select(u => new {
                        u.DisplayName,
                        u.Mail,
                        u.UserType,
                    })
                    .GetAsync();

                if (usersPage?.Count > 0)
                {
                    // Map and add the first page of results to your list
                    users.AddRange(
                        FilterGraphUsers(usersPage.CurrentPage)
                    );

                    // Get and map additional pages
                    while (usersPage.NextPageRequest != null)
                    {
                        usersPage = await usersPage.NextPageRequest.GetAsync();
                        users.AddRange(
                            FilterGraphUsers(usersPage.CurrentPage)
                        );
                    }
                }

                // Fetch distribution groups
                var groupsPage = await _appClient.Groups
                    .Request()
                   // .Filter("groupTypes/any(a:a eq 'Unified')")
                    .Select(g => new {
                        g.DisplayName,
                        g.Id
                    })
                    .GetAsync();

                do
                {
                    foreach (var group in groupsPage.CurrentPage)
                    {
                        users.Add(new TextValueUser
                        {
                            DisplayName = group.DisplayName,
                            Email = group.Id  // using Id as the Email for groups
                        });
                    }
                    if (groupsPage.NextPageRequest != null)
                    {
                        groupsPage = await groupsPage.NextPageRequest.GetAsync();
                    }
                } while (groupsPage.NextPageRequest != null);

                var cacheEntryOptions = new MemoryCacheEntryOptions
                {
                    // Cache for 24 hours
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
                };
                _cache.Set(cacheKey, users, cacheEntryOptions);
            }

            return users;
        }



        private static IEnumerable<TextValueUser> FilterGraphUsers(IEnumerable<User> usersPage)
        {
            return usersPage
                .Where(u =>
                    (string.IsNullOrEmpty(u.UserType) || u.UserType.Equals("Member")) &&
                    !string.IsNullOrEmpty(u.Mail) &&
                    !u.Mail.Contains("USAWC") &&
                    !u.Mail.Contains("Bldg") &&
                    !u.Mail.Contains("bldg") 
                )
                .Select(u => new TextValueUser { DisplayName = u.DisplayName, Email = u.Mail, });
        }

       

        private static IEnumerable<TextValueUser> FilterUsers(IEnumerable<User> usersPage)
        {
            return usersPage
                .Where(u =>
                    (string.IsNullOrEmpty(u.UserType) || u.UserType.Equals("Member")) &&
                    !string.IsNullOrEmpty(u.Mail) &&
                    !u.Mail.Contains("USAWC") &&
                    !u.Mail.Contains("Bldg")
                )
                .Select(u => new TextValueUser { DisplayName = u.DisplayName, Email = u.Mail});
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


        public static async Task<Event> GetEventAsync(string email, string id, string lastUpdatedBy, string createdBy, string eventCalendarId, string eventCalendarEmail)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var eventLookup = id;

            if (!string.IsNullOrEmpty(eventCalendarId) && !string.IsNullOrEmpty(eventCalendarEmail))
            {
                try
                {
                    Event @event = await _appClient.Users[eventCalendarEmail].Calendars[eventCalendarId].Events[eventLookup].Request().GetAsync();
                    if (@event != null)
                    {
                         var filteredAttendees = @event.Attendees
                                 .Where(attendee => attendee.Status.Response != ResponseType.Declined)
                                 .ToList();

                            @event.Attendees = filteredAttendees;
                            return @event;
                       
                    }
                }
                catch
                {
                    //continue
                }
            }

            string[] possibleEmails = new[] { GetEEMServiceAccount(), email, lastUpdatedBy, createdBy, eventCalendarEmail };

            foreach (var mail in possibleEmails)
            {
                if (mail != null)
                {
                    try
                    {
                        // Assuming id is used as the event lookup key
                        Event @event = await _appClient.Users[mail].Events[eventLookup].Request().GetAsync();
                        if (@event != null)
                        {
                             var filteredAttendees = @event.Attendees
                                 .Where(attendee => attendee.Status.Response != ResponseType.Declined)
                                 .ToList();

                            @event.Attendees = filteredAttendees;
                            return @event;
                        }
                    }
                    catch (Microsoft.Graph.ServiceException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        // Event not found, continue checking next possible email
                        continue;
                    }
                }
            }

            // Return null if event is not found for any of the provided emails
            throw new InvalidOperationException("Event not found for any of the provided emails.");
        }

        public static async Task<IGraphServicePlacesCollectionPage> GetRoomsAsync()
        {
   

            if (!_cache.TryGetValue(RoomsCacheKey, out IGraphServicePlacesCollectionPage cachedRooms))
            {
                EnsureGraphForAppOnlyAuth();
                _ = _appClient ??
                  throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

                var roomUrl = _appClient.Places.AppendSegmentToRequestUrl("microsoft.graph.room");
                var options = new List<Option>
            {
                new QueryOption("$top", "200")
            };
                cachedRooms = await new GraphServicePlacesCollectionRequest(roomUrl, _appClient, options).GetAsync();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromHours(24)); // Set cache to expire after 1 hour, adjust as necessary

                _cache.Set(RoomsCacheKey, cachedRooms, cacheEntryOptions);
            }

            return cachedRooms;
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

  

        public static async Task<ICalendarGetScheduleCollectionPage> GetScheduleAsync(ScheduleRequestDTO scheduleRequestDTO)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var scheduleGroups = scheduleRequestDTO.Schedules.SplitIntoGroups(55);
            var combinedResult = new CalendarGetScheduleCollectionPage();
            foreach (var scheduleGroup in scheduleGroups)
            {
                var scheduleRequest = new ScheduleRequestDTO
                {
                    Schedules = scheduleGroup,
                    StartTime = scheduleRequestDTO.StartTime,
                    EndTime = scheduleRequestDTO.EndTime,
                    AvailabilityViewInterval = scheduleRequestDTO.AvailabilityViewInterval
                };

                int retries = 3;
                bool success = false;
                while (retries > 0 && !success)
                {
                    try
                    {
                        var scheduleResult = await _appClient.Users[scheduleGroup[0]].Calendar
                          .GetSchedule(scheduleRequest.Schedules, scheduleRequest.EndTime, scheduleRequest.StartTime, scheduleRequest.AvailabilityViewInterval)
                          .Request()
                          .Header("Prefer", "outlook.timezone=\"Eastern Standard Time\"")
                          .PostAsync();

                        foreach (var schedule in scheduleResult)
                        {
                            combinedResult.Add(schedule);
                        }

                        success = true;
                    }
                    catch (Exception)
                    {
                        retries--;
                        if (retries > 0)
                        {
                            var delay = (int)Math.Pow(2, 3 - retries); // 2^0 = 1 second for first retry, 2^1 = 2 seconds for second retry, 2^2 = 4 seconds for final retry
                            await Task.Delay(TimeSpan.FromSeconds(delay));
                        }
                        else
                        {
                            //   throw new Exception("Failed to get schedule after 3 attempts.", ex);
                            return new CalendarGetScheduleCollectionPage();
                        }
                    }
                }
            }
            return combinedResult;
        }

        public static async Task<Event> CreateTeamsMeeting(GraphEventDTO graphEventDTO, string teamOwner)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                  throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var address = string.IsNullOrEmpty(teamOwner) ? graphEventDTO.RequesterEmail : teamOwner;
            var name = string.IsNullOrEmpty(teamOwner) ? graphEventDTO.RequesterEmail : graphEventDTO.RequesterFirstName + " " + graphEventDTO.RequesterLastName;

            var calendar = await _appClient.Users[address].Calendar
              .Request()
              .GetAsync();



            List<Attendee> attendees = new List<Attendee>


            {
        new Attendee
        {
            EmailAddress = new EmailAddress
            {
                Address = address,
                Name = name,
            },
            Type = AttendeeType.Required
        }
    };

            foreach (var invitee in graphEventDTO.TeamInvites)
            {
                // If invitee.Email is actually a distribution list ID
                if (IsDistributionListId(invitee.Email))
                {
                    // Expand the distribution list to get all email addresses
                    var distributionListMembers = await ExpandDistributionList(invitee.Email);

                    foreach (var member in distributionListMembers)
                    {
                        attendees.Add(
                            new Attendee
                            {
                                EmailAddress = new EmailAddress
                                {
                                    Address = member.Email,
                                    Name = member.DisplayName
                                },
                                Type = AttendeeType.Optional
                            }
                        );
                    }
                }
                else
                {
                    attendees.Add(
                        new Attendee
                        {
                            EmailAddress = new EmailAddress
                            {
                                Address = invitee.Email,
                                Name = invitee.DisplayName
                            },
                            Type = AttendeeType.Optional
                        }
                    );
                }
            }

            var @event = new Event
            {
                Subject = $"{graphEventDTO.EventTitle} (Teams Meeting)",


                Location = new Microsoft.Graph.Location
                {
                      DisplayName = graphEventDTO.RoomEmails.Any() ? await GetRoomNames(graphEventDTO.RoomEmails) : 
                      string.IsNullOrEmpty(graphEventDTO.PrimaryLocation) ? "Teams Meeting Only" : graphEventDTO.PrimaryLocation
                },


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
                Attendees = attendees,
                IsOnlineMeeting = true,
                OnlineMeetingProvider = OnlineMeetingProviderType.TeamsForBusiness
            };


            var createdEvent = await _appClient.Users[address].Calendars[calendar.Id].Events
              .Request()
              .AddAsync(@event);

       
            try
            {
                Event fullEvent = null;
                int maxRetries = 10;
                int delay = 1000; // 1 seconds
                bool onlineMeetingAvailable = false;

                for (int i = 0; i < maxRetries; i++)
                {
                    // Fetch the event again to get all properties including the Teams link
                    fullEvent = await _appClient.Users[address].Calendars[calendar.Id].Events[createdEvent.Id]
                        .Request()
                        .GetAsync();

                    // Check if the OnlineMeeting details are available
                    if (fullEvent.OnlineMeeting != null && !string.IsNullOrEmpty(fullEvent.OnlineMeeting.JoinUrl))
                    {
                        onlineMeetingAvailable = true;
                        break;
                    }

                    // Wait before retrying
                    await Task.Delay(delay);
                }

                if (!onlineMeetingAvailable)
                {
                    throw new Exception("Online meeting details are not available after multiple attempts.");
                }

                return fullEvent;

            }
            catch (Exception ex)
            {
                // Log or handle the exception as needed
                Console.WriteLine($"An error occurred while fetching the full event: {ex.Message}");
                throw; // Re-throw the exception if you want to propagate it further
            }

         

        }

        private async static Task<string> GetRoomNames(string[] roomEmails)
        {
            var allRooms = await GetRoomsAsync();

            // Filter rooms based on provided emails and extract their names
            var roomNames = allRooms
                .Where(room => roomEmails.Any(email => string.Equals(email, room.AdditionalData["emailAddress"]?.ToString(), StringComparison.OrdinalIgnoreCase)))
                .Select(room => room.DisplayName);

            // Join names into a semicolon-separated string
            return string.Join(";", roomNames);
        }

        private static async Task<List<TextValueUser>> ExpandDistributionList(string id)
        {
            List<TextValueUser> allMembers = new List<TextValueUser>();

            var membersPage = await _appClient.Groups[id].Members
                .Request()
                .GetAsync();

            if (membersPage?.Count > 0)
            {
                foreach (var directoryObject in membersPage.CurrentPage)
                {
                    if (directoryObject is User user)
                    {
                        allMembers.Add(new TextValueUser
                        {
                            Email = user.Mail,
                            DisplayName = user.DisplayName
                        });
                    }
                    else if (directoryObject is Microsoft.Graph.Group group)
                    {
                        allMembers.Add(new TextValueUser
                        {
                            Email = group.Mail,
                            DisplayName = group.DisplayName
                        });
                    }
                    // Add handling for other types if necessary
                }

                // Handle pagination
                while (membersPage.NextPageRequest != null)
                {
                    membersPage = await membersPage.NextPageRequest.GetAsync();

                    foreach (var directoryObject in membersPage.CurrentPage)
                    {
                        if (directoryObject is User user)
                        {
                            allMembers.Add(new TextValueUser
                            {
                                Email = user.Mail,
                                DisplayName = user.DisplayName
                            });
                        }
                        else if (directoryObject is Microsoft.Graph.Group group)
                        {
                            allMembers.Add(new TextValueUser
                            {
                                Email = group.Mail,
                                DisplayName = group.DisplayName
                            });
                        }
                        // Add handling for other types if necessary
                    }
                }
            }

            return allMembers;
        }
        private static bool IsDistributionListId(string emailOrId)
        {
            return !emailOrId.Contains("@"); 
        }



        public static async Task UpdateTeamsMeeting(GraphEventDTO graphEventDTO, string eventId, string teamOwner)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            // Fetch the existing event
            var eventLookup = eventId;
            var address = string.IsNullOrEmpty(teamOwner) ? graphEventDTO.RequesterEmail : teamOwner;
            var name = string.IsNullOrEmpty(teamOwner) ? graphEventDTO.RequesterEmail : graphEventDTO.RequesterFirstName + " " + graphEventDTO.RequesterLastName;

            string[] possibleEmails = new[] { teamOwner, graphEventDTO.RequesterEmail, GetEEMServiceAccount() };
            string calendarEmail = string.Empty;

            Event existingEvent = null;

            foreach (var mail in possibleEmails)
            {
                if (!string.IsNullOrEmpty(mail))
                {
                    try
                    {
                        Event @event = await _appClient.Users[mail].Events[eventLookup].Request().GetAsync();
                        if (@event != null)
                        {
                            existingEvent = @event;
                            calendarEmail = mail;
                            break; // Exit the loop if event is found
                        }
                    }
                    catch (Microsoft.Graph.ServiceException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        // Event not found, continue checking next possible email
                        continue;
                    }
                }
            }

            if (existingEvent == null || string.IsNullOrEmpty(existingEvent.Id))
            {
                throw new Exception("Team Event Not Found.");
            }

            // Compare existing event details with the new details
            bool isUpdateRequired = false;

            // Create an object to hold the updates
            var patchEvent = new Event();

            // Preserve online meeting information if it exists
            if (existingEvent.OnlineMeeting != null)
            {
                patchEvent.OnlineMeeting = existingEvent.OnlineMeeting;
            }

            // Check Location
            string newLocation = graphEventDTO.RoomEmails.Any() ? await GetRoomNames(graphEventDTO.RoomEmails) :
                string.IsNullOrEmpty(graphEventDTO.PrimaryLocation) ? "Teams Meeting Only" : graphEventDTO.PrimaryLocation;

            if (existingEvent.Location?.DisplayName != newLocation)
            {
                patchEvent.Location = new Microsoft.Graph.Location { DisplayName = newLocation };
                isUpdateRequired = true;
            }

            // Check Subject
            if (existingEvent.Subject != $"{graphEventDTO.EventTitle} (Teams Meeting)")
            {
                patchEvent.Subject = $"{graphEventDTO.EventTitle} (Teams Meeting)";
                isUpdateRequired = true;
            }

            // Check IsAllDay
            if (existingEvent.IsAllDay != graphEventDTO.IsAllDay)
            {
                patchEvent.IsAllDay = graphEventDTO.IsAllDay;
                isUpdateRequired = true;
            }

            // Always include the body content, otherwise the teams meeting in outlook goes away
            string existingBodyContent = existingEvent.Body?.Content ?? string.Empty;

            patchEvent.Body = new ItemBody
            {
                ContentType = BodyType.Html,
                Content = existingBodyContent
            };

            // Convert Start and End times to UTC for comparison
            DateTime graphEventStartUtc = DateTime.Parse(graphEventDTO.Start);
            DateTime graphEventEndUtc = DateTime.Parse(graphEventDTO.End);

            DateTime existingEventStartUtc = DateTime.Parse(existingEvent.Start.DateTime);
            DateTime existingEventEndUtc = DateTime.Parse(existingEvent.End.DateTime);

            // Check Start and End Time
            if (existingEventStartUtc != graphEventStartUtc)
            {
                patchEvent.Start = new DateTimeTimeZone { DateTime = graphEventDTO.Start, TimeZone = "Eastern Standard Time" };
                isUpdateRequired = true;
            }

            if (existingEventEndUtc != graphEventEndUtc)
            {
                patchEvent.End = new DateTimeTimeZone { DateTime = graphEventDTO.End, TimeZone = "Eastern Standard Time" };
                isUpdateRequired = true;
            }

            // Check Attendees
            List<string> newAttendees = new List<string> { address }.Concat(graphEventDTO.TeamInvites.Select(i => i.Email)).ToList();
            List<string> existingAttendees = existingEvent.Attendees?.Select(a => a.EmailAddress.Address).ToList() ?? new List<string>();

            if (!new HashSet<string>(newAttendees).SetEquals(existingAttendees))
            {
                patchEvent.Attendees = newAttendees.Select(email => new Attendee
                {
                    EmailAddress = new EmailAddress { Address = email }
                }).ToList();
                isUpdateRequired = true;
            }

            // If no changes are detected, skip the update
            if (!isUpdateRequired)
            {
                return;
            }

            // If update is required, perform the PATCH request
            await _appClient.Users[calendarEmail].Events[eventId].Request().UpdateAsync(patchEvent);
        }


        public static async Task<List<TextValueUser>> GetTeamsEventAttendees(string eventId, string excludedEmail)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                  throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            // Fetch the event by its ID
            var @event = await _appClient.Users[excludedEmail].Events[eventId]
              .Request()
              .GetAsync();

            List<TextValueUser> attendeesList = new List<TextValueUser>();

            // Iterate through the attendees
            foreach (var attendee in @event.Attendees)
            {
                // Exclude the given email from the list
                if (attendee.EmailAddress.Address.ToLower() != excludedEmail.ToLower())
                {
                    attendeesList.Add(new TextValueUser
                    {
                        DisplayName = attendee.EmailAddress.Name,
                        Email = attendee.EmailAddress.Address
                    });
                }
            }

            return attendeesList;
        }

        public static async Task DeleteTeamsMeeting(string teamId, string requesterEmail, string teamOwner)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var eventLookup = teamId;

            string[] possibleEmails = new[] { teamOwner, requesterEmail, GetEEMServiceAccount() };
            string calendarEmail = string.Empty;

            Event existingEvent = null;

            foreach (var mail in possibleEmails)
            {
                if (!string.IsNullOrEmpty(mail))
                {
                    try
                    {
                        // Assuming id is used as the event lookup key
                        Event @event = await _appClient.Users[mail].Events[eventLookup].Request().GetAsync();
                        if (@event != null)
                        {
                            existingEvent = @event;
                            calendarEmail = mail;
                        }
                    }
                    catch (Microsoft.Graph.ServiceException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        // Event not found, continue checking next possible email
                        continue;
                    }
                }
            }

            try
            {
                if (existingEvent != null)
                {
                    await _appClient.Users[calendarEmail].Events[eventLookup]
                        .Request()
                        .DeleteAsync();
                }
            }
            catch (ServiceException ex)
            {
                // Log the exception or handle it further here if needed
                throw ex;
            }
        }

        public static async Task<Event> UpdateEvent(GraphEventDTO graphEventDTO)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
            DateTime graphEventStartEst = DateTime.Parse(graphEventDTO.Start);
            DateTime graphEventEndEst = DateTime.Parse(graphEventDTO.End);
            DateTime graphEventStartUtc = TimeZoneInfo.ConvertTimeToUtc(graphEventStartEst, easternZone);
            DateTime graphEventEndUtc = TimeZoneInfo.ConvertTimeToUtc(graphEventEndEst, easternZone);

            string calendarId = string.Empty;
            string calendarEmail = string.Empty;
            var roomUrl = _appClient.Places.AppendSegmentToRequestUrl("microsoft.graph.room") + "?$top=200";
            var placesRequest = await new GraphServicePlacesCollectionRequest(roomUrl, _appClient, null).GetAsync();

            if (!string.IsNullOrEmpty(graphEventDTO.EventLookup)) // there is an existing outlook event lets try and find it.
            {
  

                string[] possibleEmails = new[] { graphEventDTO.EventCalendarEmail, GetEEMServiceAccount(), graphEventDTO.CreatedBy, graphEventDTO.Updated, graphEventDTO.UserEmail, graphEventDTO.Coordinator};
                // get the rooms

                foreach (var email in possibleEmails)
                {
                    if (email != null)
                    {
                        try
                        {
                            var @event = await _appClient.Users[email].Events[graphEventDTO.EventLookup].Request().GetAsync();
                            if (@event != null)
              
                            {
                            
                                calendarEmail = email;
                                var calendar = await _appClient.Users[calendarEmail].Calendar.Request().GetAsync();
                                var attendeeList = @event.Attendees.ToList();
                                var existingAttendeeEmails = attendeeList.Select(a => a.EmailAddress.Address).ToList();
                                var existingRoomEmails = attendeeList.Where(a => a.Type == AttendeeType.Optional).Select(a => a.EmailAddress.Address);
                                var roomsToRemove = existingRoomEmails.Where(existingRoom => !graphEventDTO.RoomEmails.Contains(existingRoom)).ToList();
                                var roomsToAdd = graphEventDTO.RoomEmails.Where(newRoom => !existingRoomEmails.Contains(newRoom)).ToList();

                                attendeeList.RemoveAll(a => a.Type == AttendeeType.Optional && roomsToRemove.Contains(a.EmailAddress.Address));

                                foreach (var roomEmail in roomsToAdd)
                                {
                                    attendeeList.Add(new Attendee
                                    {
                                        EmailAddress = new EmailAddress
                                        {
                                            Address = roomEmail,
                                            Name = roomEmail 
                                        },
                                        Type = AttendeeType.Optional 
                                    });
                                }


                                bool isUpdated = false;

                                // Create a new Event object to hold only the changes
                                var patchEvent = new Event();

                                // Check if Subject has changed
                                if (@event.Subject != graphEventDTO.EventTitle)
                                {
                                    patchEvent.Subject = graphEventDTO.EventTitle;
                                    isUpdated = true;
                                }

                                // Check if IsAllDay has changed
                                if (@event.IsAllDay != graphEventDTO.IsAllDay)
                                {
                                    patchEvent.IsAllDay = graphEventDTO.IsAllDay;
                                    isUpdated = true;
                                }

                                // Check if Body content or content type has changed

                                string StripHtmlTags(string input)
                                {
                                    return Regex.Replace(input, "<.*?>", string.Empty);
                                }

                                // Check if Body content or content type has changed
                                string existingBodyPlainText = StripHtmlTags(@event.Body?.Content ?? string.Empty).Trim();
                                string graphEventDescriptionPlainText = graphEventDTO.EventDescription.Trim();

                                if (existingBodyPlainText != graphEventDescriptionPlainText )
                                {
                                    patchEvent.Body = new ItemBody
                                    {
                                        ContentType = BodyType.Html,
                                        Content = graphEventDTO.EventDescription
                                    };
                                    isUpdated = true;
                                }

                                // Convert Start and End times to UTC for comparison
                                DateTime eventStartUtc = DateTime.MinValue;
                                if (@event.Start?.DateTime != null)
                                {
                                    eventStartUtc = DateTime.Parse(@event.Start.DateTime);
                                }

                                if (eventStartUtc != graphEventStartUtc)
                                {
                                    patchEvent.Start = new DateTimeTimeZone
                                    {
                                        DateTime = graphEventDTO.Start,
                                        TimeZone = "Eastern Standard Time"
                                    };
                                    isUpdated = true;
                                }

                                DateTime eventEndUtc = DateTime.MinValue;
                                if (@event.End?.DateTime != null)
                                {
                                    eventEndUtc = DateTime.Parse(@event.End.DateTime);
                                }

                                if (eventEndUtc != graphEventEndUtc)
                                {
                                    patchEvent.End = new DateTimeTimeZone
                                    {
                                        DateTime = graphEventDTO.End,
                                        TimeZone = "Eastern Standard Time"
                                    };
                                    isUpdated = true;
                                }

                                // Check if Attendees need to be updated
                                if (roomsToAdd.Any() || roomsToRemove.Any())
                                {
                                    patchEvent.Attendees = attendeeList;
                                    isUpdated = true;
                                }

                                // Only send PATCH request if there are changes
                                if (isUpdated)
                                {
                                    // Use PATCH request with only the modified properties
                                    var result = await _appClient.Users[email]
                                                                 .Events[@event.Id]
                                                                 .Request()
                                                                 .UpdateAsync(patchEvent);

                                    // Fetch the updated event with expanded properties
                                    var expandedEvent = await _appClient.Users[email]
                                                                        .Calendars[calendar.Id]
                                                                        .Events[result.Id]
                                                                        .Request()
                                                                        .Expand("calendar")
                                                                        .GetAsync();

                                    return expandedEvent;
                                }
                                else
                                {
                                    // No changes, fetch the existing event
                                    var expandedEvent = await _appClient.Users[email]
                                                                        .Calendars[calendar.Id]
                                                                        .Events[graphEventDTO.EventLookup]
                                                                        .Request()
                                                                        .Expand("calendar")
                                                                        .GetAsync();

                                    return expandedEvent;
                                }


                            }

                        }
                        catch (Microsoft.Graph.ServiceException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                        {
                            continue;
                        }

                    }

                }


            }
            else // there is no existing event we will add a new one
            {
                calendarEmail = graphEventDTO.CreatedBy.EndsWith(GraphHelper.GetEEMServiceAccount().Split('@')[1]) ? graphEventDTO.CreatedBy : GraphHelper.GetEEMServiceAccount();
                var calendar = await _appClient.Users[calendarEmail].Calendar.Request().GetAsync();
                List<Attendee> attendees = new List<Attendee>();
                bool scheduleUsingServiceAccount = calendarEmail == GetEEMServiceAccount();
                attendees.Add(
                    new Attendee
                    {
                        EmailAddress = new EmailAddress
                            {
                                Address = calendarEmail,
                                Name = calendarEmail
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
                    Subject = scheduleUsingServiceAccount ? $"{graphEventDTO.EventTitle} - Requested by: {graphEventDTO.CreatedBy}" : graphEventDTO.EventTitle,
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

                    Microsoft.Graph.Location location = new Microsoft.Graph.Location
                    {
                        DisplayName = placesRequest.Where(x => x.AdditionalData["emailAddress"].ToString() == graphEventDTO.RoomEmails[0]).FirstOrDefault().DisplayName
                    };

                    @event.Location = location;
                }

                var result = await _appClient.Users[calendarEmail].Calendars[calendar.Id].Events
              .Request()
              .AddAsync(@event);

                var expandedEvent = await _appClient.Users[calendarEmail].Calendars[calendar.Id].Events[result.Id]
                .Request()
                .Expand("calendar")
                .GetAsync();

                return expandedEvent;
            }

            return null;

        }


        public static async Task<Event> CreateEvent(GraphEventDTO graphEventDTO)
        {
            try
            {
                EnsureGraphForAppOnlyAuth();
                _ = _appClient ??
                  throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

                // get the id of the calendar
                var calendar = await _appClient.Users[graphEventDTO.RequesterEmail].Calendar
                  .Request()
                  .GetAsync();

                // get the rooms
                var roomUrl = _appClient.Places.AppendSegmentToRequestUrl("microsoft.graph.room") + "?$top=200";
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

                    Microsoft.Graph.Location location = new Microsoft.Graph.Location
                    {
                        DisplayName = placesRequest.Where(x => x.AdditionalData["emailAddress"].ToString() == graphEventDTO.RoomEmails[0]).FirstOrDefault().DisplayName
                    };

                    @event.Location = location;
                }

                var result = await _appClient.Users[graphEventDTO.RequesterEmail].Calendars[calendar.Id].Events
                  .Request()
                  .AddAsync(@event);

                var expandedEvent = await _appClient.Users[graphEventDTO.RequesterEmail].Calendars[calendar.Id].Events[result.Id]
                .Request()
                .Expand("calendar")
                .GetAsync();

                return expandedEvent;
            }
            catch (Exception ex)
            {

                throw;
            }
          

        }

 

        public static async Task UpdateEventTitle(string eventId, string title, string requesterEmail, string lastUpdatedBy, string createdBy, string eventCalendarId)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            if (!string.IsNullOrEmpty(eventCalendarId))
            {
                try
                {
                    Event @evt = await _appClient.Me.Calendars[eventCalendarId].Events[eventId].Request().GetAsync();
                    if (@evt != null)
                    {
                        @evt.Subject = title;

                        await _appClient.Me.Calendars[eventCalendarId].Events[eventId].Request().UpdateAsync(@evt);

                        return; 
                    }
                }
                catch
                {
                    //continue
                }
            }

            string[] possibleEmails = new[] { GetEEMServiceAccount(), requesterEmail,  lastUpdatedBy, createdBy };

            foreach (var email in possibleEmails)
            {
                if(email != null)
                {
                    try
                    {
                        var @event = await _appClient.Users[email].Events[eventId].Request().GetAsync();
                        if(@event != null)
                        {
                            @event.Subject = title;
                            await _appClient.Users[email].Events[eventId].Request().UpdateAsync(@event);
                            return;
                        }  
                    }
                    catch (Microsoft.Graph.ServiceException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        continue;
                    }

                }
               
            }
            throw new InvalidOperationException("Event not found for any of the provided emails or calendar ID.");
        }

        public static async Task<bool> DeleteEvent(string eventLookup, string coordinatorEmail, string oldCoordinatorEmail, string lastUpdatedBy, string createdBy, string eventCalendarId, string eventCalendarEmail)
        {
            try
            {
                EnsureGraphForAppOnlyAuth();
                _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

                if (!string.IsNullOrEmpty(eventCalendarId) && !string.IsNullOrEmpty(eventCalendarEmail))
                {
                    try
                    {
                        Event @event = await _appClient.Users[eventCalendarEmail].Calendars[eventCalendarId].Events[eventLookup].Request().GetAsync();
                        if (@event != null)
                        {
                            await _appClient.Me.Calendars[eventCalendarId].Events[eventLookup]
                        .Request()
                        .DeleteAsync();
                            return true; // Event found and deleted
                        }
                    }
                    catch
                    {
                        //continue
                    }
                }

                string[] possibleEmails = new[] { GetEEMServiceAccount(), coordinatorEmail, oldCoordinatorEmail, lastUpdatedBy, createdBy, eventCalendarEmail };
                Microsoft.Graph.Event eventToDelete = null;
                string calendarUsed = null;

                foreach (var email in possibleEmails)
                {
                    if (email != null)
                    {
                        try
                        {
                            eventToDelete = await _appClient.Users[email].Events[eventLookup].Request().GetAsync();
                            if (eventToDelete != null)
                            {
                                calendarUsed = email;
                                break;
                            }
                        }
                        catch (Microsoft.Graph.ServiceException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                        {
                            // Event not found, continue checking next possible email
                            continue;
                        }
                    }
                }

                if (eventToDelete != null)
                {
                    await _appClient.Users[calendarUsed].Events[eventLookup]
                        .Request()
                        .DeleteAsync();
                    return true; // Event found and deleted
                }

                return false; // No event found across all checks
            }
            catch (Exception ex)
            {
                // Consider logging the exception details here to understand what went wrong
                return false; // Return false if an exception occurs
            }
        }


        public static async Task DeleteRoomCalendarEvents(string roomEmail)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");


            // Get all events from the room calendar
            var roomEvents = await GetRoomEvents(roomEmail);
            foreach (var roomEvent in roomEvents)
            {
                try
                {
                    await _appClient.Users[roomEmail].Events[roomEvent.Id]
                     .Request()
                      .DeleteAsync();
                }
                catch (Exception )
                {
                    // if something goes wrong deleting the event try the next one

                }
            }
        }

        public static async Task<Event[]> GetRoomEvents(string roomEmail)
        {
            var events = await _appClient.Users[roomEmail].CalendarView
              .Request(new List<Option>
              {
              new QueryOption("startDateTime", DateTimeOffset.UtcNow.ToString("o")),
              new QueryOption("endDateTime", DateTimeOffset.UtcNow.AddYears(1).ToString("o"))
              })
              .GetAsync();

            return events.CurrentPage.ToArray();
        }

        public static async Task<Event> ChangeRoomStatus(string id, string roomEmail, string status)
        {
            var existingEvent = await _appClient.Users[roomEmail].Events[id]
                .Request()
                .Select(e => new { e.Attendees })
                .GetAsync();

            var attendeeToUpdate = existingEvent.Attendees.FirstOrDefault(a => a.EmailAddress.Address == roomEmail);

            if (attendeeToUpdate != null)
            {
                // Update the attendee's status
                attendeeToUpdate.Status.Response = status == "Approved" ? ResponseType.Accepted : ResponseType.Declined;
                attendeeToUpdate.Status.Time = DateTimeOffset.Now;

                // Update only the Attendees property of the existing event
                var updatedEvent = await _appClient.Users[roomEmail].Events[id]
                    .Request()
                    .Header("Prefer", "outlook.allow-unsafe-updates=true")
                    .UpdateAsync(existingEvent);

                return updatedEvent;
            }
            else
            {
                // Handle the case where the attendee is not found
                throw new Exception("Attendee not found");
            }
        }

        public static async Task SendSyncCalendarEmail(string[] emails, string subject, string body, string studentType, Activity activity)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var recipients = new List<Recipient>();
            foreach (var email in emails)
            {
                bool addNotification = false;

                if(studentType == "Resident" && !activity.StudentCalendarDistanceGroup1 && !activity.StudentCalendarDistanceGroup2 && !activity.StudentCalendarDistanceGroup3)
                {
                    addNotification = true;
                }

                if(studentType == "Resident" && activity.StudentCalendarResident) addNotification = true;
                if(studentType == "DL24" && activity.StudentCalendarDistanceGroup1) addNotification = true;
                if (studentType == "DL25" && activity.StudentCalendarDistanceGroup2) addNotification = true;
                if (studentType == "DL26" && activity.StudentCalendarDistanceGroup3) addNotification = true;
                if (studentType == "DL27" && activity.StudentCalendarDistanceGroup4) addNotification = true;

                if (string.IsNullOrEmpty(studentType) || studentType == "notastudent") addNotification = true;

                if (!activity.CopiedTostudentCalendar) addNotification = true;

                if (addNotification)
                {
                    recipients.Add(new Recipient
                    {
                        EmailAddress = new EmailAddress
                        {
                            Address = email
                        }
                    });
                }
            
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

            if (recipients.Any())
            {
                await _appClient.Users[_settings.ServiceAccount]
                    .SendMail(message, saveToSentItems)
                    .Request()
                    .PostAsync();
            }
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