using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class ActivitySearchParams
    {
        public string Title { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
        public string[] CategoryIds { get; set; }
    }
}
