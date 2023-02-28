using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
  public class CancelEventDTO
    {
        public Guid ActivityId { get; set; }
        public string Reason { get; set; }
    }
}
