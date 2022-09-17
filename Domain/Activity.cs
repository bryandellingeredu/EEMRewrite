using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class Activity
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public DateTime Start {get; set;}
        public DateTime End { get; set; }
        public string Category {get; set;}
        public string Description {get; set;}

    }
}