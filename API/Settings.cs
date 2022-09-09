namespace API
{
    public class Settings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string TenantId { get; set; }
        public string AuthTenant { get; set; }
        public string[] GraphUserScopes { get; set; }


        public Settings LoadSettings(IConfiguration config)
        {

            /*   IConfiguration config = new ConfigurationBuilder()
                   .AddJsonFile("appsettings.json", optional: false)
                   .AddJsonFile($"appsettings.Development.json", optional: true)
                   .AddUserSecrets<Program>()
                   .Build();*/
            var c = config.GetRequiredSection("Settings");
            return c.Get<Settings>();
        }
    }
}
