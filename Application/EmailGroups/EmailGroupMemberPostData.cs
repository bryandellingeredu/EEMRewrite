using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailGroups
{
    public class EmailGroupMemberPostData
    {
        public Guid Id {get; set;}
        public string Email { get; set;}
        public string DisplayName { get; set; }
        public Guid[] RoleIds { get; set; }
    }
}
