namespace API
{
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
    }
}
