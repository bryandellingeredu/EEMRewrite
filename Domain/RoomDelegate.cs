using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RoomDelegate
    {
        public Guid Id { get; set; }
        public string DelegateEmail { get; set; }   
        public string DelegateDisplayName { get; set; }   
        public string RoomEmail { get; set; }
    }
}
