using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Tickets
{
    public class TicketDTO
    {
        public string Title { get; set; }
        public string Start { get; set; }
        public string End { get; set; }

        public string Room { get; set; }

        public string Comments { get; set; }
    }
}
