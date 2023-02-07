using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RoomVTCCoordinator
    {
        public Guid Id { get; set; }
        public string VTCCoordinatorDisplayName {get; set;}
        public string VTCCoordinatorEmail { get; set;}   
        public string RoomEmail { get; set; }
        
        [NotMapped]
        public string RoomName { get; set; }

    }
}
