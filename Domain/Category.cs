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
        public String Name { get; set; }
        public String RouteName { get; set; }
        public List<Activity> Activities { get; set; }
    }
}
