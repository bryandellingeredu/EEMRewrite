using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Teams
{
    public class TeamDeleteRequestDTO
    {
        public string Id { get; set; }  
        public string TeamRequester { get; set; } 
        public string TeamOwner { get; set; }
    }
}
