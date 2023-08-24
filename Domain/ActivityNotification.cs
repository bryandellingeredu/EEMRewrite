using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class ActivityNotification
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public string Email { get; set; }
    }
}
