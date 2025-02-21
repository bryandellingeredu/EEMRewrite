using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphSchedules
{
    public class CheckForSetUpTearDownDoubleBookingDTO
    {
        public string Start { get; set; }
        public string End { get; set; }
        public string Type { get; set; }
        public string Minutes { get; set; }

        public Recurrence? Recurrence { get; set; }

        public string[] RoomEmails { get; set; }


    }
}
