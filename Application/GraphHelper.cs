namespace Application
{
    using Application.Activities;
    using Application.GraphSchedules;
    using Azure.Identity;
    using Domain;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Caching.Memory;
    using Microsoft.Graph;
    using System;
    using System.IO;
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
        public static Task<Event> GetEventAsync(string email, string id)
        {

                EnsureGraphForAppOnlyAuth();
                _ = _appClient ??
                  throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

                return _appClient.Users[email].Events[id]
                  .Request()
                  .GetAsync();
           
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

        /*     public static Task<ICalendarGetScheduleCollectionPage> GetScheduleAsync(ScheduleRequestDTO scheduleRequestDTO)
             {
                 EnsureGraphForAppOnlyAuth();
                 _ = _appClient ??
                   throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

                 return _appClient.Users[scheduleRequestDTO.Schedules[0]].Calendar
                   .GetSchedule(scheduleRequestDTO.Schedules, scheduleRequestDTO.EndTime, scheduleRequestDTO.StartTime, scheduleRequestDTO.AvailabilityViewInterval)
                   .Request()
                   .Header("Prefer", "outlook.timezone=\"Eastern Standard Time\"")
                   .PostAsync();
             }  */

        public static async Task<ICalendarGetScheduleCollectionPage> GetScheduleAsync(ScheduleRequestDTO scheduleRequestDTO)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
              throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var scheduleGroups = scheduleRequestDTO.Schedules.SplitIntoGroups(100);
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

        public static async Task<Event> CreateTeamsMeeting(GraphEventDTO graphEventDTO)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                  throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var calendar = await _appClient.Users[graphEventDTO.RequesterEmail].Calendar
              .Request()
              .GetAsync();

            List<Attendee> attendees = new List<Attendee>
    {
        new Attendee
        {
            EmailAddress = new EmailAddress
            {
                Address = graphEventDTO.RequesterEmail,
                Name = graphEventDTO.RequesterFirstName + " " + graphEventDTO.RequesterLastName,
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
                      DisplayName = graphEventDTO.RoomEmails.Any() ? await GetRoomNames(graphEventDTO.RoomEmails) : "Teams Meeting Only"
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


            var createdEvent = await _appClient.Users[graphEventDTO.RequesterEmail].Calendars[calendar.Id].Events
              .Request()
              .AddAsync(@event);


            return createdEvent;
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
                    else if (directoryObject is Group group)
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
                        else if (directoryObject is Group group)
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



        public static async Task UpdateTeamsMeeting(GraphEventDTO graphEventDTO, string eventId)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            // Fetch the existing event
            var existingEvent = await _appClient.Users[graphEventDTO.RequesterEmail].Events[eventId]
                .Request()
                .GetAsync();

            if (existingEvent == null || string.IsNullOrEmpty(existingEvent.Id))
            {
                throw new Exception("Team Event Not Found.");
            }


            // Update event details
            existingEvent.IsOnlineMeeting = true;
            existingEvent.OnlineMeetingProvider = OnlineMeetingProviderType.TeamsForBusiness;

            existingEvent.Location = new Microsoft.Graph.Location
            {
                DisplayName = graphEventDTO.RoomEmails.Any() ? await GetRoomNames(graphEventDTO.RoomEmails) : "Teams Meeting Only"
            };
            existingEvent.Subject = $"{graphEventDTO.EventTitle} (Teams Meeting)";
            existingEvent.IsAllDay = graphEventDTO.IsAllDay;
            existingEvent.Body = new ItemBody
            {
                ContentType = BodyType.Html,
                Content = graphEventDTO.EventDescription
            };
            existingEvent.Start = new DateTimeTimeZone
            {
                DateTime = graphEventDTO.Start,
                TimeZone = "Eastern Standard Time"
            };
            existingEvent.End = new DateTimeTimeZone
            {
                DateTime = graphEventDTO.End,
                TimeZone = "Eastern Standard Time"
            };


            // Update the attendees
            List<Attendee> attendees = new List<Attendee>
    {
        new Attendee
        {
            EmailAddress = new EmailAddress
            {
                Address = graphEventDTO.RequesterEmail,
                Name = graphEventDTO.RequesterFirstName + " " + graphEventDTO.RequesterLastName,
            },
            Type = AttendeeType.Required
        }
    };
            foreach (var invitee in graphEventDTO.TeamInvites)
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
            existingEvent.Attendees = attendees;

            // Update the event
            await _appClient.Users[graphEventDTO.RequesterEmail].Events[eventId]
                .Request()
                .UpdateAsync(existingEvent);

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

        public static async Task DeleteTeamsMeeting(string teamId, string requesterEmail)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            try
            {
                await _appClient.Users[requesterEmail].Events[teamId]
                    .Request()
                    .DeleteAsync();
            }
            catch (ServiceException ex)
            {
                // Log the exception or handle it further here if needed
                throw ex;
            }
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

                return result;
            }
            catch (Exception ex)
            {

                throw;
            }
          

        }

        public static async Task UpdateEventTitle(string eventId, string title, string requesterEmail)
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ??
                throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            // Get the event
            var @event = await _appClient.Users[requesterEmail].Events[eventId]
                .Request()
                .GetAsync();

            // Update the title
            @event.Subject = title;

            // Update the event
            await _appClient.Users[requesterEmail].Events[eventId]
                .Request()
                .UpdateAsync(@event);
        }

        public static async Task<bool> DeleteEvent(string eventLookup, string coordinatorEmail)
        {
            try
            {
                EnsureGraphForAppOnlyAuth();
                _ = _appClient ??
                    throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

                string derivedCoordinatorEmail = coordinatorEmail;

                if (!coordinatorEmail.EndsWith(GetEEMServiceAccount().Split('@')[1]))
                {
                    derivedCoordinatorEmail = GetEEMServiceAccount();
                }

                await _appClient.Users[derivedCoordinatorEmail].Events[eventLookup]
                    .Request()
                    .DeleteAsync();

                return true; // Return true if delete is successful
            }
            catch (Exception)
            {
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