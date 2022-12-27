using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string RouteName { get; set; }
        public string IMCColor {get; set;}
        public bool IncludeInIMC {get; set;}
        public List<Activity> Activities { get; set; }
    }
}
