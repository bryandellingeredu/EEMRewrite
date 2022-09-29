using Azure.Identity;
using Microsoft.Graph.Beta;


namespace GraphBeta
{
    public class BetaGraphHelper
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


    }
}
