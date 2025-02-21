using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphSchedules
{
    public class CheckForSetUpTearDownDoubleBookingResultDTO
    {
        public bool IsConflict {  get; set; } 
        public string Message { get; set; } 
    }
}
