using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EnlistedAide
{
    public class EnlistedAideConfirmationDTO
    {
        public Guid Id { get; set; }
        public bool EnlistedAideAcknowledged { get; set; }
        public string EnlistedAideNumOfBartenders { get; set; }
        public string EnlistedAideNumOfServers { get; set; }
        public string EnlistedAideSupportNeeded { get; set; }
    }
}
