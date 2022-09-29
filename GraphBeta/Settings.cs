using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace GraphBeta
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
            var c = config.GetRequiredSection("Settings");
            return c.Get<Settings>();
        }
    }
}
